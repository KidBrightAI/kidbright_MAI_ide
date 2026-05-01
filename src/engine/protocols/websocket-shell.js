import { toast } from "vue3-toastify"
import { useBoardStore } from "@/store/board"
import { appPath } from "@/engine/board-paths"
import BoardProtocol from "./base"

const LARGE_FILE_THRESHOLD = 256 * 1024

/**
 * MaixCAM / CV181x transport over WebSocket to an on-device PTY shell.
 *
 * The board runs a shell server (boards/kidbright-mai-plus/scripts/
 * ws_shell.py) that exposes file write / stat as JSON commands tunneled
 * alongside the interactive PTY. All log output comes back on the same
 * socket, so primitives that "wait for a specific reply" (upload ack,
 * stat result) parse incoming log lines. That makes the pattern
 * fundamentally different from web-adb's binary sync channel, hence
 * the chunked base64 upload + log-parse stat.
 */
export class WebSocketShellHandler extends BoardProtocol {
  constructor() {
    super()
    this.socket = null
    this.boardStore = useBoardStore()
    this.eventListeners = new Map()
    this.connected = false
  }

  get capabilities() {
    // Parity roadmap: once ws_shell.py gets listDir / wifi handlers,
    // flip these flags and the UI menus unlock automatically.
    return { wifi: false, fileExplorer: false, startupScript: false }
  }

  // =================================================== event system (internal)

  on(event, listener) {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, [])
    this.eventListeners.get(event).push(listener)
  }

  off(event, listener) {
    const listeners = this.eventListeners.get(event)
    if (!listeners) return
    const i = listeners.indexOf(listener)
    if (i > -1) listeners.splice(i, 1)
  }

  emit(event, ...args) {
    this.eventListeners.get(event)?.forEach(l => l(...args))
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data)
    }
  }

  /** Pass-through used by the terminal bridge to forward keystrokes. */
  exec(data) {
    this.send(data)
  }

  // =================================================== lifecycle

  isConnected() {
    return this.connected && this.socket?.readyState === WebSocket.OPEN
  }

  async connect(board) {
    if (!board.wsShell) {
      toast.error("WebSocket Shell URL (wsShell) is not configured for this board.")
      return false
    }
    if (this.isConnected()) return true

    return new Promise(resolve => {
      this.socket = new WebSocket(board.wsShell)
      this.socket.binaryType = "arraybuffer"

      this.socket.onopen = () => {
        console.log("WebSocket Shell connected")
        this.connected = true
        this.boardStore.connected = true
        toast.success("Connected to Shell")
        this.socket.send('\r')
        resolve(true)
      }

      this.socket.onerror = error => {
        console.error("WebSocket Shell error:", error)
        this.boardStore.showSecureConnectDialog = true
        this.connected = false
        this.boardStore.connected = false
        this._cleanup()
        resolve(false)
      }

      this.socket.onclose = () => {
        console.log("WebSocket Shell disconnected")
        this.connected = false
        this.boardStore.connected = false
        this._cleanup()
      }

      this.socket.onmessage = event => {
        this.emit('log', event.data)
      }
    })
  }

  _cleanup() {
    this.connected = false
    this.socket = null
  }

  async disconnect() {
    if (this.socket) this.socket.close()
    this._cleanup()
  }

  async rebootBoard() {
    this.send("reboot\r")
  }

  // =================================================== file explorer stubs
  //
  // capabilities.fileExplorer is false above — UIs that check the flag
  // won't call these. Keep no-op bodies so legacy callers (dialog
  // already opens) don't crash, matching the pre-refactor behavior.
  // Remove once ws_shell.py gains listdir / rm / mkdir handlers.

  async listDir(_path) { return [] }
  async deleteFileOrFolder(_path) { /* not implemented on MaixCAM yet */ }

  // =================================================== log helpers

  /**
   * The websocket delivers PTY bytes as ArrayBuffer (binaryType is
   * "arraybuffer") and ws_shell's own JSON acks as text frames. All
   * the log-stream consumers want a string to scan, so go through one
   * decoder rather than re-deriving the same conditional in three
   * different handlers.
   */
  _logToString(data) {
    if (typeof data === 'string') return data
    if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
    return null
  }

  // =================================================== transport primitives

  async writeFile(path, content, { permission = 0o666 } = {}) {
    const buf = await this._toArrayBuffer(content)
    if (buf.byteLength > LARGE_FILE_THRESHOLD) {
      // Give the student feedback on slow uploads (model files can be
      // multi-MB and chunked base64 over PTY is not fast).
      const name = path.split("/").pop()
      const mb = (buf.byteLength / 1024 / 1024).toFixed(2)
      toast.info(`กำลังอัปโหลด ${name} (${mb} MB)...`)
    }
    await this._uploadFileChunked(path, buf)
  }

  async statFile(path) {
    return new Promise(resolve => {
      let handler
      let settled = false
      const finish = result => {
        if (settled) return
        settled = true
        const listeners = this.eventListeners.get('log')
        if (listeners && handler) {
          const i = listeners.indexOf(handler)
          if (i > -1) listeners.splice(i, 1)
        }
        resolve(result)
      }
      handler = data => {
        const str = this._logToString(data)
        if (str === null) return
        if (str.includes(`Stat ${path} exists`)) {
          const size = parseInt(str.split(' ').pop())
          finish({ exists: true, size: isNaN(size) ? 0 : size })
        } else if (str.includes(`Stat ${path} notfound`)) {
          finish({ exists: false, size: 0 })
        } else if (str.includes(`Command error`)) {
          finish({ exists: false, size: 0, error: true })
        }
      }
      this.on('log', handler)
      setTimeout(() => finish({ exists: false, size: 0, timeout: true }), 3000)

      const payload = JSON.stringify({ cmd: "stat", path })
      this.socket.send(`__SYSTEM__:${payload}`)
    })
  }

  async execShell(cmd) {
    this.send(cmd + "\r")
  }

  async interrupt() {
    this.send("\x03")
    await new Promise(r => setTimeout(r, 300))
  }

  writeInput(data) {
    this.send(data)
  }

  async attachOutput(callback) {
    this.on('log', callback)
    return () => this.off('log', callback)
  }

  // =================================================== upload hook

  async _afterUpload(_writeStartup) {
    // The ws_shell.py server doesn't kill children cleanly on Ctrl-C,
    // so surgically kill the previous run.py (if any) before launching
    // a fresh one. `killall python3` would nuke the shell server too.
    const runPy = appPath("run.py")
    const kill = `ps | grep "${runPy}" | grep -v grep | awk '{print $1}' | xargs kill -9`
    await this.execShell(kill)
    await new Promise(r => setTimeout(r, 500))

    // Tail the run with a unique end marker so the IDE can flip the
    // running flag back off when the user's script finishes naturally
    // (e.g. a one-shot loop that does its 10 s and exits). Without
    // this the upload icon would stay as Stop forever.
    const marker = this._armRunEndWatcher()
    await this.execShell(`python3 ${runPy}; echo ${marker}`)
    toast.success("อัปโหลดโค้ดและกำลังรันบนบอร์ด")
  }

  /**
   * Register a one-shot listener that resets boardStore.running to
   * false when the just-launched script finishes. Each run uses a
   * unique marker + run id so a stale listener from a previous
   * upload can't flip the flag while a new run is still going.
   */
  _armRunEndWatcher() {
    const myRunId = (this._runId = (this._runId || 0) + 1)
    const marker = `__KB_PROG_END_${myRunId}_${Date.now()}__`
    let handler
    handler = data => {
      const str = this._logToString(data)
      if (str === null || !str.includes(marker)) return
      this.off('log', handler)
      // If a newer run started in the meantime its own watcher will
      // own the flag — don't clobber it.
      if (this._runId === myRunId) {
        this.boardStore.running = false
      }
    }
    this.on('log', handler)
    return marker
  }

  // =================================================== deploy-as-app
  //
  // payload = { appId, autoStart, files: [{ name, content }, ...] }
  // - content can be string | ArrayBuffer | Blob — writeFile handles it
  // - app.yaml + main.py + run.py + app.png are written under
  //   /maixapp/apps/<appId>/ which is what the Sipeed launcher scans.
  // - autoStart flips /maixapp/auto_start.txt: write the id to enable,
  //   clear the file to disable. Doing this from the handler keeps the
  //   pages/index.vue side ignorant of the path layout.
  async deployAsApp({ appId, autoStart = false, files = [] }, fs) {
    if (!appId) throw new Error("deployAsApp: appId is required")
    const appDir = `/maixapp/apps/${appId}`
    await this.execShell(`mkdir -p ${appDir}`)
    await new Promise(r => setTimeout(r, 200))

    // Generators emit absolute paths like /root/model/<hash>.cvimodel
    // for nn.YOLO11(...) etc., so the model has to be on the board for
    // the deployed run.py to load. uploadModelIfNeeded is the same
    // helper Run mode uses — it skips files that already exist with
    // matching size, so re-deploys after a Run are basically free.
    if (fs) await this.uploadModelIfNeeded(fs)

    // Run mode lays board libs (classifier_runtime, detector_runtime,
    // voice_mfcc, msa311, ...) and plugin libs into /root/app/ next to
    // run.py. Generators emit `from classifier_runtime import Classifier`
    // and similar — Python's default sys.path includes the script's
    // own directory, so we drop the same files into /maixapp/apps/<id>/
    // here. main.py spawns run.py via absolute path so the subprocess
    // sees that dir on sys.path.
    await this._uploadAppLibs(appDir)

    for (const f of files) {
      const path = `${appDir}/${f.name}`
      await this.writeFile(path, f.content)
    }

    // /maixapp/auto_start.txt is a single line with the app id (no newline
    // in the existing test sample on the device). Empty file = no auto-run.
    if (autoStart) {
      await this.writeFile("/maixapp/auto_start.txt", appId)
    } else {
      await this.writeFile("/maixapp/auto_start.txt", "")
    }

    // The launcher reads /maixapp/apps/app.info (INI) at startup and does
    // NOT rescan apps/ at runtime. After dropping a new folder we have to:
    //   1. regenerate app.info via the stock gen_app_info.py helper
    //   2. restart launcher_daemon so it picks the refreshed list up
    // Without this, the icon never appears even though the files are on
    // disk. Kill is surgical (pid by name) — `killall` would also nuke
    // ws_shell.py and we'd lose the connection mid-deploy.
    //
    // execShell() is fire-and-forget over the PTY, so we chain everything
    // into one command that ends with `echo <marker>` and wait for that
    // marker to come back over the log stream — that's the only way to
    // know all the steps actually finished (especially launcher_daemon's
    // 2-3 s warm-up) before the caller declares success.
    const marker = `__KB_DEPLOY_DONE_${Date.now()}__`
    const finalize =
      "python3 /maixapp/apps/gen_app_info.py; " +
      "ps | grep -E 'launcher_daemon|launcher daemon' | grep -v grep | awk '{print $1}' | xargs -r kill -9; " +
      "sleep 1; " +
      "/maixapp/apps/launcher/launcher_daemon > /dev/null 2>&1 & " +
      "sleep 3; " +
      `echo ${marker}`
    await this._execAndWaitForMarker(finalize, marker, 20000)
    return true
  }

  /**
   * Drop board python modules and plugin libs alongside run.py inside
   * the app directory so `from classifier_runtime import Classifier`
   * (and friends) resolve. Reuses base.js _collectAppLibs so the file
   * list never drifts from what Run mode writes to /root/app/.
   */
  async _uploadAppLibs(appDir) {
    for (const lib of await this._collectAppLibs()) {
      await this.writeFile(`${appDir}/${lib.name}`, lib.content)
    }
  }

  /**
   * Send a shell command and resolve once the given marker string shows
   * up in the log stream — used to wait out gen_app_info + launcher
   * restart synchronously. Falls back to resolving on timeout so the
   * UI never hangs forever, even if echo never lands.
   */
  _execAndWaitForMarker(cmd, marker, timeoutMs = 15000) {
    return new Promise(resolve => {
      let handler
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        this.off('log', handler)
        resolve()
      }
      handler = data => {
        const str = this._logToString(data)
        if (str !== null && str.includes(marker)) finish()
      }
      this.on('log', handler)
      setTimeout(finish, timeoutMs)
      this.send(cmd + "\r")
    })
  }

  // =================================================== internal helpers

  async _toArrayBuffer(content) {
    if (content instanceof ArrayBuffer) return content
    if (content instanceof Blob) return content.arrayBuffer()
    if (typeof content === 'string') return new TextEncoder().encode(content).buffer
    if (ArrayBuffer.isView(content)) return content.buffer
    throw new Error(`writeFile: unsupported content type (${typeof content})`)
  }

  /**
   * Chunked base64 upload over the PTY side-channel. The board's
   * ws_shell.py decodes each chunk and appends to the target file,
   * then echoes `Uploaded <path> success` per chunk. We await each ack
   * (with a 15s timeout) before sending the next.
   */
  async _uploadFileChunked(path, contentArrayBuffer) {
    const CHUNK_SIZE = 256 * 1024
    const bytes = new Uint8Array(contentArrayBuffer)
    let offset = 0

    const sendChunk = async (mode, b64) => {
      const payload = JSON.stringify({ cmd: "upload", path, mode, data: b64 })
      this.socket.send(`__SYSTEM__:${payload}`)
      if (!(await waitForAck())) throw new Error("Upload chunk failed")
    }

    const waitForAck = () => new Promise(resolve => {
      let handler, settled = false
      const finish = ok => {
        if (settled) return
        settled = true
        const listeners = this.eventListeners.get('log')
        if (listeners && handler) {
          const i = listeners.indexOf(handler)
          if (i > -1) listeners.splice(i, 1)
        }
        resolve(ok)
      }
      handler = data => {
        const str = this._logToString(data)
        if (str === null) return
        if (str.includes(`Uploaded ${path} success`)) finish(true)
        else if (str.includes(`Upload error`))       finish(false)
      }
      this.on('log', handler)
      setTimeout(() => finish(true), 15000)
    })

    // Empty content still needs one round-trip with mode=wb so the
    // file is truncated (or created empty). Without this, writing ""
    // is a silent no-op — bit us when clearing /maixapp/auto_start.txt
    // left the previous app id behind and the next deploy auto-launched
    // unexpectedly.
    if (bytes.length === 0) {
      await sendChunk("wb", "")
      return
    }

    while (offset < bytes.length) {
      const mode = offset === 0 ? "wb" : "ab"
      const chunk = bytes.subarray(offset, offset + CHUNK_SIZE)

      // btoa needs a string; build it 8KB at a time to avoid stack overflow
      // on large apply(null, ...) spreads.
      let binary = ""
      for (let i = 0; i < chunk.length; i += 8192) {
        binary += String.fromCharCode.apply(null, chunk.subarray(i, i + 8192))
      }
      await sendChunk(mode, btoa(binary))
      offset += CHUNK_SIZE
    }
  }
}
