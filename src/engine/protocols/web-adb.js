import { sleep } from "@/engine/helper"
import { defineStore } from "pinia"
import { toast } from "vue3-toastify"
import { useWorkspaceStore } from "@/store/workspace"
import { usePluginStore } from "@/store/plugin"
import storage from "@/engine/storage"
import { md5 } from 'hash-wasm'
import {
  WrapConsumableStream,
  WrapReadableStream,
} from "@yume-chan/stream-extra"

import { Adb, AdbDaemonTransport, LinuxFileType, encodeUtf8  } from "@yume-chan/adb"
import AdbWebCredentialStore from "@yume-chan/adb-credential-web"
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb"
import { isProxy, toRaw } from "vue"
import SingletonShell from "../SingletonShell"

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

export class WebAdbHandler {
  constructor() {
    this.adb = null
    this.transport = null
  }

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
    let device = null
    if (!this.transport) {
      const devices = await Manager.getDevices()
      if (devices.length > 0) {
        for (let port of devices) {
          if (port.raw.productId == board.usb[0].productId &&
                        port.raw.vendorId == board.usb[0].vendorId) {
            device = port
            break
          }
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
      if (isProxy(adb)) {
        adb = toRaw(adb)
      }
      this.adb = adb
      SingletonShell.getInstance(this.adb, null)

      let sync = await this.adb.sync()
      await this.uploadBoardScript(sync)
      sync.dispose()
      toast.success("เชื่อมต่อบอร์ดสำเร็จ")
      
      return true
    }
    
    return false
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

  checkWifi() {
    return new Promise(async (resolve, reject) => {
      this.wifiListing = true
      SingletonShell.addCallback(data => {
        let dataString = new TextDecoder().decode(data)
        console.log("wifi check : ", dataString)
        let lines = dataString.split("\n")
        let wifiInfo = {}
        for (let line of lines) {
          let parts = line.split(":")
          if (parts.length == 2) {
            wifiInfo[parts[0].trim()] = parts[1].trim()
          }
        }
        console.log("--- wifi info ---")
        console.log(wifiInfo)
        if (dataString.match(/wifi_get_connection_info_test: get connection infomation complete!/)) {
          SingletonShell.removeLastCallback()
          resolve({ connected: true, info: wifiInfo })
        }
        if (dataString.match(/wifi_get_connection_info_test: WIFI disconnected/)) {
          SingletonShell.removeLastCallback()
          resolve({ connected: false })
        }
      })
      await SingletonShell.write("wifi_get_connection_info_test 1\n")
    })
  }

  listWifi() {
    return new Promise(async (resolve, reject) => {
      let wifiList = []
      SingletonShell.addCallback(data => {
        let dataString = new TextDecoder().decode(data)
        console.log("wifi list : ", dataString)
        let lines = dataString.split("\n")
        for (let line of lines) {
          if (line.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/)) {
            let wifi = line.split("\t")
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
          SingletonShell.removeLastCallback()
          wifiList = wifiList.filter(wifi => wifi.ssid != "")
          wifiList.sort((a, b) => (parseInt(a.signal) > parseInt(b.signal)) ? -1 : 1)
          resolve(wifiList)
        }
      })
      await SingletonShell.write("wifi_scan_results_test\n")
      await sleep(1000)
    })
  }

  async listDir(path) {
    try {
      let adb = this.adb
      const sync = await adb.sync()
      const entries = await sync.readdir(path)
      sync.dispose()
      
      return entries
    } catch (e) {
      throw e
    }
  }

  async downloadFile(path) {
    try {
      let adb = this.adb
      const sync = await adb.sync()
      const file = await sync.read(path)
      let arrayBuffer = await new Response(file).arrayBuffer()
      sync.dispose()
      let blob = new Blob([arrayBuffer])
      let url = URL.createObjectURL(blob)
      let a = document.createElement("a")
      a.href = url
      a.download = path.split("/").pop()
      a.click()
      URL.revokeObjectURL(url)
      
      return true
    } catch (e) {
      throw e
    }
  }

  async deleteFileOrFolder(path) {
    try {
      SingletonShell.write("\x03")
      SingletonShell.write("\x03")
      await sleep(300)
      if (path == "") {
        toast.error("ไม่สามารถลบไฟล์หรือโฟลเดอร์ที่ว่างเปล่าได้")
        
        return
      }
      if (path == "/" || path == "/root" || path == "/root/app") {
        toast.error("ไม่สามารถลบไฟล์หรือโฟลเดอร์หลักได้")
        
        return
      }
      SingletonShell.write(`rm -rf "${path}"\n`)
      
      return true
    } catch (e) {
      throw e
    }
  }

  async createNewFolder(path) {
    try {
      SingletonShell.write("\x03")
      SingletonShell.write("\x03")
      await sleep(300)
      if (path == "") {
        toast.error("ไม่สามารถสร้างโฟลเดอร์ที่ว่างเปล่าได้")
        
        return
      }
      SingletonShell.write(`mkdir -p "${path}"\n`)
      
      return true
    } catch (e) {
      throw e
    }
  }

  async uploadFile(path, file) {
    try {
      let adb = this.adb
      const sync = await adb.sync()
      let fileStream = new WrapReadableStream(file.stream())
      await sync.write({
        filename: path,
        file: fileStream
          .pipeThrough(new WrapConsumableStream()),
        type: LinuxFileType.File,
        permission: 0o666,
        mtime: Date.now() / 1000,
      })
      sync.dispose()
      
      return true
    } catch (e) {
      throw e
    }
  }

  connectWifi(ssid, password) {
    return new Promise(async (resolve, reject) => {
      SingletonShell.addCallback(async data => {
        let dataString = new TextDecoder().decode(data)
        console.log("wifi connect : ", dataString)
        if (dataString.match(/Wifi connect ap : Success!/)) {
          SingletonShell.removeLastCallback()
          await this.writeWifiConfig(ssid, password)
          resolve(true)
        }
        if (dataString.match(/Wifi connect ap : Failure!/)) {
          SingletonShell.removeLastCallback()
          resolve(false)
        }
      })
      await SingletonShell.write(`wifi_connect_ap_test "${ssid}" ${password}\n\n`)
    })
  }

  async writeWifiConfig(ssid, password) {
    let wpaConfig = `network={\n\tssid="${ssid}"\n\tpsk="${password}"\n}\n`
    let buffer = encodeUtf8(wpaConfig)
    let file = new File([buffer], "wpa_supplicant.conf")
    let fileStream = new WrapReadableStream(file.stream())
    try {
      const sync = await this.adb.sync()
      await sync.write({
        filename: "/root/wpa_supplicant.conf",
        file: fileStream
          .pipeThrough(new WrapConsumableStream()),
        type: LinuxFileType.File,
        permission: 0o666,
        mtime: Date.now() / 1000,
      })
      sync.dispose()
      await sleep(300)
      SingletonShell.write("cp /root/wpa_supplicant.conf /etc/wifi/wpa_supplicant.conf\n")
      await sleep(300)
      SingletonShell.write("sync\n")
      await sleep(300)
      
      return true
    } catch (e) {
      throw e
    }
  }

  rebootBoard() {
    SingletonShell.write("reboot\n")
    this.transport = null
    this.adb = null
  }

  async uploadBoardScript(sync) {
    const workspaceStore = useWorkspaceStore()
    const currentBoard = workspaceStore.currentBoard
    const scripts = currentBoard.scripts
    let filesUpload = []
    if (scripts) {
      for (let script of scripts) {
        let scriptResponse = await fetch(script)
        if (scriptResponse.ok) {
          let scriptData = await scriptResponse.text()
          filesUpload.push({
            file: "/root/scripts/" + script.replace(currentBoard.path + "scripts/", ""),
            content: scriptData,
          })
        }
      }
    }
    console.log(filesUpload)
    for (let file of filesUpload) {
      let fileT = new File([file.content], file.file)
      console.log("upload file : ", file.file)
      let fileStream = new WrapReadableStream(fileT.stream())
      await sync.write({
        filename: file.file,
        file: fileStream
          .pipeThrough(new WrapConsumableStream()),
        type: LinuxFileType.File,
        permission: file.permission | 0o666,
        mtime: Date.now() / 1000,
      })
    }
  }

  async uploadModelIfNeeded(sync, fs) {
    const workspaceStore = useWorkspaceStore()
    let model = workspaceStore.model
    console.log(model)
    if (model != null) {
      try {
        let stat = await sync.lstat("/root/model/" + model.hash + ".bin")
        console.log(stat)
      } catch (e) {
        toast.warn("ไม่พบไฟล์โมเดลบนบอร์ด กำลังอัพโหลดโมเดลใหม่")
        let modelBinaries = await storage.readAsFile(fs, `${workspaceStore.id}/model.bin`)
        let modelParams = await storage.readAsFile(fs, `${workspaceStore.id}/model.param`)
        let paramHash = await md5(new Uint8Array(await modelParams.arrayBuffer()))
        let modelHash = await md5(new Uint8Array(await modelBinaries.arrayBuffer()))
        console.log("model hash : ", model.hash)
        console.log("param hash : ", paramHash)
        console.log("model hash : ", modelHash)
        try {
          await sync.write({
            filename: "/root/model/" + model.hash + ".param",
            file: new WrapReadableStream(modelParams.stream())
              .pipeThrough(new WrapConsumableStream()),
            type: LinuxFileType.File,
            permission: 0o666,
            mtime: Date.now() / 1000,
          })
          await sync.write({
            filename: "/root/model/" + model.hash + ".bin",
            file: new WrapReadableStream(modelBinaries.stream())
              .pipeThrough(new WrapConsumableStream()),
            type: LinuxFileType.File,
            permission: 0o666,
            mtime: Date.now() / 1000,
          })
          toast.success("อัพโหลดโมเดลสำเร็จ")
        } catch (e) {
          console.log(e)
          toast.error("อัพโหลดโมเดลไม่สำเร็จ")
          
          return
        }
      }
    }
  }

  async upload(code, writeStartup = false, fs) {
    SingletonShell.write("\x03")
    SingletonShell.write("\x03")

    let filesUpload = []
    const workspaceStore = useWorkspaceStore()
    const currentBoard = workspaceStore.currentBoard
    const pluginStore = usePluginStore()

    code = currentBoard.codeTemplate.replace("##{main}##", code)

    filesUpload.push({
      file: "/root/app/run.py",
      content: code,
    })

    if (writeStartup) {
      console.log("write startup script")
      filesUpload.push({
        file: "/root/app/startup.py",
        content: code,
      })

      filesUpload.push({
        file: "/etc/init.d/S02app",
        content: startupScript,
        permission: 0o777,
      })
    }

    for (let module of currentBoard.pythonModules) {
      let scriptResponse = await fetch(module)
      if (scriptResponse.ok) {
        let scriptData = await scriptResponse.text()
        filesUpload.push({
          file: "/root/app/" + module.replace(currentBoard.path + "libs/", ""),
          content: scriptData,
        })
      }
    }

    for (let plugin of pluginStore.installed) {
      for (let codeFile of plugin.codeFiles) {
        let scriptResponse = await fetch(codeFile)
        if (scriptResponse.ok) {
          let scriptData = await scriptResponse.text()
          filesUpload.push({
            file: "/root/app/" + codeFile.replace(plugin.path + "libs/", ""),
            content: scriptData,
          })
        }
      }
    }

    try {
      const sync = await this.adb.sync()
      await this.uploadModelIfNeeded(sync, fs)

      for (let file of filesUpload) {
        let fileT = new File([file.content], file.file)
        console.log("upload file : ", file.file)
        let fileStream = new WrapReadableStream(fileT.stream())
        await sync.write({
          filename: file.file,
          file: fileStream
            .pipeThrough(new WrapConsumableStream()),
          type: LinuxFileType.File,
          permission: file.permission | 0o666,
          mtime: Date.now() / 1000,
        })
      }
      sync.dispose()
      if (writeStartup) {
        SingletonShell.write("chmod +x /etc/init.d/S02app\n")
      }
      SingletonShell.write("sync\n")
      SingletonShell.write("killall python3\n")
      SingletonShell.write("python3 /root/app/run.py\n")
      
      return true
    } catch (e) {
      throw e
    }
  }
}