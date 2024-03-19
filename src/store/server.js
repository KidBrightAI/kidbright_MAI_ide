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
      /* 
      event: 
          "event": "train_start"

          "event": "epoch_start",             
          "epoch": epoch + 1, 
          "max_epoch": max_epoch
                    
          "event": "batch_start",           
          "batch": iter_i,
          "max_batch": epoch_size

          "event": "batch_end",           
          "batch": iter_i,
          "max_batch": epoch_size,
          "matrix": { "train_loss": total_loss.item() }
            
          "event": "epoch_end",           
          "matrix": {
              "train_loss": epoch_train_loss / epoch_size,
              "val_acc": evaluator.map or 0.0,
              "val_loss": evaluator.loss or 0.0,
              "val_precision": evaluator.precision or 0.0,
              "val_recall": evaluator.recall or 0.0,            
          }
        })
    
      q.announce({"time":time.time(), "event": "train_end", "msg" : "Training is done"})
      */

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
        this.messagesLog.push(`[${dt.toLocaleString()}]: ${data["msg"]}`);
        //TODO : >>>>>>>>>>>>>>>> goto next step ================================
      } else {
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
