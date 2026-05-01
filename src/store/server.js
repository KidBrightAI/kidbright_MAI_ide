import { defineStore } from "pinia"

// other store
import { useWorkspaceStore } from "./workspace"

//axios
import axios from 'axios'
import { toast } from "vue3-toastify"
import { pickFor } from "@/engine/model-formats"

export const useServerStore = defineStore({
  id: "server",
  state: () => {
    return {
      // event
      event: null,

      //colab training server
      serverUrl: null,


      //training
      isColabConnecting: false,
      isColabConnected: false,
      isTraining: false,
      trainingProgress: 0,
      isTrainingSuccess: false,
      isConverting: false,
      isConvertingSuccess: false,
      isDownloading: false,
      isDownloadingSuccess: false,
      downloadProgress: 0,
      downloadingFiles: 0,
      totalDownloadingFiles: 2,
      isUploading: false,
      uploadProgress: 0,

      totalEpoch: 0,
      epoch: 0,

      totalBatch: 0,
      batch: 0,

      messagesLog: [],
      step: 0,
      progress: 0,
      matric: [],
    }
  },
  persist: {
    paths: [
      "serverUrl", "matric",
    ],
  },
  actions: {
    clear() {
      this.serverUrl = null
    },
    async connectColab() {
      this.isColabConnecting = true
      try {
        const response = await axios.get(this.serverUrl + "/ping")
        if (response.data.result !== "pong") {
          this.isColabConnected = false
          return false
        }
        // Server stages: 0 none, 1 prepare dataset, 2 training,
        // 3 trained, 4 converting, 5 converted. Map the meaningful
        // ones into our boolean flags in one pass.
        const stageFlags = {
          2: { isTraining: true,  isTrainingSuccess: false, isConverting: false, isConvertingSuccess: false },
          3: { isTraining: false, isTrainingSuccess: true,  isConverting: false, isConvertingSuccess: false },
          4: { isTraining: false, isTrainingSuccess: true,  isConverting: true,  isConvertingSuccess: false },
          5: { isTraining: false, isTrainingSuccess: true,  isConverting: false, isConvertingSuccess: true  },
        }
        const flags = stageFlags[response.data.stage]
        if (flags) Object.assign(this, flags)

        if (this.event) this.event.close()
        this.event = new EventSource(this.serverUrl + "/listen")
        this.event.onmessage = this.onmessage
        this.isColabConnected = true
        return true
      } catch (e) {
        console.error(e)
        this.isColabConnected = false
        return false
      } finally {
        this.isColabConnecting = false
      }
    },

    onmessage(event) {
      const data = JSON.parse(event.data)
      const ts = new Date(data.time * 1000).toLocaleString()
      const log = msg => this.messagesLog.push(`[${ts}]: ${msg}`)

      switch (data.event) {
        case "initial":
          this.messagesLog = []
          this.matric = []
          return
        case "epoch_start":
          this.epoch = data.epoch
          this.totalEpoch = data.max_epoch
          log(`training epoch ${data.epoch}`)
          return
        case "epoch_end":
          this.matric = [...this.matric, {
            epoch: data.epoch,
            max_epoch: data.max_epoch,
            label: data.epoch,
            matric: data.matric,
            prefix: "train_",
          }]
          log(`epoch [${data.epoch}] ended`)
          return
        case "batch_start":
          this.batch = data.batch
          this.totalBatch = data.max_batch
          this.progress = (data.batch / data.max_batch) * 100
          return
        case "batch_end":
          this.progress = (data.batch / data.max_batch) * 100
          return
        case "train_end":
          this.isTrainingSuccess = true
          this.isTraining = false
          log(data.msg)
          toast.success("เทรนโมเดลสำเร็จ")
          return
        default:
          // convert_model_init / _progress / _end and anything else
          // the server emits — just append to the message log.
          log(data.msg)
      }
    },
    async terminateColab() {
      try {
        let workspaceStore = useWorkspaceStore()

        // axios request /terminate
        let response = await axios.get(this.serverUrl + "/terminate", {
          params: {
            project_id: workspaceStore.id,
          },
        })
        console.log(response.data)
        if (response.data.result == "OK") {
          this.isTraining = false
          this.isTrainingSuccess = false
          this.isConverting = false
          this.isConvertingSuccess = false
          this.isDownloading = false
          this.isDownloadingSuccess = false
          this.isUploading = false
          this.isColabConnected = false
          this.isColabConnecting = false
          this.event.close()
          this.event = null
          toast.success("ยกเลิกการเทรนแล้ว")
        }
      } catch (e) {
        console.log(e)
      } finally {
        console.log("==================TERMINATE DONE=================")
      }
    },
    async trainColab() {
      try {
        let workspaceStore = useWorkspaceStore()
        this.isTraining = true

        // upload project
        let uploaded = await this.uploadProject()
        if (!uploaded) {
          console.log("project upload failed")

          return false
        }

        // axios request /train
        let response = await axios.post(this.serverUrl + "/train", {
          project: workspaceStore.id,
          train_config: workspaceStore.trainConfig,
        })
        console.log(response.data)

      } catch (e) {
        console.log(e)
      } finally {
        console.log("==================TRAIN DONE=================")
      }
    },
    async convertModel() {
      try {
        let workspaceStore = useWorkspaceStore()
        this.isConverting = true
        this.isConvertingSuccess = false

        // axios request /convert
        let response = await axios.get(this.serverUrl + "/convert", {
          params: {
            project_id: workspaceStore.id,
          },
        })
        if (response.data.result == "OK") {
          this.isConvertingSuccess = true
          this.isConverting = false

          // One ModelFormat owns the knowledge of which files make up this
          // project's model, where to GET them, and how to hand them to
          // workspaceStore. Adding a new format = one new file in
          // src/engine/model-formats/, not an else-if here.
          const Format = pickFor({
            projectType: workspaceStore.projectType,
            boardId: workspaceStore.currentBoard.id,
            modelType: workspaceStore.trainConfig?.modelType,
          })

          this.isDownloading = true
          this.isDownloadingSuccess = false
          this.downloadingFiles = 0
          this.totalDownloadingFiles = Format.files.length
          const onProgress = e => {
            this.downloadProgress = Math.round((e.loaded / e.total) * 100)
          }
          const blobs = await Format.download(
            axios, this.serverUrl, workspaceStore.id, onProgress,
          )
          this.downloadingFiles = Format.files.length
          this.isDownloading = false
          this.isDownloadingSuccess = true

          await workspaceStore.importModelFromBlob(Format, blobs)
          toast.success("ดาวน์โหลดโมเดลสำเร็จ")
        } else {
          toast.error("แปลงโมเดลไม่สำเร็จ")
        }

      } catch (e) {
        console.log(e)
      } finally {
        console.log("==================CONVERT AND DOWNLOAD DONE=================")
      }
    },
    async downloadModel() {
      try {
        let workspaceStore = useWorkspaceStore()
        let response = await axios.get(this.serverUrl + "/download", {
          params: {
            project_id: workspaceStore.id,
          },
          responseType: 'json',
        })
        console.log(response.data)
      } catch (e) {
        console.log(e)
      }
    },
    async uploadProject() {
      // axios http post request to /upload with blob zip file
      try {
        let workspaceStore = useWorkspaceStore()
        let blob = await workspaceStore.saveProject('upload')
        blob.name = "project.zip"
        this.isUploading = true
        let formData = new FormData()

        // add zip file to formData
        formData.append("project", blob)
        formData.append("project_id", workspaceStore.id)

        let response = await axios.post(this.serverUrl + "/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            this.uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          },
        })
        console.log(response.data)
        if (response.data.result == "success") {
          console.log("project uploaded")

          return true
        } else {
          console.log("project upload failed")

          return false
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.isUploading = false
      }
    },
  },
})
