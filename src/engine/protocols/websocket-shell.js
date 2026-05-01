import { toast } from "vue3-toastify"
import { useBoardStore } from "@/store/board"
import { appPath } from "@/engine/board-paths"
import BoardProtocol from "./base"

const LARGE_FILE_THRESHOLD = 256 * 1024
const UPLOAD_CHUNK_SIZE    = 256 * 1024
const SYS_LINE_PREFIX      = "\r\n>>> System: "
const SYS_LINE_RE          = /^\r\n>>> System: (.+)\r\n$/s

/**
 * MaixCAM / CV181x transport over wss:// to an on-device PTY shell
 * (`boards/kidbright-mai-plus/scripts/ws_shell.py`).
 *
 * Two channels share the socket:
 *   - **PTY output**         arrives as binary frames (ArrayBuffer).
 *                            Forwarded straight to the IDE terminal.
 *   - **System responses**   arrive as text frames shaped
 *                            "\r\n>>> System: <json>\r\n", one
 *                            command response per frame. Parsed
 *                            once via `_parseSystemFrame` — every
 *                            command waiter dispatches on the JSON
 *                            `type` field, no per-call regex.
 *
 * The board sends the request id back as `path` (or implicitly via
 * the response type for singleton commands like `version`) so the
 * matcher predicates stay tiny.
 */
export class WebSocketShellHandler extends BoardProtocol {
  constructor() {
    super()
    this.socket = null
    this.boardStore = useBoardStore()
    this.eventListeners = new Map()
    this.connected = false
    // Populated by `_probeFeatures` on connect. Old boards (pre-1.1.0
    // ws_shell.py) don't reply to `{cmd:"version"}` and the set stays
    // empty — feature-gated UI hides itself.
    this._features = new Set()
  }

  get capabilities() {
    return {
      wifi:         this._features.has("wifi_scan"),
      fileExplorer: this._features.has("listdir"),
      tcpRelay:     this._features.has("tcp_relay"),
      startupScript: false,
    }
  }

  // =================================================== event system (internal)

  on(event, listener) {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, [])
    this.eventListeners.get(event).push(listener)
  }

  off(event, listener) {
    const ls = this.eventListeners.get(event)
    if (!ls) return
    const i = ls.indexOf(listener)
    if (i > -1) ls.splice(i, 1)
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
  exec(data) { this.send(data) }

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
        this.connected = true
        this.boardStore.connected = true
        toast.success("Connected to Shell")
        this.socket.send('\r')
        // Async — `capabilities.fileExplorer` flips to true silently
        // once the version response lands.
        this._probeFeatures()
        resolve(true)
      }

      this.socket.onerror = err => {
        console.error("WebSocket Shell error:", err)
        this.boardStore.showSecureConnectDialog = true
        this.connected = false
        this.boardStore.connected = false
        this._cleanup()
        resolve(false)
      }

      this.socket.onclose = () => {
        this.connected = false
        this.boardStore.connected = false
        this._cleanup()
      }

      this.socket.onmessage = event => this.emit('log', event.data)
    })
  }

  async disconnect() {
    if (this.socket) this.socket.close()
    this._cleanup()
  }

  _cleanup() {
    this.connected = false
    this.socket = null
    this._features = new Set()
    this.boardStore.capabilitiesRevision++
  }

  async rebootBoard() { this.send("reboot\r") }

  // =================================================== frame helpers

  /**
   * Parse a websocket frame as a system response.
   * Returns the parsed JSON or null when this frame isn't ours
   * (binary PTY output, malformed text, plain shell echo).
   */
  _parseSystemFrame(data) {
    if (typeof data !== 'string') return null
    const m = data.match(SYS_LINE_RE)
    if (!m) return null
    try { return JSON.parse(m[1]) } catch (_) { return null }
  }

  /**
   * Decode log frames (binary or text) to a string for shell-output
   * pattern matching — used by the run-end / deploy-done markers
   * that arrive as PTY echo bytes, not as system responses.
   */
  _logToString(data) {
    if (typeof data === 'string') return data
    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      return new TextDecoder().decode(data)
    }
    return null
  }

  /**
   * Send `{cmd, ...args}` over the system channel and resolve when a
   * response satisfying `match(msg)` arrives. `error` responses and
   * the timeout both resolve to `defaultValue` so callers stay flat.
   */
  _sendCommand({ cmd, args = {}, match, defaultValue = null, timeoutMs = 5000 }) {
    return new Promise(resolve => {
      let listener
      const finish = value => { this.off('log', listener); resolve(value) }
      listener = data => {
        const msg = this._parseSystemFrame(data)
        if (!msg) return
        if (msg.type === 'error') finish(defaultValue)
        else if (match(msg))      finish(msg)
      }
      this.on('log', listener)
      setTimeout(() => finish(defaultValue), timeoutMs)
      this.socket.send(`__SYSTEM__:${JSON.stringify({ cmd, ...args })}`)
    })
  }

  // =================================================== capabilities probe

  async _probeFeatures() {
    const msg = await this._sendCommand({
      cmd: "version",
      match: m => m.type === "version",
      timeoutMs: 3000,
    })
    if (!msg) return
    for (const f of msg.features || []) this._features.add(f)
    // Force the boardStore.capabilities getter to re-run so dependent
    // UI flips on (handler is markRaw, so Vue can't track our Set).
    this.boardStore.capabilitiesRevision++
  }

  // =================================================== file explorer

  async listDir(path) {
    const msg = await this._sendCommand({
      cmd: "listdir",
      args: { path },
      match: m => m.type === "listdir" && m.path === path,
      defaultValue: { entries: [] },
    })
    return msg.entries || []
  }

  async createNewFolder(path) {
    // Stop any running script first so the mkdir command goes to the
    // shell, not into a python3 process holding the PTY foreground.
    await this.interrupt()
    await this.execShell(`mkdir -p '${shellQuote(path)}'`)
    return true
  }

  async deleteFileOrFolder(path) {
    if (!path || path === "/" || path === "/root" || path === "/maixapp") {
      toast.error("ไม่สามารถลบโฟลเดอร์หลักได้")
      return false
    }
    await this.interrupt()
    await this.execShell(`rm -rf '${shellQuote(path)}'`)
    return true
  }

  /**
   * Pull a file off the board and trigger a browser download.
   * `download_start` arrives first, then a stream of `download_chunk`
   * messages, then `download_done`.
   */
  /**
   * Pull a file into memory as a Blob. Used by file explorer to feed
   * the browser-download helper, and by capture flows that need the
   * bytes themselves (voice WAV / MFCC PNG). Returns null on failure.
   */
  async readFile(path) {
    const chunks = []
    const ok = await new Promise(resolve => {
      let listener
      const finish = success => { this.off('log', listener); resolve(success) }
      listener = data => {
        const msg = this._parseSystemFrame(data)
        if (!msg || msg.path !== path) return
        if (msg.type === "download_chunk") {
          chunks.push(base64ToBytes(msg.data))
        } else if (msg.type === "download_done") {
          finish(true)
        } else if (msg.type === "error") {
          finish(false)
        }
      }
      this.on('log', listener)
      // 60 s safety covers the typical 10 MB cvimodel; bigger files
      // just need more time, but a true hang shouldn't lock the UI.
      setTimeout(() => finish(false), 60000)
      this.socket.send(`__SYSTEM__:${JSON.stringify({ cmd: "download", path })}`)
    })
    return ok ? new Blob(chunks) : null
  }

  async downloadFile(path) {
    const blob = await this.readFile(path)
    if (!blob) {
      toast.error(`ดาวน์โหลดไฟล์ไม่สำเร็จ: ${path}`)
      return false
    }
    triggerBrowserDownload(blob, path.split("/").pop())
    return true
  }

  // =================================================== wifi
  //
  // Backed by ws_shell.py 1.2.0+ wpa_cli wrappers. Old boards reply
  // "unknown cmd" → defaultValue → UI shows empty list / not-connected
  // / failed-connect. Capabilities.wifi is gated on the version probe
  // so the menu button stays disabled in that case anyway.

  async listWifi() {
    const msg = await this._sendCommand({
      cmd: "wifi_scan",
      match: m => m.type === "wifi_scan",
      defaultValue: { networks: [] },
      timeoutMs: 10000,   // wpa_cli scan + 2 s sleep on the board
    })
    return msg.networks || []
  }

  async checkWifi() {
    const msg = await this._sendCommand({
      cmd: "wifi_status",
      match: m => m.type === "wifi_status",
      defaultValue: { connected: false, info: {} },
      timeoutMs: 3000,
    })
    return { connected: !!msg.connected, info: msg.info || {} }
  }

  async connectWifi(ssid, password) {
    const msg = await this._sendCommand({
      cmd: "wifi_connect",
      args: { ssid, psk: password },
      match: m => m.type === "wifi_connect",
      defaultValue: { success: false },
      timeoutMs: 30000,   // assoc + auth + DHCP can run ~15 s
    })
    return !!msg.success
  }

  // =================================================== tcp relay
  // Forwards a localhost-TCP socket (e.g. voice_stream.py on :5000)
  // through the existing wss:// shell connection so subsystem daemons
  // don't need their own TLS port. Returns a stream-like handle:
  //   { send(bytes|string), close() }
  // and invokes `onData(Uint8Array)` / `onClose()` callbacks for
  // incoming frames + EOF. Caller is responsible for calling
  // `.close()` when done; otherwise the board keeps the loopback
  // socket open until the ws disconnects.

  async tcpRelay(port, { onData, onClose } = {}) {
    const open = await this._sendCommand({
      cmd: "tcp_relay_open",
      args: { port },
      match: m => m.type === "tcp_relay_open",
      defaultValue: { ok: false, error: "timeout" },
      timeoutMs: 5000,
    })
    if (!open.ok) {
      throw new Error(`tcp_relay open failed: ${open.error || "unknown"}`)
    }

    const listener = data => {
      const msg = this._parseSystemFrame(data)
      if (!msg) return
      if (msg.type === "tcp_relay_data") {
        if (onData) {
          // base64 -> Uint8Array, caller decodes if it expects text
          const bin = atob(msg.data || "")
          const u8 = new Uint8Array(bin.length)
          for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
          onData(u8)
        }
      } else if (msg.type === "tcp_relay_closed") {
        this.off("log", listener)
        if (onClose) onClose()
      }
    }
    this.on("log", listener)

    return {
      send: bytes => {
        let b64
        if (bytes instanceof Uint8Array) {
          let s = ""
          for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
          b64 = btoa(s)
        } else {
          b64 = btoa(String(bytes))
        }
        this.socket.send(`__SYSTEM__:${JSON.stringify({ cmd: "tcp_relay_send", data: b64 })}`)
      },
      close: () => {
        this.off("log", listener)
        this.socket.send(`__SYSTEM__:${JSON.stringify({ cmd: "tcp_relay_close" })}`)
      },
    }
  }

  // =================================================== transport primitives

  async writeFile(path, content) {
    const buf = await this._toArrayBuffer(content)
    if (buf.byteLength > LARGE_FILE_THRESHOLD) {
      const name = path.split("/").pop()
      const mb = (buf.byteLength / 1024 / 1024).toFixed(2)
      toast.info(`กำลังอัปโหลด ${name} (${mb} MB)...`)
    }
    await this._uploadFileChunked(path, buf)
  }

  async statFile(path) {
    const msg = await this._sendCommand({
      cmd: "stat",
      args: { path },
      match: m => m.type === "stat" && m.path === path,
      defaultValue: { exists: false, size: 0, error: true },
      timeoutMs: 3000,
    })
    if (msg.error) return msg
    return { exists: !!msg.exists, size: msg.size || 0 }
  }

  async execShell(cmd) { this.send(cmd + "\r") }

  async interrupt() {
    this.send("\x03")
    await new Promise(r => setTimeout(r, 300))
  }

  writeInput(data) { this.send(data) }

  async attachOutput(callback) {
    // Filter system-response frames so they don't show up as JSON
    // garbage in the user-facing terminal — only PTY output reaches
    // the consumer.
    const wrapped = data => {
      if (this._parseSystemFrame(data) !== null) return
      callback(data)
    }
    this.on('log', wrapped)
    return () => this.off('log', wrapped)
  }

  // =================================================== chunked upload

  async _uploadFileChunked(path, contentArrayBuffer) {
    const bytes = new Uint8Array(contentArrayBuffer)

    const sendChunk = async (mode, b64) => {
      const ack = await this._sendCommand({
        cmd: "upload",
        args: { path, mode, data: b64 },
        match: m => m.type === "uploaded" && m.path === path,
        timeoutMs: 15000,
      })
      if (!ack) throw new Error(`upload chunk failed: ${path}`)
    }

    // Empty content still needs one round-trip (mode=wb) so the file
    // is truncated; without it writing "" was a silent no-op and the
    // last value lingered (e.g. /maixapp/auto_start.txt).
    if (bytes.length === 0) {
      await sendChunk("wb", "")
      return
    }

    let offset = 0
    while (offset < bytes.length) {
      const mode = offset === 0 ? "wb" : "ab"
      const chunk = bytes.subarray(offset, offset + UPLOAD_CHUNK_SIZE)
      // btoa needs a string — build it 8 KB at a time so a multi-MB
      // chunk doesn't blow the apply() spread argument limit.
      let binary = ""
      for (let i = 0; i < chunk.length; i += 8192) {
        binary += String.fromCharCode.apply(null, chunk.subarray(i, i + 8192))
      }
      await sendChunk(mode, btoa(binary))
      offset += UPLOAD_CHUNK_SIZE
    }
  }

  async _toArrayBuffer(content) {
    if (content instanceof ArrayBuffer)             return content
    if (content instanceof Blob)                    return content.arrayBuffer()
    if (typeof content === 'string')                return new TextEncoder().encode(content).buffer
    if (ArrayBuffer.isView(content))                return content.buffer
    throw new Error(`writeFile: unsupported content type (${typeof content})`)
  }

  // =================================================== upload hook (Run mode)

  async _afterUpload(_writeStartup) {
    // ws_shell doesn't kill PTY children on Ctrl-C, so kill the
    // previous run.py surgically (killall would nuke ws_shell itself).
    const runPy = appPath("run.py")
    await this.execShell(
      `ps | grep "${runPy}" | grep -v grep | awk '{print $1}' | xargs kill -9`,
    )
    await new Promise(r => setTimeout(r, 500))

    // Tail the run with a unique end marker so the IDE flips the
    // running flag back off when the script exits naturally.
    const marker = this._armRunEndWatcher()
    await this.execShell(`python3 ${runPy}; echo ${marker}`)
    toast.success("อัปโหลดโค้ดและกำลังรันบนบอร์ด")
  }

  _armRunEndWatcher() {
    const myRunId = (this._runId = (this._runId || 0) + 1)
    const marker = `__KB_PROG_END_${myRunId}_${Date.now()}__`
    let listener
    listener = data => {
      const str = this._logToString(data)
      if (str === null || !str.includes(marker)) return
      this.off('log', listener)
      // A newer run already started? Let its watcher own the flag.
      if (this._runId === myRunId) this.boardStore.running = false
    }
    this.on('log', listener)
    return marker
  }

  // =================================================== deploy-as-app

  /**
   * Install the user's project as a packaged Maix App at
   * /maixapp/apps/<id>/. payload = { appId, autoStart, files }.
   * Re-uses the Run-mode model + lib uploaders so a deployed run.py
   * sees exactly the same /root/model/ + sibling .py files it would
   * see when launched via Run.
   */
  async deployAsApp({ appId, autoStart = false, files = [] }, fs) {
    if (!appId) throw new Error("deployAsApp: appId is required")
    const appDir = `/maixapp/apps/${appId}`
    await this.execShell(`mkdir -p ${appDir}`)
    await new Promise(r => setTimeout(r, 200))

    if (fs) await this.uploadModelIfNeeded(fs)
    await this._uploadAppLibs(appDir)

    for (const f of files) {
      await this.writeFile(`${appDir}/${f.name}`, f.content)
    }

    // /maixapp/auto_start.txt = single line with the app id (no
    // newline in the existing test sample on the device). Empty
    // file = no auto-run.
    await this.writeFile("/maixapp/auto_start.txt", autoStart ? appId : "")

    // The launcher reads /maixapp/apps/app.info (INI) at startup and
    // does NOT rescan apps/ at runtime. Chain regen + restart launcher
    // in one shell command and wait for an `echo <marker>` so the UI
    // only shows success once everything's actually live.
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

  async _uploadAppLibs(appDir) {
    for (const lib of await this._collectAppLibs()) {
      await this.writeFile(`${appDir}/${lib.name}`, lib.content)
    }
  }

  /**
   * Send a shell command and wait for `<marker>` to appear in PTY
   * output (i.e. `echo <marker>` ran). Used to synchronise on async
   * tail steps like launcher_daemon's 2-3 s warm-up. Falls back to
   * resolving on timeout so the UI never hangs forever.
   */
  _execAndWaitForMarker(cmd, marker, timeoutMs = 15000) {
    return new Promise(resolve => {
      let listener, settled = false
      const finish = () => {
        if (settled) return
        settled = true
        this.off('log', listener)
        resolve()
      }
      listener = data => {
        const str = this._logToString(data)
        if (str !== null && str.includes(marker)) finish()
      }
      this.on('log', listener)
      setTimeout(finish, timeoutMs)
      this.send(cmd + "\r")
    })
  }
}


// --------------------------- module-private helpers ---------------------------

function shellQuote(s) {
  // Single-quote a path for `'...'` shell escaping. Inner ' becomes
  // '\\''. Doesn't try to handle every shell pathology — paths from
  // the file-explorer dialog are vetted upstream.
  return s.replace(/'/g, "'\\''")
}

function base64ToBytes(b64) {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
