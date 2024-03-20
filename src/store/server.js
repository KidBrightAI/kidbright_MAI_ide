import { defineStore } from "pinia";
// other store
import { useWorkspaceStore } from "./workspace";
//axios 
import axios from 'axios';
import { toast } from "vue3-toastify";
import { md5 } from 'hash-wasm';

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
      downloadProgress : 0,
      downloadingFiles : 0,
      totalDownloadingFiles : 2,
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
      "serverUrl",
    ],
  },
  actions: {
    clear(){
      this.serverUrl = null;
    },
    async connectColab(){
      console.log("connecting to colab");
      //axios request /ping and server return json success with message "pong"
      this.isColabConnecting = true;
      try{    
        let response = await axios.get(this.serverUrl + "/ping");      
        if(response.data.result == "pong"){
          // Server stage
          let stage = response.data.stage;
          //STAGE = 0 #0 none, 1 = prepare dataset, 2 = training, 3 = trained, 4 = converting, 5 converted
          if(stage == 0){
            //this.step = 0;
          }else if(stage == 1){
            //this.step = 1;
          }else if(stage == 2){
            this.isTraining = true;
            this.isTrainingSuccess = false;
            this.isConverting = false;
            this.isConvertingSuccess = false;
          }else if(stage == 3){
            this.isTraining = false;
            this.isTrainingSuccess = true;
            this.isConverting = false;
            this.isConvertingSuccess = false;
          }else if(stage == 4){
            this.isTraining = false;
            this.isTrainingSuccess = true;
            this.isConverting = true;
            this.isConvertingSuccess = false;
          }else if(stage == 5){
            this.isTraining = false;
            this.isTrainingSuccess = true;
            this.isConverting = false;
            this.isConvertingSuccess = true;
          }
          //check if event is not null, close it
          if(this.event != null){
            this.event.close();
          }
          //create listener for event using eventsource
          this.event = new EventSource(this.serverUrl + "/listen");
          //this.event.addEventListener('message', this.onmessage);
          this.event.onmessage = this.onmessage;          
          console.log("connected to colab");
          this.isColabConnected = true;          
          return true;
        }
        this.isColabConnected = false;
        return false;
      }catch(e){
        console.log(e);
        this.isColabConnected = false;
        return false;
      }finally{
        this.isColabConnecting = false;
      }
    },

    onmessage(event){      
      let data = JSON.parse(event.data);
      let dt = new Date(data.time * 1000);
      let eventType = data.event;
      if (eventType == "train_start") {
        // clear log
        this.messagesLog = [];
        this.matric = [];
      } else
      if (eventType == "epoch_start") {
        this.messagesLog.push(`[${dt.toLocaleString()}]: training epoch ${data.epoch}`);
        this.epoch = data.epoch;
        this.totalEpoch = data.max_epoch;
      } else if (eventType == "epoch_end") {
        this.messagesLog.push(`[${dt.toLocaleString()}]: epoch [${data.epoch}] ended`);
        //add server matric and notify change        
        this.matric = [... this.matric, {
          epoch: data.epoch,
          max_epoch: data.max_epoch,
          label: data.epoch,
          matric: data.matric,
          prefix: "train_",
        }];
      } else if (eventType == "batch_start") {
        this.batch = data.batch;
        this.totalBatch = data.max_batch;
        this.progress = (data.batch / data.max_batch) * 100;
      } else if (eventType == "batch_end") {
        this.progress = (data.batch / data.max_batch) * 100;        
      } else if (eventType == "train_end") {
        this.isTrainingSuccess = true;
        this.isTraining = false;
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
        toast.success("Training end");
      }
      //convert model  
      else if(eventType == "convert_model_init"){
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
      }else if(eventType == "convert_model_progress"){
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
      }else if(eventType == "convert_model_end"){
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
        // download model
      }else {
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
      }
    },
    async terminateColab(){
      try{
        let workspaceStore = useWorkspaceStore();
        // axios request /terminate
        let response = await axios.get(this.serverUrl + "/terminate", {
          params: {
            project_id: workspaceStore.id,
          }
        });
        console.log(response.data);
        if(response.data.result == "OK"){
          this.isTraining = false;
          this.isTrainingSuccess = false;
          this.isConverting = false;
          this.isConvertingSuccess = false;
          this.isDownloading = false;
          this.isDownloadingSuccess = false;
          this.isUploading = false;
          this.isColabConnected = false;
          this.isColabConnecting = false;
          this.event.close();
          this.event = null;
          toast.success("Colab terminated");
        }
      }catch(e){
        console.log(e);
      }finally{
        console.log("==================TERMINATE DONE=================");
      }
    },
    async trainColab(){
      try{        
        let workspaceStore = useWorkspaceStore();
        this.isTraining = true;
        // upload project
        let uploaded = await this.uploadProject();
        if(!uploaded){
          console.log("project upload failed");
          return false;
        }        
        // axios request /train
        let response = await axios.post(this.serverUrl + "/train", {
          project : workspaceStore.id,
          train_config : workspaceStore.trainConfig,
        });
        console.log(response.data);

      }catch(e){
        console.log(e);
      }finally{
        console.log("==================TRAIN DONE=================");
      }
    },
    async convertModel(){
      try{
        let workspaceStore = useWorkspaceStore();
        this.isConverting = true;
        this.isConvertingSuccess = false;
        // axios request /convert
        let response = await axios.get(this.serverUrl + "/convert", {
          params: {
            project_id: workspaceStore.id,
          },
        });
        if(response.data.result == "OK"){
          this.isConvertingSuccess = true;
          this.isConverting = false;
          // download model 
          this.isDownloading = true;
          this.isDownloadingSuccess = false;
          this.downloadingFiles = 1;
          let modelInt8Response = await axios.get(this.serverUrl + "/projects/" + workspaceStore.id + "/output/model_int8.bin", 
          //download progress
          {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
              this.downloadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            }
          });
          this.downloadingFiles = 2;
          let modelParamResponse = await axios.get(this.serverUrl + "/projects/" + workspaceStore.id + "/output/model_int8.param", {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
              this.downloadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            }
          });
          this.isDownloading = false;
          this.isDownloadingSuccess = true;
          this.downloadingFiles = 0;
          //import model
          let modelLabel = workspaceStore.labels.map(lb => lb.label);
          await workspaceStore.importModelFromBlob(modelInt8Response.data, modelParamResponse.data);
          //read model to calculate hash
          workspaceStore.modelLabel = modelLabel;
          toast.success("Model Downloaded");
        }else{
          console.log("model convert failed");
          toast.error("Model Convert Failed");
        }

      }catch(e){
        console.log(e);
      }finally{
        console.log("==================CONVERT AND DOWNLOAD DONE=================");
      }
    },
    async downloadModel(){
      try{
        let workspaceStore = useWorkspaceStore();
        let response = await axios.get(this.serverUrl + "/download", {
          params: {
            project_id: workspaceStore.id,
          },
          responseType: 'json',
        });
        console.log(response.data);
      }catch(e){
        console.log(e);
      }
    },
    async uploadProject(){
      // axios http post request to /upload with blob zip file
      try{
        let workspaceStore = useWorkspaceStore();
        let blob = await workspaceStore.saveProject('upload');
        blob.name = "project.zip";
        this.isUploading = true;    
        let formData = new FormData();
        // add zip file to formData
        formData.append("project", blob);              
        formData.append("project_id", workspaceStore.id);

        let response = await axios.post(this.serverUrl + "/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          }
        });
        console.log(response.data);
        if(response.data.result == "success"){
          console.log("project uploaded");
          return true;
        }else{
          console.log("project upload failed");
          return false;
        }        
      }catch(e){
        console.log(e);
      }finally{
        this.isUploading = false;
      }
    },
  }
});
