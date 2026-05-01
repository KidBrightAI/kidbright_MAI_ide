import { sleep } from "@/engine/helper"
import { defineStore } from "pinia"
import { markRaw } from "vue"
import { toast } from "vue3-toastify"
import { useWorkspaceStore } from "./workspace"
import { WebAdbHandler } from "@/engine/protocols/web-adb.js"
import { WebSocketHandler } from "@/engine/protocols/websocket.js"
import { WebSocketShellHandler } from "@/engine/protocols/websocket-shell.js"


export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    return {
      isElectron: false,
      firmwareUpdateMode: false,
      uploading: false,
      connected: false,
      wifiConnected: false,
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
     */
    capabilities() {
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
        case "websocket":
          this.handler = markRaw(new WebSocketHandler())
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

      return success
    },

    async deviceDisconnect() {
      if (this.handler) {
        await this.handler.disconnect()
        this.handler = null
        this.connected = false
      }
    },

    async checkWifi() {
      if (!this.isBoardConnected) {
        if (!(await this.deviceConnect())) {
          throw new Error("device not connected")
        }
        await sleep(300)
      }
      this.wifiListing = true
      const result = await this.handler.checkWifi()
      this.wifiConnected = result.connected
      this.wifiListing = false

      return result
    },

    async listWifi() {
      if (!this.isBoardConnected) {
        if (!(await this.deviceConnect())) {
          throw new Error("device not connected")
        }
        await sleep(300)
      }
      this.wifiListing = true
      const wifiList = await this.handler.listWifi()
      this.wifiListing = false

      return wifiList
    },

    async connectWifi(ssid, password) {
      if (!this.isBoardConnected) {
        if (!(await this.deviceConnect())) {
          throw new Error("device not connected")
        }
        await sleep(300)
      }
      this.wifiConnecting = true
      const success = await this.handler.connectWifi(ssid, password)
      this.wifiConnecting = false

      return success
    },

    async upload(code, writeStartup = false) {
      if (!this.isBoardConnected) {
        if (!(await this.deviceConnect())) {
          return
        }
        await sleep(300)
      }

      this.uploading = true
      try {
        // Note: this.$fs is injected by a plugin. We pass it to the handler.
        return await this.handler.upload(code, writeStartup, this.$fs)
      } catch (e) {
        throw e
      } finally {
        this.uploading = false
      }
    },

    /**
     * Install a packaged Maix App into /maixapp/apps/<id>/. Different
     * from upload(): writes a folder full of files (app.yaml, app.png,
     * main.py, run.py) so the launcher picks the app up. Optionally
     * writes /maixapp/auto_start.txt to set it as the boot app.
     */
    async deployAsApp(payload) {
      if (!this.isBoardConnected) {
        if (!(await this.deviceConnect())) return
        await sleep(300)
      }
      this.uploading = true
      try {
        return await this.handler.deployAsApp(payload)
      } finally {
        this.uploading = false
      }
    },

    // Wrap other handler methods
    async listDir(path) {
      if (!this.isBoardConnected) { await this.deviceConnect(); await sleep(300) }

      return this.handler.listDir(path)
    },
    async downloadFile(path) {
      if (!this.isBoardConnected) { await this.deviceConnect(); await sleep(300) }

      return this.handler.downloadFile(path)
    },
    async deleteFileOrFolder(path) {
      if (!this.isBoardConnected) { await this.deviceConnect(); await sleep(300) }

      return this.handler.deleteFileOrFolder(path)
    },
    async createNewFolder(path) {
      if (!this.isBoardConnected) { await this.deviceConnect(); await sleep(300) }

      return this.handler.createNewFolder(path)
    },
    async uploadFile(path, file) {
      if (!this.isBoardConnected) { await this.deviceConnect(); await sleep(300) }

      return this.handler.uploadFile(path, file)
    },
    async rebootBoard() {
      if (!this.isBoardConnected) {
        toast.error("ไม่ได้เชื่อมต่อบอร์ด")

        return
      }
      await this.handler.rebootBoard()
      this.connected = false
      this.handler = null
    },
  },
})
