import JSZip from "jszip";
import { defineStore } from "pinia";
import { loadBoard, loadPlugin } from "../engine/board";
import { usePluginStore } from "./plugin";
import { useDatasetStore } from "./dataset";
import { sleep } from "@/engine/helper";
import storage from "@/engine/storage";
import { md5 } from 'hash-wasm';

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
      dataset:[],
      projectType: null, //id of extension
      projectTypeTitle: null, //this.models.find(el=>el.value == this.selectType).text,
      lastUpdate: null,
      extension: null,      
      labels: [],
      model : null,

      saving: false,
      opening: false,
      openingProgress: 0,
      savingProgress: 0,
    }
  },
  persist: {
    paths: ['mode', 'code', 'block', 'currentBoard', 'name', 'board', 'id', 'dataset', 'projectType', 'projectTypeTitle', 'lastUpdate', 'model', 'labels'],
  },
  actions: {
    downloadBlob(filename, data) {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      let url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    async saveProject() {
      this.saving = true;
      this.savingProgress = 0;
      console.log("saving project");
      let zip = new JSZip();
      zip.file("project.json", JSON.stringify(this.$state));
      //---------- save dataset raw ------------//
      const datasetStore = useDatasetStore();
      
      zip.file("dataset.json", JSON.stringify({
        project: datasetStore.project,
        datasetType: datasetStore.datasetType,
        data: datasetStore.data,
        baseURL: datasetStore.baseURL,
      }));

      let rawDataset = zip.folder("dataset");
      let datasets = datasetStore.data;
      for (let [i, data] of datasets.entries()) {
        let filename = data.id + "." + data.ext;
        console.log("saving file", filename);
        let fileData = datasetStore.getDataAsFile(filename);
        rawDataset.file(data.class + "/" + filename, fileData);
        
        if (this.projectType === "VOICE_CLASSIFICATION") {
          //   let wavFile = data.id + "." + data.sound_ext;
          //   let wavData = await dispatch("dataset/getDataAsFile", wavFile);
          //   rawDataset.file(wavFile, wavData);
          //   let mfccFile = data.id + "_mfcc.jpg";
          //   let mfccData = await dispatch("dataset/getDataAsFile", mfccFile);
          //   rawDataset.file(mfccFile, mfccData);
          // }
          //let progress = ((i + 1) / datasets.length) * 100;
          //commit("setSavingProgress", progress - 5);
        }
        //await sleep(1000);
        //saving progress map to 1-97
        this.savingProgress = 1 + Math.round(((i + 1) / datasets.length) * 97);
      }
      //saving model
      this.savingProgress = 98;
      if(this.model){
        let modelFolder = zip.folder("model");
        let modelBinaries = await storage.readAsFile(this.$fs, `${this.id}/model.bin`);
        let modelParams = await storage.readAsFile(this.$fs, `${this.id}/model.param`);
        modelFolder.file("model.bin", modelBinaries);
        modelFolder.file("model.param", modelParams);
      }
      this.savingProgress = 99;
      //---------- save output (model) ---------//
      const that = this;
      zip
        .generateAsync({
          type: "blob",
          compression: "STORE",
        })
        .then(function (content) {
          that.downloadBlob("project.zip", content);
        })
        .finally(() => {
          this.saving = false;
          this.savingProgress = 100;
        });
    },
    async createNewProject(projectInfo) {
      this.mode = projectInfo.mode || 'block';
      this.code = null;
      this.block = null;
      this.name = projectInfo.name;
      this.currentBoard = this.boards.find(board => board.id == projectInfo.board);
      this.id = projectInfo.id;
      this.dataset = projectInfo.dataset;
      this.labels = projectInfo.labels;
      this.projectType = projectInfo.projectType;
      this.projectTypeTitle = projectInfo.projectTypeTitle;
      this.lastUpdate = projectInfo.lastUpdate;
      this.extension = projectInfo.extension;
      this.model = projectInfo.model;
      //--------- create dataset for project --------//
      const datasetStore = useDatasetStore();
      let dataset = {
        project: this.id,
        datasetType: this.extension.id,
        data: [],
        baseURL: "",
      };
      await datasetStore.createDataset(dataset);
      //--------- load default code from board --------//
      if(projectInfo.block){
        this.block = projectInfo.block;        
      }
      if(projectInfo.code){
        this.code = projectInfo.code;
      }
      console.log("create project with code");
      //--------- load board'blocks --------//
      if(projectInfo.plugin){
        const pluginStore = usePluginStore();
        pluginStore.installed = projectInfo.plugin;
        await loadPlugin(projectInfo.plugin);
      }
      await loadBoard(this.currentBoard);      
      return true;
    },
    selectAndReadZipFile() {      
      return new Promise((resolve, reject) => {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip";
        input.addEventListener("change", function () {
          console.log("user loaded file");
          document.body.removeChild(input);
          let fr = new FileReader();
          fr.onload = async () => {
            resolve(fr.result);
          };
          fr.readAsArrayBuffer(this.files[0]);          
        });
        document.body.appendChild(input);
        setTimeout(() => {
          input.click();
          const onFocus = () => {
            window.removeEventListener("focus", onFocus);
            document.body.addEventListener("mousemove", onMouseMove);
          };
          const onMouseMove = () => {
            document.body.removeEventListener("mousemove", onMouseMove);
            if(!input.files.length) {
              document.body.removeChild(input);
              console.log("no file selected");
              reject("NOFILE");
            }
          }
          window.addEventListener("focus", onFocus);
        },0);
      });
    },
    // open select file dialog and read ziped file
    async openProjectFromZip() {
      try{
        let datasetStore = useDatasetStore();
        
        let data = await this.selectAndReadZipFile();
        
        this.opening = true;
        this.openingProgress = 0;

        let zip = new JSZip();
        await zip.loadAsync(data);
        let projectData = await zip.file("project.json").async("string");
        projectData = JSON.parse(projectData);

        // clear dataset
        await storage.removeFolder(this.$fs, projectData.id);
        
        // load dataset
        await datasetStore.prepareDataset(projectData.id);
        let datasetData = await zip.file("dataset.json").async("string");
        datasetData = JSON.parse(datasetData);
        

        for(let i = 0; i < datasetData.data.length; i++){
          let data = datasetData.data[i];
          let fileData = await zip.file("dataset/" + data.class + "/" + data.id + "." + data.ext).async("blob");
          await storage.writeFile(this.$fs, `${projectData.id}/${data.id}.${data.ext}`, fileData);
          //scale progress from 1 - 97
          this.openingProgress = 1 + Math.round(((i + 1) / datasetData.data.length) * 97);
          //await sleep(1000);
        }
        
        // load model
        if(projectData.model){
          let model = await zip.folder("model");
          let modelBinaries = await model.file("model.bin").async("blob");
          let modelParams = await model.file("model.param").async("blob");
          this.openingProgress = 98;
          await storage.writeFile(this.$fs, `${projectData.id}/model.bin`, modelBinaries);
          this.openingProgress = 99;
          await storage.writeFile(this.$fs, `${projectData.id}/model.param`, modelParams);
        }
        

        this.code = projectData.code;
        this.block = projectData.block;
        this.currentBoard = this.boards.find(board => board.id == projectData.currentBoard.id);
        this.name = projectData.name;
        this.id = projectData.id;
        this.dataset = projectData.dataset;
        this.projectType = projectData.projectType;
        this.projectTypeTitle = projectData.projectTypeTitle;
        this.lastUpdate = projectData.lastUpdate;
        this.extension = projectData.extension;
        this.model = projectData.model;
        this.labels = projectData.labels;
        

        datasetStore.project = datasetData.project;
        datasetStore.datasetType = datasetData.datasetType;
        datasetStore.data = datasetData.data;
        datasetStore.baseURL = datasetData.baseURL;


        this.openingProgress = 100;
        this.opening = false;
        return true;
      }catch(e){
        if(e == "NOFILE"){
          console.log('no file selected');
        }else{
          console.log(e);
          return false;
        } 
      }
    },

    async importModelFromZip(){
      try{
        let data = await this.selectAndReadZipFile();
        let zip = new JSZip();
        await zip.loadAsync(data);
        let modelBinaries = await zip.file("modelv831/opt_int8.bin").async("arraybuffer");
        let modelParams = await zip.file("modelv831/opt_int8.param").async("arraybuffer");
        await storage.writeFile(this.$fs, `${this.id}/model.bin`, new Blob([modelBinaries]));
        await storage.writeFile(this.$fs, `${this.id}/model.param`, new Blob([modelParams]));
        let hash = await md5(new Uint8Array(modelBinaries));
        this.model = {
          name: 'model',
          type: 'bin',
          hash: hash,
        };
        console.log("model data", this.model);
        return true;
      }catch(e){
        if(e == "NOFILE"){
          console.log('no file selected');
        }else{
          console.log(e);
          return false;
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
        this.mode = 'block';
        this.code = null;
        this.block = null;
      } else if (mode == 'code') {
        this.mode = 'code';
        this.code = null;
        this.block = null;
      }
    },
    addLabel(label){
      if (!this.labels.find((el) => el.label == label.label)) {
        this.labels.push(label);
      }
    },
    changeLabel({ oldLabel, newLabel }) {
      let ind = this.labels.findIndex((el) => el.label == oldLabel);
      this.labels[ind].label = newLabel;
    },
    removeLabel(label) {
      this.labels = this.labels.filter((el) => el.label != label);
    }
  }
});
