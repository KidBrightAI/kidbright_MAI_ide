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

  // =================================================== transport primitives

  async writeFile(path, content, { permission = 0o666 } = {}) {
    const buf = await this._toArrayBuffer(content)
    if (buf.byteLength > LARGE_FILE_THRESHOLD) {
      // Give the student feedback on slow uploads (model files can be
      // multi-MB and chunked base64 over PTY is not fast).
      toast.info(`Uploading ${path.split("/").pop()} (${(buf.byteLength / 1024 / 1024).toFixed(2)} MB)...`)
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
        if (typeof data !== 'string') return
        if (data.includes(`Stat ${path} exists`)) {
          const size = parseInt(data.split(' ').pop())
          finish({ exists: true, size: isNaN(size) ? 0 : size })
        } else if (data.includes(`Stat ${path} notfound`)) {
          finish({ exists: false, size: 0 })
        } else if (data.includes(`Command error`)) {
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
    await this.execShell(`python3 ${runPy}`)
    toast.success("Code uploaded & running...")
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
        if (typeof data !== 'string') return
        if (data.includes(`Uploaded ${path} success`)) finish(true)
        else if (data.includes(`Upload error`))       finish(false)
      }
      this.on('log', handler)
      setTimeout(() => finish(true), 15000)
    })

    while (offset < bytes.length) {
      const mode = offset === 0 ? "wb" : "ab"
      const chunk = bytes.subarray(offset, offset + CHUNK_SIZE)

      // btoa needs a string; build it 8KB at a time to avoid stack overflow
      // on large apply(null, ...) spreads.
      let binary = ""
      for (let i = 0; i < chunk.length; i += 8192) {
        binary += String.fromCharCode.apply(null, chunk.subarray(i, i + 8192))
      }
      const payload = JSON.stringify({
        cmd: "upload",
        path,
        mode,
        data: btoa(binary),
      })
      this.socket.send(`__SYSTEM__:${payload}`)
      if (!(await waitForAck())) {
        throw new Error("Upload chunk failed")
      }
      offset += CHUNK_SIZE
    }
  }
}
