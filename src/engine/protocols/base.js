import { toast } from "vue3-toastify"
import { useWorkspaceStore } from "@/store/workspace"
import { usePluginStore } from "@/store/plugin"
import { pickByType } from "@/engine/model-formats"
import { appPath } from "@/engine/board-paths"

/**
 * Abstract base for board transport protocols.
 *
 * A "protocol" connects to a physical board, deploys user Python code +
 * board libraries + plugin libraries, and manages model files on device.
 * Concrete subclasses implement transport primitives (`writeFile`,
 * `execShell`, ...) and inherit the shared upload / model-upload
 * orchestration — so adding a new board (ESP32 MicroPython, RPi2040, …)
 * is "implement ~6 methods", not "copy-paste the upload loop".
 *
 * Not every protocol supports every optional feature. Subclasses
 * advertise support via `capabilities` (wifi / fileExplorer /
 * startupScript), and UI layers gate menu items on those flags instead
 * of branching on `board.protocol === "xxx"`.
 */
export default class BoardProtocol {
  constructor() {
    if (new.target === BoardProtocol) {
      throw new Error("BoardProtocol is abstract — subclass it.")
    }
  }

  // ========================================================== capabilities

  /**
   * What this protocol supports. Override in subclass. UI gates menus.
   */
  get capabilities() {
    return {
      wifi: false,
      fileExplorer: false,
      startupScript: false,
    }
  }

  // ========================================================== lifecycle

  async connect(board)    { throw new Error("connect() not implemented") }
  async disconnect()      { throw new Error("disconnect() not implemented") }
  isConnected()           { throw new Error("isConnected() not implemented") }
  async rebootBoard()     { throw new Error("rebootBoard() not implemented") }

  // ========================================================== transport primitives

  /**
   * Write bytes to a remote path. `content` accepts string | Blob |
   * ArrayBuffer. Subclasses convert to the form their transport needs.
   */
  async writeFile(path, content, { permission = 0o666 } = {}) {
    throw new Error("writeFile() not implemented")
  }

  /**
   * Stat a remote path. Returns { exists: boolean, size: number }.
   * Used by ModelFormat.uploadToBoard to skip already-present files.
   */
  async statFile(path) {
    throw new Error("statFile() not implemented")
  }

  /**
   * Fire-and-forget shell command. Used for post-upload sync/kill/run.
   * Subclass decides line terminator and transport (SingletonShell write
   * vs WebSocket send).
   */
  async execShell(cmd) {
    throw new Error("execShell() not implemented")
  }

  /**
   * Send Ctrl-C / kill running python before writing new files.
   */
  async interrupt() {
    throw new Error("interrupt() not implemented")
  }

  /**
   * Forward raw keystroke/bytes from a terminal UI to the board shell.
   * Separate from `execShell(cmd)` because shell-panel input is byte-
   * level (including Ctrl codes / partial lines) while `execShell` sends
   * a complete command followed by its own terminator.
   */
  writeInput(data) {
    throw new Error("writeInput() not implemented")
  }

  /**
   * Subscribe the terminal-bridge callback to the shell's output stream.
   * Returns an unsubscribe function — the bottom-pane composable stores
   * it and calls it on component unmount so the subscription doesn't
   * leak across navigation or shadow a later subscriber.
   */
  async attachOutput(callback) {
    throw new Error("attachOutput() not implemented")
  }

  // ========================================================== bulk tx hook

  /**
   * Protocols with expensive per-write setup (ADB sync channel) can
   * open a shared session before `upload()` writes many files and
   * close it in `endBulkWrite`. Default = no-op (each writeFile
   * handles its own transaction).
   */
  async beginBulkWrite() { /* override if optimizable */ }
  async endBulkWrite()   { /* override if optimizable */ }

  // ========================================================== file explorer (optional)

  async listDir(path)              { throw new Error("listDir() not implemented") }
  async downloadFile(path)         { throw new Error("downloadFile() not implemented") }
  async deleteFileOrFolder(path)   { throw new Error("deleteFileOrFolder() not implemented") }
  async createNewFolder(path)      { throw new Error("createNewFolder() not implemented") }

  /**
   * Single-file upload entrypoint for the File Explorer dialog etc.
   * Default routes through writeFile — subclasses rarely need to
   * override.
   */
  async uploadFile(path, file) {
    return this.writeFile(path, file)
  }

  // ========================================================== wifi (optional)

  async listWifi()                           { throw new Error("listWifi() not implemented") }
  async checkWifi()                          { throw new Error("checkWifi() not implemented") }
  async connectWifi(ssid, password)          { throw new Error("connectWifi() not implemented") }

  // ========================================================== shared orchestration

  /**
   * Deploy user code + board libs + plugin libs to the device, then
   * restart the running python process. Works on any subclass that
   * implements the primitives above — do NOT override unless the
   * protocol has fundamentally different semantics (see WebSocketHandler
   * which sends Run-command bytes directly and does not upload files).
   */
  async upload(code, writeStartup = false, fs) {
    try {
      await this.beginBulkWrite()
      await this.interrupt()

      const files = await this._buildFilesUpload(code, writeStartup)
      await this.uploadModelIfNeeded(fs)

      for (const f of files) {
        console.log("upload file:", f.file)
        await this.writeFile(f.file, f.content, { permission: f.permission })
      }
      await this._afterUpload(writeStartup)
      return true
    } finally {
      await this.endBulkWrite()
    }
  }

  /**
   * Deploy the workspace's current model to the board via its
   * ModelFormat. Reads file blobs from local FS, skips files that
   * already exist with the matching size, writes only what's missing.
   */
  async uploadModelIfNeeded(fs) {
    const workspaceStore = useWorkspaceStore()
    const model = workspaceStore.model
    if (!model) return

    const Format = pickByType(model.type)
    const blobs = await Format.readFromFS(fs, workspaceStore.id)

    const writeFile = (remotePath, blob) => this.writeFile(remotePath, blob)
    const statFile = (remotePath) => this.statFile(remotePath)

    try {
      await Format.uploadToBoard({ writeFile, statFile }, model.hash, blobs)
      toast.success("อัพโหลดโมเดลสำเร็จ")
    } catch (e) {
      console.error("Model upload error:", e)
      toast.error("อัพโหลดโมเดลไม่สำเร็จ")
    }
  }

  // ========================================================== hooks (overridable)

  /**
   * Assemble the list of files that `upload()` will write. Includes
   * run.py, optional startup.py + init.d script (if the protocol
   * supports startupScript), every board python module, every
   * installed plugin's python files. Override only to add board-scoped
   * oddities, not to change the general shape.
   */
  async _buildFilesUpload(code, writeStartup) {
    const workspaceStore = useWorkspaceStore()
    const pluginStore = usePluginStore()
    const currentBoard = workspaceStore.currentBoard

    if (currentBoard?.codeTemplate) {
      code = currentBoard.codeTemplate.replace("##{main}##", code)
    }

    const files = [{ file: appPath("run.py"), content: code }]

    if (writeStartup && this.capabilities.startupScript) {
      files.push(...this._buildStartupFiles(code))
    }

    for (const module of currentBoard?.pythonModules || []) {
      const response = await fetch(module)
      if (response.ok) {
        files.push({
          file: appPath(module.replace(currentBoard.path + "libs/", "")),
          content: await response.text(),
        })
      }
    }

    for (const plugin of pluginStore.installed || []) {
      for (const codeFile of plugin.codeFiles || []) {
        const response = await fetch(codeFile)
        if (response.ok) {
          files.push({
            file: appPath(codeFile.replace(plugin.path + "libs/", "")),
            content: await response.text(),
          })
        }
      }
    }

    return files
  }

  /**
   * Extra files written when `writeStartup` is requested and the
   * protocol declares `capabilities.startupScript`. Default empty —
   * V831 overrides this to emit /etc/init.d/S02app + startup.py.
   */
  _buildStartupFiles(code) { return [] }

  /**
   * Called after every file (including model files) has been written.
   * Default implementation: sync + killall python3 + run run.py via
   * execShell. Subclasses with different shell semantics (e.g.
   * websocket-shell uses surgical `ps | grep | kill -9`) override.
   */
  async _afterUpload(writeStartup) {
    await this.execShell("sync")
    await this.execShell("killall python3")
    await this.execShell(`python3 ${appPath("run.py")}`)
  }
}
