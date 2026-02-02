import JSZip from "jszip"
import { defineStore } from "pinia"
import { loadBoard, loadPlugin } from "../engine/board"
import { usePluginStore } from "./plugin"
import { useDatasetStore } from "./dataset"
import { useServerStore } from "./server"

import { sleep } from "@/engine/helper"
import { md5 } from 'hash-wasm'
import ProjectIOService from "@/services/ProjectIOService"


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

      //set graph
      this.defaultGraph = this.extension.graph
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
    async importModelFromBlob(modelBin, modelParam) {
      try {
        let modelBinaries = new Blob([modelBin], { type: 'application/octet-stream' })
        let modelParams = new Blob([modelParam], { type: 'application/octet-stream' })

        //remove old model
        try {
          await this.$fs.removeFile(`${this.id}/model.bin`)
        } catch (e) {
          console.log(e)
        }
        try {
          await this.$fs.removeFile(`${this.id}/model.param`)
        } catch (e) {
          console.log(e)
        }
        await this.$fs.writeFile(`${this.id}/model.bin`, modelBinaries)
        await this.$fs.writeFile(`${this.id}/model.param`, modelParams)
        let hash = await md5(new Uint8Array(await modelBin.arrayBuffer()))
        this.model = {
          name: 'model',
          type: 'bin',
          hash: hash,
        }
        console.log("model data", this.model)
        
        return true
      } catch (e) {
        console.log(e)
        
        return false
      }
    },

    async importModelFromZip() {
      try {
        let data = await this.selectAndReadFile()
        let zip = new JSZip()
        await zip.loadAsync(data)
        let modelBinaries = await zip.file("classifier_awnn.bin").async("arraybuffer")
        let modelParams = await zip.file("classifier_awnn.param").async("arraybuffer")

        //remove old model
        try {
          await this.$fs.removeFile(`${this.id}/model.bin`)
        } catch (e) {
          console.log(e)
        }
        try {
          await this.$fs.removeFile(`${this.id}/model.param`)
        } catch (e) {
          console.log(e)
        }
        await this.$fs.writeFile(`${this.id}/model.bin`, new Blob([modelBinaries]))
        await this.$fs.writeFile(`${this.id}/model.param`, new Blob([modelParams]))

        // read labels.txt
        //check is labels.txt exist

        // if(zip.file("labels.txt")){
        //   let labels = await zip.file("labels.txt").async("string");
        //   labels = labels.split("\n");
        //   //trim empty line and \r
        //   labels = labels.filter(el => el.trim() != "");
        //   labels = labels.map(el => el.trim());
        //   this.modelLabel = labels;
        //   console.log("model label : ", this.modelLabel);
        // }else {
        //   this.modelLabel = [];
        // }

        let hash = await md5(new Uint8Array(modelBinaries))
        this.model = {
          name: 'model',
          type: 'bin',
          hash: hash,
        }
        console.log("model data", this.model)
        
        return true
      } catch (e) {
        if (e == "NOFILE") {
          console.log('no file selected')
        } else {
          console.log(e)
          
          return false
        }
      }
    },
    async importObjectDetectionModelFromZip() {
      try {
        let data = await this.selectAndReadFile()
        let zip = new JSZip()
        await zip.loadAsync(data)
        let modelBinaries = await zip.file("classifier_awnn.bin").async("arraybuffer")
        let modelParams = await zip.file("classifier_awnn.param").async("arraybuffer")

        //remove old model
        try {
          await this.$fs.removeFile(`${this.id}/model.bin`)
        } catch (e) {
          console.log(e)
        }
        try {
          await this.$fs.removeFile(`${this.id}/model.param`)
        } catch (e) {
          console.log(e)
        }

        await this.$fs.writeFile(`${this.id}/model.bin`, new Blob([modelBinaries]))
        await this.$fs.writeFile(`${this.id}/model.param`, new Blob([modelParams]))
        let hash = await md5(new Uint8Array(modelBinaries))
        let paramHash = await md5(new Uint8Array(modelParams))
        console.log("params hash : ", paramHash)
        console.log("model hash : ", hash)

        // check again
        let modelBinariesFile = await this.$fs.readAsFile(`${this.id}/model.bin`)
        let modelParamsFile = await this.$fs.readAsFile(`${this.id}/model.param`)
        let paramHashFile = await md5(new Uint8Array(await modelParamsFile.arrayBuffer()))
        let modelHashFile = await md5(new Uint8Array(await modelBinariesFile.arrayBuffer()))
        console.log("storeage param hash : ", paramHashFile)
        console.log("storage model hash : ", modelHashFile)

        // if(zip.file("labels.txt")){
        //   let labels = await zip.file("labels.txt").async("string");
        //   labels = labels.split("\n");
        //   //trim empty line and \r
        //   labels = labels.filter(el => el.trim() != "");
        //   labels = labels.map(el => el.trim());
        //   this.modelLabel = labels;
        //   console.log("model label : ", this.modelLabel);
        // }else {
        //   this.modelLabel = [];
        // }

        this.model = {
          name: 'model',
          type: 'bin',
          hash: hash,
        }
        console.log("model data", this.model)
        
        return true
      } catch (e) {
        if (e == "NOFILE") {
          console.log('no file selected')
        } else {
          console.log(e)
          
          return false
        }
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
