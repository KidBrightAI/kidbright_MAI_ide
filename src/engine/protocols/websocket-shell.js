import { toast } from "vue3-toastify"
import { useBoardStore } from "@/store/board"
import { useWorkspaceStore } from "@/store/workspace"
import { usePluginStore } from "@/store/plugin"
import storage from "@/engine/storage"
import { pickByType } from "@/engine/model-formats"
import { appPath } from "@/engine/board-paths"


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
        // toast.error("Shell connection failed") // Suppress generic toast, show dialog instead
        this.boardStore.showSecureConnectDialog = true
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

  async uploadFileChunked(path, contentArrayBuffer) {
    const CHUNK_SIZE = 256 * 1024; // 256KB
    const uint8Array = new Uint8Array(contentArrayBuffer);
    let offset = 0;

    return new Promise(async (resolve, reject) => {
      const wailForAck = () => new Promise(r => {
        const handler = (data) => {
          if (typeof data === 'string' && data.includes(`Uploaded ${path} success`)) {
            const logListeners = this.eventListeners.get('log');
            if (logListeners) logListeners.splice(logListeners.indexOf(handler), 1);
            r(true);
          } else if (typeof data === 'string' && data.includes(`Upload error`)) {
            const logListeners = this.eventListeners.get('log');
            if (logListeners) logListeners.splice(logListeners.indexOf(handler), 1);
            r(false);
          }
        };
        this.on('log', handler);
        setTimeout(() => {
          const logListeners = this.eventListeners.get('log');
          if (logListeners) {
            const idx = logListeners.indexOf(handler);
            if (idx > -1) logListeners.splice(idx, 1);
          }
          r(true);
        }, 15000);
      });

      while (offset < uint8Array.length) {
        const mode = (offset === 0) ? "wb" : "ab";
        const chunk = uint8Array.subarray(offset, offset + CHUNK_SIZE);

        let binaryString = "";
        for (let i = 0; i < chunk.length; i += 8192) {
          binaryString += String.fromCharCode.apply(null, chunk.subarray(i, i + 8192));
        }
        const codeB64 = btoa(binaryString);

        const payload = JSON.stringify({
          cmd: "upload",
          path: path,
          mode: mode,
          data: codeB64
        });

        this.socket.send(`__SYSTEM__:${payload}`);
        const success = await wailForAck();
        if (!success) {
          reject(new Error("Upload chunk failed"));
          return;
        }
        offset += CHUNK_SIZE;
      }
      resolve();
    });
  }

  async statFile(path) {
    return new Promise((resolve) => {
      const wailForStat = () => new Promise(r => {
        const handler = (data) => {
          if (typeof data === 'string') {
            if (data.includes(`Stat ${path} exists`)) {
              const parts = data.split(' ');
              const size = parseInt(parts[parts.length - 1]);
              const logListeners = this.eventListeners.get('log');
              if (logListeners) logListeners.splice(logListeners.indexOf(handler), 1);
              r({ exists: true, size: isNaN(size) ? 0 : size });
            } else if (data.includes(`Stat ${path} notfound`)) {
              const logListeners = this.eventListeners.get('log');
              if (logListeners) logListeners.splice(logListeners.indexOf(handler), 1);
              r({ exists: false, size: 0 });
            } else if (data.includes(`Command error`)) {
              const logListeners = this.eventListeners.get('log');
              if (logListeners) logListeners.splice(logListeners.indexOf(handler), 1);
              r({ exists: false, size: 0, error: true });
            }
          }
        };
        this.on('log', handler);
        setTimeout(() => {
          const logListeners = this.eventListeners.get('log');
          if (logListeners) {
            const idx = logListeners.indexOf(handler);
            if (idx > -1) logListeners.splice(idx, 1);
          }
          r({ exists: false, size: 0, timeout: true });
        }, 3000);
      });

      const payload = JSON.stringify({
        cmd: "stat",
        path: path
      });
      this.socket.send(`__SYSTEM__:${payload}`);
      wailForStat().then(resolve);
    });
  }

  async uploadModelIfNeeded(fs) {
    const workspaceStore = useWorkspaceStore()
    const model = workspaceStore.model
    if (!model) return

    const Format = pickByType(model.type)
    const blobs = await Format.readFromFS(fs, workspaceStore.id)

    const writeFile = async (remotePath, blob) => {
      const buf = await blob.arrayBuffer()
      toast.info(`Uploading ${remotePath.split("/").pop()} (${(blob.size / 1024 / 1024).toFixed(2)} MB)...`)
      await this.uploadFileChunked(remotePath, buf)
    }
    const statFile = async (remotePath) => {
      try {
        return await this.statFile(remotePath)
      } catch (e) {
        return { exists: false, size: 0 }
      }
    }

    try {
      await Format.uploadToBoard({ writeFile, statFile }, model.hash, blobs)
      toast.success("อัพโหลดโมเดลสำเร็จ")
    } catch (e) {
      console.error("Model upload error:", e)
      toast.error("อัพโหลดโมเดลไม่สำเร็จ")
    }
  }

  async upload(code, writeStartup = false, fs) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      toast.error("Shell not connected")
      return
    }

    try {
      this.socket.send("\x03") // Ctrl+C
      await new Promise(r => setTimeout(r, 300))

      const workspaceStore = useWorkspaceStore()
      const currentBoard = workspaceStore.currentBoard
      const pluginStore = usePluginStore()

      if (currentBoard?.codeTemplate) {
        code = currentBoard.codeTemplate.replace("##{main}##", code)
      }

      let filesUpload = []

      filesUpload.push({
        file: appPath("run.py"),
        content: code,
      })

      // Upload board python modules
      for (let module of currentBoard.pythonModules || []) {
        let scriptResponse = await fetch(module)
        if (scriptResponse.ok) {
          let scriptData = await scriptResponse.text()
          filesUpload.push({
            file: appPath(module.replace(currentBoard.path + "libs/", "")),
            content: scriptData,
          })
        }
      }

      // Upload plugin files
      for (let plugin of pluginStore.installed || []) {
        for (let codeFile of plugin.codeFiles || []) {
          let scriptResponse = await fetch(codeFile)
          if (scriptResponse.ok) {
            let scriptData = await scriptResponse.text()
            filesUpload.push({
              file: appPath(codeFile.replace(plugin.path + "libs/", "")),
              content: scriptData,
            })
          }
        }
      }

      // Upload models if any
      await this.uploadModelIfNeeded(fs);

      for (let file of filesUpload) {
        console.log("upload file : ", file.file)
        let buffer = new TextEncoder().encode(file.content).buffer;
        await this.uploadFileChunked(file.file, buffer);
      }

      // Kill previous python script
      const runPy = appPath("run.py")
      const killCmd = `ps | grep "${runPy}" | grep -v grep | awk '{print $1}' | xargs kill -9\r`
      this.socket.send(killCmd)
      await new Promise(r => setTimeout(r, 500))

      // Run python
      const runCmd = `python3 ${runPy}\r`
      this.socket.send(runCmd)

      toast.success("Code uploaded & running...")
      return true
    } catch (e) {
      console.error(e)
      toast.error("Upload failed: " + e.message)
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
