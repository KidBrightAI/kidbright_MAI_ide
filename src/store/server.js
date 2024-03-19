import { defineStore } from "pinia";
// other store
import { useWorkspaceStore } from "./workspace";
//axios 
import axios from 'axios';


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
        // this.matric.push({
        //   label: data.epoch,
        //   matric: data.matric,
        //   prefix: "validate_",
        // });
      } else if (eventType == "batch_start") {
        this.batch = data.batch;
        this.totalBatch = data.max_batch;
        this.progress = (data.batch / data.max_batch) * 100;
      } else if (eventType == "batch_end") {
        this.progress = (data.batch / data.max_batch) * 100;        
      } else if (eventType == "train_end") {
        this.isTrainingSuccess = true;
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
        //TODO : >>>>>>>>>>>>>>>> goto next step ================================
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
        this.isTraining = false;
      }
    },
    async convertModel(){
      try{
        this.isConverting = true;
        // axios request /convert
        let response = await axios.post(this.serverUrl + "/convert", {
          project_id : workspaceStore.id,
        });

        // download model 
        let modelInt8Response = await axios.get(this.serverUrl + "/projects/" + workspaceStore.id + "/model_int8.bin", {
          responseType: 'blob',
        });

        let modelParamResponse = await axios.get(this.serverUrl + "/projects/" + workspaceStore.id + "/model_int8.param", {
          responseType: 'blob',
        });
        
        //await workspaceStore.importModelFromBlob(modelInt8Response.data, modelParamResponse.data);
        //let labels = workspaceStore.modelLabel;
        
        //await storage.writeFile(this.$fs, `${this.id}/model.bin`, new Blob([modelBinaries]));
        //await storage.writeFile(this.$fs, `${this.id}/model.param`, new Blob([modelParams]));
        // read labels.txt
        //check is labels.txt exist
        //workspaceStore.modelLabel = [];
      
        // let hash = await md5(new Uint8Array(modelInt8Response.data));
        // workspaceStore.model = {
        //   name: 'model',
        //   type: 'bin',
        //   hash: hash,
        // };
        console.log("==================DOWNLOAD SUCCESS=================");

      }catch(e){
        console.log(e);
      }finally{
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
