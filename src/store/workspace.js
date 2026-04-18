import { defineStore } from "pinia"
import { loadBoard, loadPlugin } from "../engine/board"
import { usePluginStore } from "./plugin"
import { useDatasetStore } from "./dataset"
import { useServerStore } from "./server"

import ProjectIOService from "@/services/ProjectIOService"
import { applyBoardDefaults } from "@/engine/graph-merge"
import { setBoardContext } from "@/engine/board-node-options"


export const useWorkspaceStore = defineStore({
  id: "workspace",
  state: () => {
    return {
      mode: 'block',
      code: null,
      block: null,
      currentBoard: null,
      boards: [],
      name: null,
      id: null,
      dataset: [],
      projectType: null, //id of extension
      projectTypeTitle: null, //this.models.find(el=>el.value == this.selectType).text,
      lastUpdate: null,
      extension: null,
      labels: [],
      model: null,
      saving: false,
      opening: false,
      openingProgress: 0,
      savingProgress: 0,
      defaultGraph: {},
      graph: {},

      trainConfig: {},
    }
  },
  persist: {
    paths: [
      'mode',
      'code',
      'block',
      'currentBoard',
      'name',
      'board',
      'id',
      'dataset',
      'projectType',
      'projectTypeTitle',
      'lastUpdate',
      'model',
      'labels',
      'colabUrl',
      'extension',
      'trainConfig',
      'graph',
      'defaultGraph',
    ],
  },
  actions: {
    downloadBlob(filename, data) {
      var a = document.createElement("a")
      document.body.appendChild(a)
      a.style = "display: none"
      let url = window.URL.createObjectURL(data)
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    async saveProject(mode = 'download', filename = 'project.zip') {
      this.saving = true
      this.savingProgress = 0
      console.log("saving project")

      const projectIOService = new ProjectIOService(this.$fs)

      try {
        const stateToSave = {
          ...this.$state,
          plugin: usePluginStore().installed,
        }

        const result = await projectIOService.saveProject(
          stateToSave,
          useDatasetStore(),
          filename,
          mode,
        )

        if (mode === 'upload') return result

      } catch (e) {
        console.error("Save project failed", e)
      } finally {
        this.saving = false
        this.savingProgress = 100
      }
    },
    async createNewProject(projectInfo) {
      this.mode = projectInfo.mode || 'block'
      this.code = null
      this.block = null
      this.name = projectInfo.name
      this.currentBoard = this.boards.find(board => board.id == projectInfo.board)
      this.id = projectInfo.id
      this.dataset = projectInfo.dataset
      this.labels = projectInfo.labels
      this.projectType = projectInfo.projectType
      this.projectTypeTitle = projectInfo.projectTypeTitle
      this.lastUpdate = projectInfo.lastUpdate
      this.extension = projectInfo.extension
      this.model = projectInfo.model
      this.defaultGraph = {}
      this.graph = {}
      this.trainConfig = {}

      // clear server store 
      const serverStore = useServerStore()
      serverStore.clear()

      //--------- load default code from board --------//
      if (projectInfo.block) {
        this.block = projectInfo.block
      }
      if (projectInfo.code) {
        this.code = projectInfo.code
      }
      console.log("create project with code")

      //--------- load board'blocks --------//
      if (projectInfo.plugin) {
        const pluginStore = usePluginStore()
        pluginStore.installed = projectInfo.plugin
        await loadPlugin(projectInfo.plugin)
      }
      await loadBoard(this.currentBoard)

      return true
    },
    async deleteProject() {
      // clear dataset
      await this.$fs.removeFolder(this.id)

      this.mode = 'block'
      this.code = null
      this.block = null
      this.currentBoard = null
      this.name = null
      this.id = null
      this.dataset = []
      this.projectType = null
      this.projectTypeTitle = null
      this.lastUpdate = null
      this.extension = null
      this.labels = []
      this.model = null

      // clear local storage
      this.$reset()

      // reload page
      window.location.reload()
    },
    async selectProjectType(projectType) {

      console.log("select project type : ", projectType)

      this.projectType = projectType.projectType
      this.projectTypeTitle = projectType.projectTypeTitle
      this.extension = projectType.extension

      // create new dataset
      //--------- create dataset for project --------//
      const datasetStore = useDatasetStore()
      let dataset = {
        project: this.id,
        datasetType: this.extension.id,
        data: [],
        baseURL: "",
      }

      // Apply board-specific overrides before the designer mounts so the
      // dropdowns and defaults reflect the target hardware. Node factories
      // read setBoardContext via @/engine/board-node-options.
      setBoardContext(this.currentBoard, this.extension.id)
      this.defaultGraph = applyBoardDefaults(
        this.extension.graph,
        this.extension.id,
        this.currentBoard,
      )
      await datasetStore.createDataset(dataset)

      return true
    },
    async resetProjectType() {
      this.projectType = null
      this.projectTypeTitle = null
      this.extension = null
      this.labels = []
      this.model = null
      this.defaultGraph = {}
      this.graph = {}
      this.trainConfig = {}

      //----- clear dataset -----//      
      await this.$fs.removeFolder(this.id)
      const datasetStore = useDatasetStore()
      await datasetStore.clearDataset()

      //----- clear server store -----//
      const serverStore = useServerStore()
      serverStore.$reset()

      return true
    },
    selectAndReadFile(ext = '.zip') {
      return new Promise((resolve, reject) => {
        let input = document.createElement("input")
        input.type = "file"
        input.accept = ext
        input.addEventListener("change", function () {
          console.log("user loaded file")
          document.body.removeChild(input)
          let fr = new FileReader()
          fr.onload = async () => {
            resolve(fr.result)
          }
          fr.readAsArrayBuffer(this.files[0])
        })
        document.body.appendChild(input)
        setTimeout(() => {
          input.click()
          const onFocus = () => {
            window.removeEventListener("focus", onFocus)
            document.body.addEventListener("mousemove", onMouseMove)
          }
          const onMouseMove = () => {
            document.body.removeEventListener("mousemove", onMouseMove)
            if (!input.files.length) {
              document.body.removeChild(input)
              console.log("no file selected")
              reject("NOFILE")
            }
          }
          window.addEventListener("focus", onFocus)
        }, 0)
      })
    },

    // open select file dialog and read ziped file
    async openProjectFromZip() {
      try {
        let datasetStore = useDatasetStore()
        let data = await this.selectAndReadFile()

        this.opening = true
        this.openingProgress = 0

        const projectIOService = new ProjectIOService(this.$fs)
        const { projectData, datasetData, entry } = await projectIOService.loadProjectZip(data, this, datasetStore)

        // Update Store State
        this.code = projectData.code
        this.block = projectData.block
        this.currentBoard = this.boards.find(board => board.id == projectData.currentBoard.id)
        this.name = projectData.name
        this.id = projectData.id
        this.dataset = projectData.dataset
        this.projectType = projectData.projectType
        this.projectTypeTitle = projectData.projectTypeTitle
        this.lastUpdate = projectData.lastUpdate
        this.extension = projectData.extension
        this.model = projectData.model
        this.labels = projectData.labels

        this.defaultGraph = projectData.defaultGraph
        this.graph = projectData.graph
        this.trainConfig = projectData.trainConfig

        datasetStore.project = datasetData.project
        datasetStore.datasetType = datasetData.datasetType
        datasetStore.data = datasetData.data
        datasetStore.baseURL = entry.toURL()

        if (projectData.plugin) {
          const pluginStore = usePluginStore()
          pluginStore.installed = projectData.plugin
          await loadPlugin(projectData.plugin)
        }
        await loadBoard(this.currentBoard)

        this.openingProgress = 100

        setTimeout(() => {
          window.location.reload()
        }, 1000)

        return true
      } catch (e) {
        if (e == "NOFILE") {
          console.log('no file selected')
        } else {
          console.log(e)

          return false
        }
      } finally {
        this.opening = false
      }
    },
    async importModelFromBlob(Format, blobs) {
      // Format is a class from src/engine/model-formats/. Blobs is a
      // {role: Blob} dict produced by Format.download(). The format class
      // decides which files to save, how to clean up stale formats, and
      // what primary file to hash.
      try {
        await Format.saveToFS(this.$fs, this.id, blobs)
        const hash = await Format.computeHash(blobs)
        this.model = {
          name: 'model',
          type: Format.typeTag,
          hash,
        }
        console.log("model data", this.model)

        return true
      } catch (e) {
        console.log(e)

        return false
      }
    },

    saveAs(content, filename) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    },

    switchMode(mode) {
      if (mode == 'block') {
        this.mode = 'block'
        this.code = null
        this.block = null
      } else if (mode == 'code') {
        this.mode = 'code'
        this.code = null
        this.block = null
      }
    },
    addLabel(label) {
      if (!this.labels.find(el => el.label == label.label)) {
        this.labels.push(label)
      }
    },
    changeLabel({ oldLabel, newLabel }) {
      let ind = this.labels.findIndex(el => el.label == oldLabel)
      this.labels[ind].label = newLabel
    },
    removeLabel(label) {
      this.labels = this.labels.filter(el => el.label != label)
    },
  },
})
