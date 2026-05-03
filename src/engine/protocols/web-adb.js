import { sleep } from "@/engine/helper"
import { toast } from "vue3-toastify"
import { useWorkspaceStore } from "@/store/workspace"
import { BOARD_APP_DIR, appPath } from "@/engine/board-paths"
import BoardProtocol from "./base"
import {
  WrapConsumableStream,
  WrapReadableStream,
} from "@yume-chan/stream-extra"

import { Adb, AdbDaemonTransport, LinuxFileType, encodeUtf8 } from "@yume-chan/adb"
import AdbWebCredentialStore from "@yume-chan/adb-credential-web"
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb"
import { isProxy, toRaw } from "vue"
import SingletonShell from "../SingletonShell"

// Registry of IDE-managed scripts on the board. Stores
// {name: {version, hash}} so subsequent connects can skip the
// upload entirely when nothing's changed since last time. Same
// path/format as the V2 protocol so the on-board layout stays
// uniform.
const SCRIPT_REGISTRY_PATH = "/root/.kbmai_scripts.json"

const startupScript = `#!/bin/sh

[ ! -e /va/run ] && mkdir -p /var/run
mount /mnt/UDISK /root

app="/root/app/main.py"
libmaix="/root/maix_dist/start_app.sh"
maixpy3="/root/maixpy3-9.9.9-cp38-cp38-linux_armv7l.whl"
main="/root/main.py"
swap="/swapfile"

case "$1" in
  start)
        if [ -f "$swap" ]; then
          swapon /swapfile
        fi
        if [ -d "/home/root/" ]; then
          mv /home/root/* /root/
          sync
          rm -rf /home/root/
          sync
        fi
        if [ -d "/home/app/" ]; then
          mv /home/app/ /root/
          sync
        fi
        echo "Starting app..."
        python3 /root/app/startup.py &
#       python -c "from maix import camera, display, image, nn"

        ;;
  stop)
        echo "Stopping app..."
        if [ -f "$libmaix" ]; then
          ps |grep maix_dist |awk '{print $1}'|xargs kill -9
        else
          killall python3
        fi
        ;;
  restart|reload)
        "$0" stop
        "$0" start
        ;;
  *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac

`

/**
 * V831 / MaixII transport via WebUSB + ADB.
 *
 * Uses @yume-chan/adb for the sync channel (bulk file writes) and
 * @/engine/SingletonShell for the interactive shell side (cmd output
 * parsing for wifi scan etc). A single `adb.sync()` session is held
 * open for the duration of each `upload()` via the bulk-write hook.
 */
export class WebAdbHandler extends BoardProtocol {
  constructor() {
    super()
    this.adb = null
    this.transport = null
    this._sync = null
  }

  get capabilities() {
    return { wifi: true, fileExplorer: true, startupScript: true }
  }

  // =================================================== lifecycle

  isConnected() {
    return this.transport != null
  }

  async connect(board) {
    console.log("Connecting via web-adb")
    const Manager = AdbDaemonWebUsbDeviceManager.BROWSER
    if (!Manager) {
      toast.error("Your browser doesn't support WebUSB")
      return false
    }
    // Idempotent: the boardStore treats the return value as
    // "is the board connected now?", not "did we open a new link".
    if (this.transport) return true

    let device = null
    const devices = await Manager.getDevices()
    for (const port of devices) {
      if (port.raw.productId == board.usb[0].productId &&
          port.raw.vendorId  == board.usb[0].vendorId) {
        device = port
        break
      }
    }
    if (!device) {
      if (devices.length === 0) {
        toast.warning("ยังไม่เคยขอสิทธิ์ใช้งาน USB หรือไม่ได้เสียบบอร์ดเข้ากับคอมพิวเตอร์มาก่อน")
        toast.warning("กรุณาเลือกอุปกรณ์ USB ที่ต้องการเชื่อมต่อ")
      }
      device = await Manager.requestDevice()
      if (!device) {
        toast.error("คุณไม่ได้เลือกอุปกรณ์")
        return false
      }
    }

    const connection = await device.connect()
    this.transport = await AdbDaemonTransport.authenticate({
      serial: device.serial,
      connection,
      credentialStore: new AdbWebCredentialStore(),
    })
    let adb = new Adb(this.transport)
    if (isProxy(adb)) adb = toRaw(adb)
    this.adb = adb
    SingletonShell.getInstance(this.adb)

    await this.beginBulkWrite()
    try {
      await this._uploadBoardScripts()
    } finally {
      await this.endBulkWrite()
    }
    toast.success("เชื่อมต่อบอร์ดสำเร็จ")
    return true
  }

  async disconnect() {
    if (this.transport) {
      await this.transport.close().catch(e => console.error("Error on transport close:", e))
      this.transport = null
      this.adb = null
      SingletonShell.destroyInstance()
      toast.warning("ตัดการเชื่อมต่อบอร์ดแล้ว")
    }
  }

  async rebootBoard() {
    SingletonShell.write("reboot\n")
    this.transport = null
    this.adb = null
  }

  // =================================================== transport primitives

  async beginBulkWrite() {
    this._sync = await this.adb.sync()
  }

  async endBulkWrite() {
    if (this._sync) {
      this._sync.dispose()
      this._sync = null
    }
  }

  async writeFile(path, content, { permission = 0o666 } = {}) {
    const blob = content instanceof Blob ? content : new Blob([content])
    const sync = this._sync || await this.adb.sync()
    try {
      const fileStream = new WrapReadableStream(blob.stream())
      await sync.write({
        filename: path,
        file: fileStream.pipeThrough(new WrapConsumableStream()),
        type: LinuxFileType.File,
        permission,
        mtime: Date.now() / 1000,
      })
    } finally {
      if (!this._sync) sync.dispose()
    }
  }

  async statFile(path) {
    const sync = this._sync || await this.adb.sync()
    try {
      const s = await sync.lstat(path)
      return { exists: true, size: s.size }
    } catch (e) {
      return { exists: false, size: 0 }
    } finally {
      if (!this._sync) sync.dispose()
    }
  }

  async execShell(cmd) {
    SingletonShell.write(cmd + "\n")
  }

  async interrupt() {
    SingletonShell.write("\x03")
    SingletonShell.write("\x03")
  }

  writeInput(data) {
    if (SingletonShell.hasWriter()) SingletonShell.write(data)
  }

  async attachOutput(callback) {
    const unsub = SingletonShell.getInstance().onOutput(callback)
    await SingletonShell.waitWriter()
    return unsub
  }

  // =================================================== upload hooks

  _buildStartupFiles(code) {
    return [
      { file: appPath("startup.py"), content: code },
      { file: "/etc/init.d/S02app", content: startupScript, permission: 0o777 },
    ]
  }

  async _afterUpload(writeStartup) {
    if (writeStartup && this.capabilities.startupScript) {
      await this.execShell("chmod +x /etc/init.d/S02app")
    }
    await this.execShell("sync")
    await this.execShell("killall python3")
    await this.execShell(`python3 ${appPath("run.py")}`)
  }

  /**
   * Sync IDE-managed scripts onto the board, once per version. See
   * the matching method in websocket-shell.js for the design notes —
   * the algorithm is identical: hash-driven detection, bootstrap by
   * comparing on-board hashes when the registry is missing, registry
   * stamped after a successful upload so the next connect skips work.
   *
   * V1's adb sync.write is already atomic at the protocol level
   * (transactional file replace), so no .tmp + mv dance needed here.
   */
  async _uploadBoardScripts() {
    const workspaceStore = useWorkspaceStore()
    const board = workspaceStore.currentBoard
    const managed = board?.managedScripts || []
    if (managed.length === 0) return

    // CRLF normalisation — see the matching block in
    // websocket-shell.js for why. Same rule applies to V1 boards.
    const enriched = []
    for (const m of managed) {
      const url = (board.scripts || []).find(s => s.endsWith(`/${m.name}`))
      if (!url) {
        console.warn(`[script-sync] bundle missing for ${m.name}`)
        continue
      }
      try {
        const res = await fetch(url)
        if (!res.ok) {
          console.warn(`[script-sync] fetch ${m.name} -> ${res.status}`)
          continue
        }
        const text = (await res.text()).replace(/\r\n?/g, "\n")
        const hash = await this._computeFileHash(text)
        enriched.push({ ...m, text, hash })
      } catch (e) {
        console.warn(`[script-sync] fetch ${m.name} failed:`, e?.message || e)
      }
    }
    if (enriched.length === 0) return

    const registry = await this._readScriptRegistry()
    const isBootstrap = registry === null
    const newRegistry = registry ? { ...registry } : {}
    let needsReboot = false
    const upgraded = []

    for (const s of enriched) {
      const known = registry?.[s.name]
      if (known && known.hash === s.hash) continue

      let onBoardHash = null
      const blob = await this.readFile(s.dest)
      if (blob) {
        try {
          const onBoardText = (await blob.text()).replace(/\r\n?/g, "\n")
          onBoardHash = await this._computeFileHash(onBoardText)
        } catch (_) { /* ignore */ }
      }

      if (onBoardHash === s.hash) {
        newRegistry[s.name] = { version: s.version, hash: s.hash }
        continue
      }

      try {
        await this.writeFile(s.dest, s.text)
        const oldVer = known?.version || (isBootstrap ? "vendor" : "none")
        console.log(`[script-sync] ${s.name}: ${oldVer} -> ${s.version}`)
        newRegistry[s.name] = { version: s.version, hash: s.hash }
        upgraded.push(s)
        if (s.needsReboot) needsReboot = true
      } catch (e) {
        console.warn(`[script-sync] ${s.name} write failed:`, e?.message || e)
      }
    }

    if (JSON.stringify(newRegistry) !== JSON.stringify(registry || {})) {
      try {
        await this.writeFile(SCRIPT_REGISTRY_PATH, JSON.stringify(newRegistry, null, 2))
      } catch (e) {
        console.warn("[script-sync] registry write failed:", e?.message || e)
      }
    }

    if (needsReboot) {
      const names = upgraded.filter(s => s.needsReboot).map(s => s.name).join(", ")
      toast.info(
        `อัปเดต ${names} เรียบร้อย กรุณารีสตาร์ทบอร์ดเพื่อให้การเปลี่ยนแปลงมีผล`,
        { autoClose: 8000 },
      )
    }
  }

  // SHA-256 of `text`, truncated to 16 hex chars. Mirrors the same
  // helper in websocket-shell.js so both protocols use identical
  // hashes for the registry stored at SCRIPT_REGISTRY_PATH.
  async _computeFileHash(text) {
    const buf = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest("SHA-256", buf)
    return [...new Uint8Array(digest)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16)
  }

  async _readScriptRegistry() {
    const stat = await this.statFile(SCRIPT_REGISTRY_PATH)
    if (!stat.exists) return null
    const blob = await this.readFile(SCRIPT_REGISTRY_PATH)
    if (!blob) return null
    try {
      return JSON.parse(await blob.text())
    } catch (e) {
      console.warn("[script-sync] registry corrupt; treating as fresh:", e)
      return null
    }
  }

  // =================================================== file explorer

  async listDir(path) {
    const sync = await this.adb.sync()
    try {
      // ADB sync returns each entry as the raw Linux dirent shape
      // (type=4 for dir, =8 for file, size + mtime as bigint, plus
      // permission bits). Normalise to the same shape ws_shell.py
      // emits for V2 so the file-explorer UI only learns one format.
      const raw = await sync.readdir(path)
      return raw.map(e => ({
        name:  e.name,
        type:  e.type === LinuxFileType.Directory ? "dir" : "file",
        size:  Number(e.size  || 0),
        mtime: Number(e.mtime || 0),
      }))
    } finally {
      sync.dispose()
    }
  }

  async readFile(path) {
    const sync = await this.adb.sync()
    try {
      const file = await sync.read(path)
      const arrayBuffer = await new Response(file).arrayBuffer()
      return new Blob([arrayBuffer])
    } catch (e) {
      console.error("readFile failed:", e)
      return null
    } finally {
      sync.dispose()
    }
  }

  async downloadFile(path) {
    const blob = await this.readFile(path)
    if (!blob) return false
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    URL.revokeObjectURL(url)
    return true
  }

  async deleteFileOrFolder(path) {
    SingletonShell.write("\x03")
    SingletonShell.write("\x03")
    await sleep(300)
    if (path == "") {
      toast.error("ไม่สามารถลบไฟล์หรือโฟลเดอร์ที่ว่างเปล่าได้")
      return
    }
    if (path == "/" || path == "/root" || path == BOARD_APP_DIR) {
      toast.error("ไม่สามารถลบไฟล์หรือโฟลเดอร์หลักได้")
      return
    }
    SingletonShell.write(`rm -rf "${path}"\n`)
    return true
  }

  async createNewFolder(path) {
    SingletonShell.write("\x03")
    SingletonShell.write("\x03")
    await sleep(300)
    if (path == "") {
      toast.error("ไม่สามารถสร้างโฟลเดอร์ที่ว่างเปล่าได้")
      return
    }
    SingletonShell.write(`mkdir -p "${path}"\n`)
    return true
  }

  // =================================================== wifi

  listWifi() {
    return new Promise(async resolve => {
      let wifiList = []
      const unsub = SingletonShell.getInstance().onOutput(data => {
        const dataString = new TextDecoder().decode(data)
        console.log("wifi list:", dataString)
        for (const line of dataString.split("\n")) {
          if (line.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/)) {
            const wifi = line.split("\t")
            if (wifi.length == 5) {
              wifiList.push({
                ssid: wifi[4].trim(),
                bssid: wifi[0].trim(),
                frequency: wifi[1].trim(),
                signal: wifi[2].trim(),
                flags: wifi[3].trim(),
              })
            }
          }
        }
        if (dataString.match(/root@sipeed:/)) {
          unsub()
          wifiList = wifiList.filter(w => w.ssid !== "")
          wifiList.sort((a, b) => parseInt(a.signal) > parseInt(b.signal) ? -1 : 1)
          resolve(wifiList)
        }
      })
      await SingletonShell.write("wifi_scan_results_test\n")
      await sleep(1000)
    })
  }

  checkWifi() {
    return new Promise(async resolve => {
      const unsub = SingletonShell.getInstance().onOutput(data => {
        const dataString = new TextDecoder().decode(data)
        console.log("wifi check:", dataString)
        const wifiInfo = {}
        for (const line of dataString.split("\n")) {
          const parts = line.split(":")
          if (parts.length == 2) wifiInfo[parts[0].trim()] = parts[1].trim()
        }
        if (dataString.match(/wifi_get_connection_info_test: get connection infomation complete!/)) {
          unsub()
          resolve({ connected: true, info: wifiInfo })
        }
        if (dataString.match(/wifi_get_connection_info_test: WIFI disconnected/)) {
          unsub()
          resolve({ connected: false })
        }
      })
      await SingletonShell.write("wifi_get_connection_info_test 1\n")
    })
  }

  connectWifi(ssid, password) {
    return new Promise(async resolve => {
      const unsub = SingletonShell.getInstance().onOutput(async data => {
        const dataString = new TextDecoder().decode(data)
        console.log("wifi connect:", dataString)
        if (dataString.match(/Wifi connect ap : Success!/)) {
          unsub()
          await this._writeWifiConfig(ssid, password)
          resolve(true)
        }
        if (dataString.match(/Wifi connect ap : Failure!/)) {
          unsub()
          resolve(false)
        }
      })
      await SingletonShell.write(`wifi_connect_ap_test "${ssid}" ${password}\n\n`)
    })
  }

  /**
   * Persist wpa_supplicant.conf so WiFi auto-reconnects on reboot.
   * Private — called after `connectWifi` succeeds.
   */
  async _writeWifiConfig(ssid, password) {
    const wpaConfig = `network={\n\tssid="${ssid}"\n\tpsk="${password}"\n}\n`
    const buffer = encodeUtf8(wpaConfig)
    const file = new File([buffer], "wpa_supplicant.conf")
    await this.writeFile("/root/wpa_supplicant.conf", file)
    await sleep(300)
    await this.execShell("cp /root/wpa_supplicant.conf /etc/wifi/wpa_supplicant.conf")
    await sleep(300)
    await this.execShell("sync")
    await sleep(300)
  }
}
