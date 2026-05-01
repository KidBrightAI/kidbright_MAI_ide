import { defineStore } from "pinia"

export const usePluginStore = defineStore({
  id: "plugin",
  state: () => ({
    plugins: [],     // available catalogue, populated by main.js at boot
    installed: [],   // user's selection, persisted across sessions
  }),
  persist: {
    paths: ['installed'],
  },
})
