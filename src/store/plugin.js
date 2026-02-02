import { defineStore } from "pinia"

export const usePluginStore = defineStore({
  id: "plugin",
  state: () => {
    return {
      plugins: [],
      installed: [],
    }
  },
  persist: {
    paths: ['installed'],
  },
  actions: {
    
  },
})
