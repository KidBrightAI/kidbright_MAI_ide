import { sleep } from "@/engine/helper"
import { defineStore } from "pinia"
import { markRaw } from "vue"
import { toast } from "vue3-toastify"
import { useWorkspaceStore } from "./workspace"
import { WebAdbHandler } from "@/engine/protocols/web-adb.js"
import { WebSocketShellHandler } from "@/engine/protocols/websocket-shell.js"


export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    return {
      isElectron: false,
      firmwareUpdateMode: false,
      uploading: false,
      // True between a successful upload() and the next stop / reboot /
      // disconnect — the upload icon flips to a stop icon so the student
      // can interrupt their loop without dropping into the terminal.
      running: false,
      // Bumped by the protocol handler whenever its capability set
      // changes (e.g. after probing the board's ws_shell.py version).
      // The capabilities getter touches this so Vue knows to re-render
      // dependent UI even though `handler` itself is markRaw.
      capabilitiesRevision: 0,
      connected: false,
      wifiConnected: false,
      wifiSsid: null,                // populated alongside wifiConnected
      wifiIp: null,                  // ip_address from wpa_cli status
      wifiConnecting: false,
      wifiListing: false,
      handler: null,
      showSecureConnectDialog: false,
    }
  },
  getters: {
    boardIp() {
      const workspaceStore = useWorkspaceStore()
      const currentBoard = workspaceStore.currentBoard
      if (currentBoard?.wsShell) {
        try {
          // Parse IP from wsShell URL (e.g. wss://10.155.55.1:5050)
          const url = new URL(currentBoard.wsShell)
          return url.hostname
        } catch (e) {
          console.error("Failed to parse board IP", e)
        }
      } else if (currentBoard?.wsUrl) {
        try {
          // Parse IP from wsUrl URL (e.g. ws://10.155.55.1:7899)
          const url = new URL(currentBoard.wsUrl)
          return url.hostname
        } catch (e) {
          console.error("Failed to parse board IP", e)
        }
      }
      return "10.155.55.1" // Fallback
    },
    isBoardConnected() {
      return this.connected
    },
    /**
     * What the active protocol supports. Dialogs read this to disable
     * wifi / file-explorer menus on boards that don't implement them.
     * Falls back to an all-false shape when no handler exists yet, so
     * templates can access `.wifi` etc. unconditionally.
     *
     * The protocol handler is markRaw, so Vue can't observe its
     * internal feature set. The handler bumps `capabilitiesRevision`
     * after probing, and we read it here to register the dependency.
     */
    capabilities() {
      void this.capabilitiesRevision
      return this.handler?.capabilities ?? {
        wifi: false,
        fileExplorer: false,
        startupScript: false,
      }
    },
  },
  actions: {
    async getHandler() {
      if (this.handler?.isConnected()) {
        return this.handler
      }
      const workspaceStore = useWorkspaceStore()
      const currentBoard = workspaceStore.currentBoard
      if (!currentBoard) {
        toast.error("กรุณาเลือกบอร์ดก่อน")

        return null
      }

      switch (currentBoard.protocol) {
        case "web-adb":
          this.handler = markRaw(new WebAdbHandler())
          break
        case "websocket-shell":
          this.handler = markRaw(new WebSocketShellHandler())
          break
        default:
          toast.error(`ไม่รองรับโปรโตคอล: ${currentBoard.protocol}`)
          this.handler = null

          return null
      }

      return this.handler
    },

    async deviceConnect() {
      const handler = await this.getHandler()
      if (!handler) return

      const workspaceStore = useWorkspaceStore()
      const currentBoard = workspaceStore.currentBoard

      const success = await handler.connect(currentBoard)
      this.connected = success

      if (success) {
        // The board may already be on a saved WiFi network from a
        // previous session — don't make the user click the WiFi
        // button just to learn that. Try once now (V1 capabilities
        // are static) and once after a short delay (V2's version
        // probe runs async, so capabilities.wifi may flip on a beat
        // after connect).
        this._refreshWifiSilently()
        setTimeout(() => this._refreshWifiSilently(), 1500)
      }

      return success
    },

    /**
     * Update wifiConnected / wifiSsid by asking the protocol handler.
     * Silent — failures are swallowed because this runs as a
     * speculative refresh; if it doesn't work, the WiFi dialog will
     * just re-query when the user opens it.
     */
    async _refreshWifiSilently() {
      if (!this.handler || !this.capabilities.wifi) return
      try {
        const r = await this.handler.checkWifi()
        this.wifiConnected = !!r?.connected
        this.wifiSsid      = r?.info?.ssid       || null
        this.wifiIp        = r?.info?.ip_address || null
      } catch (_) { /* swallow — speculative */ }
    },

    async deviceDisconnect() {
      if (this.handler) {
        await this.handler.disconnect()
        this.handler = null
        this.connected = false
        this.running = false
        this.wifiConnected = false
        this.wifiSsid = null
        this.wifiIp = null
      }
    },

    /**
     * Lazy-reconnect helper used by every command that talks to the
     * board. Returns true once the link is up, false if connect failed.
     * Throws (instead of returning false) when `mustConnect` is set,
     * matching the WiFi actions that always expected a connection.
     */
    async _ensureConnected({ mustConnect = false } = {}) {
      if (this.connected) return true
      if (await this.deviceConnect()) {
        await sleep(300)
        return true
      }
      if (mustConnect) throw new Error("device not connected")
      return false
    },

    async checkWifi() {
      await this._ensureConnected({ mustConnect: true })
      this.wifiListing = true
      try {
        const result = await this.handler.checkWifi()
        this.wifiConnected = result.connected
        return result
      } finally {
        this.wifiListing = false
      }
    },

    async listWifi() {
      await this._ensureConnected({ mustConnect: true })
      this.wifiListing = true
      try {
        return await this.handler.listWifi()
      } finally {
        this.wifiListing = false
      }
    },

    async connectWifi(ssid, password) {
      await this._ensureConnected({ mustConnect: true })
      this.wifiConnecting = true
      try {
        return await this.handler.connectWifi(ssid, password)
      } finally {
        this.wifiConnecting = false
      }
    },

    async upload(code, writeStartup = false) {
      if (!(await this._ensureConnected())) return
      this.uploading = true
      try {
        // this.$fs is the Persistent FS plugin, injected on the store.
        const result = await this.handler.upload(code, writeStartup, this.$fs)
        if (result) this.running = true
        return result
      } finally {
        this.uploading = false
      }
    },

    /** Send Ctrl+C to the running script and flip the running flag. */
    async stopProgram() {
      if (!this.handler) return
      try {
        await this.handler.interrupt()
      } finally {
        this.running = false
      }
    },

    /**
     * Install a packaged Maix App into /maixapp/apps/<id>/. Different
     * from upload(): writes a folder full of files (app.yaml, app.png,
     * main.py, run.py) so the launcher picks the app up. Optionally
     * writes /maixapp/auto_start.txt to set it as the boot app.
     */
    async deployAsApp(payload) {
      if (!(await this._ensureConnected())) return
      this.uploading = true
      try {
        return await this.handler.deployAsApp(payload, this.$fs)
      } finally {
        this.uploading = false
      }
    },

    // File-explorer wrappers: every one is "ensure-connected then
    // delegate to handler", so route them through a single helper.
    async _viaHandler(method, ...args) {
      await this._ensureConnected()
      return this.handler[method](...args)
    },
    listDir(path)               { return this._viaHandler("listDir", path) },
    downloadFile(path)          { return this._viaHandler("downloadFile", path) },
    deleteFileOrFolder(path)    { return this._viaHandler("deleteFileOrFolder", path) },
    createNewFolder(path)       { return this._viaHandler("createNewFolder", path) },
    uploadFile(path, file)      { return this._viaHandler("uploadFile", path, file) },

    async rebootBoard() {
      if (!this.connected) {
        toast.error("ไม่ได้เชื่อมต่อบอร์ด")
        return
      }
      await this.handler.rebootBoard()
      this.connected = false
      this.handler = null
      this.running = false
    },
  },
})
