import { toast } from "vue3-toastify"
import { useBoardStore } from "@/store/board"


export class WebSocketShellHandler {
  constructor() {
    this.socket = null
    this.boardStore = useBoardStore()
    this.eventListeners = new Map()
    this.connected = false
  }

  isConnected() {
    return this.connected && this.socket?.readyState === WebSocket.OPEN
  }

  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(listener)
  }

  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => listener(...args))
    }
  }

  async connect(board) {
    if (!board.wsShell) {
      toast.error("WebSocket Shell URL (wsShell) is not configured for this board.")
      return false
    }

    if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
      return true
    }

    return new Promise(resolve => {
      this.socket = new WebSocket(board.wsShell)
      this.socket.binaryType = "arraybuffer"

      this.socket.onopen = () => {
        console.log("WebSocket Shell connected")
        this.connected = true
        this.boardStore.connected = true // Sync with store
        toast.success("Connected to Shell")
        this.socket.send('\r') // trigger prompt
        resolve(true)
      }

      this.socket.onerror = error => {
        console.error("WebSocket Shell error:", error)
        toast.error("Shell connection failed")
        this.connected = false
        this.boardStore.connected = false // Sync with store
        this.cleanup()
        resolve(false)
      }

      this.socket.onclose = () => {
        console.log("WebSocket Shell disconnected")
        this.connected = false
        this.boardStore.connected = false // Sync with store
        this.cleanup()
        // this.boardStore.deviceDisconnect() // Optional: might strictly not want to disconnect global state if shell drops
      }

      this.socket.onmessage = event => {
        // Raw PTY output
        // We might need to filter out System acks if we want to hide them, 
        // but for now let's show everything or filter if needed.
        const data = event.data
        this.emit('log', data)
      }
    })
  }

  cleanup() {
    this.connected = false
    this.socket = null
  }

  async disconnect() {
    if (this.socket) {
      this.socket.close()
    }
    this.cleanup()
  }

  async upload(code, writeStartup = false, fs) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      toast.error("Shell not connected")
      return
    }

    try {
      // 1. Prepare file
      const filename = "/root/main.py" // or whatever default
      // Encode to base64
      // Use a browser-compatible way
      const codeB64 = btoa(unescape(encodeURIComponent(code)))

      const payload = JSON.stringify({
        cmd: "upload",
        path: filename,
        data: codeB64
      })

      // 2. Send upload command
      console.log("Sending upload command via shell sidechannel...")
      this.socket.send(`__SYSTEM__:${payload}`)

      // Wait a bit or wait for ACK? 
      // For simplicity, just wait a short delay then run
      await new Promise(r => setTimeout(r, 500))

      if (writeStartup) {
        // If writeStartup, maybe upload to startup.py as well?
        // For now, let's just stick to running main.py
      }

      // 3. Execution
      // Send Ctrl+C to stop invalid programs
      // this.socket.send("\x03")
      // await new Promise(r => setTimeout(r, 300))

      // Run python
      const runCmd = `python3 ${filename}\r`
      this.socket.send(runCmd)

      toast.success("Code uploaded & running...")
      return true
    } catch (e) {
      console.error(e)
      //toast.error("Upload failed: " + e.message)
      throw e
    }
  }

  // Pass-through for terminal input
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data)
    }
  }

  exec(data) {
    this.send(data)
  }

  async stop() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send("\x03") // Ctrl+C
    }
  }

  async listDir(path) { return [] }
  async deleteFileOrFolder(path) { }
  async rebootBoard() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send("reboot\r")
    }
  }
}
