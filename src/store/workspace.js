import JSZip from "jszip";
import { defineStore } from "pinia";
import { loadBoard, loadPlugin } from "../engine/board";
import { usePluginStore } from "./plugin";
import { useDatasetStore } from "./dataset";
import { sleep, generatePascalVocFromDataset } from "@/engine/helper";
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
      zip.file("project.json", JSON.stringify({
        ...this.$state, 
        plugin : usePluginStore().installed
      }));
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

      if(this.projectType === "OBJECT_DETECTION"){        
        var annotations = rawDataset.folder("Annotations");
        var images = rawDataset.folder("JPEGImages");
        var imageSets = rawDataset.folder("ImageSets");
        
        let main = imageSets.folder("Main");        
        let allImageFile = datasets.map(data => data.id + "." + data.ext);
        //random shuffle
        let splitConstant = 0.8;
        let splitSite = Math.round(allImageFile.length * splitConstant);
        allImageFile.sort(() => Math.random() - 0.5);
        let trainFile = allImageFile.slice(0, splitSite);
        let validFile = allImageFile.slice(splitSite);
        main.file("train.txt", trainFile.join("\n"));
        main.file("valid.txt", validFile.join("\n"));
      }

      for (let [i, data] of datasets.entries()) {
        let filename = data.id + "." + data.ext;        
        let fileData = datasetStore.getDataAsFile(filename);
        if(this.projectType === "IMAGE_CLASSIFICATION"){
          rawDataset.file(data.class + "/" + filename, fileData);
        }
        if(this.projectType === "OBJECT_DETECTION"){
          //xml voc export
          let xml = generatePascalVocFromDataset(data);          
          annotations.file(data.id + ".xml", xml);          
          images.file(data.id + "." + data.ext, fileData);
          //create image set                    
        }
        if (this.projectType === "VOICE_CLASSIFICATION") {

        }
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
        try{
          await storage.removeFolder(this.$fs, projectData.id);
          console.log("folder removed : ", projectData.id);
        }catch(e){
          console.log(e);
        }
        try{
          await storage.removeFolder(this.$fs, this.id);
          console.log("folder removed : ", this.id);
        }catch(e){
          console.log(e);
        }
        
        // load dataset
        let entry = await datasetStore.prepareDataset(projectData.id);
        console.log("dataset entry : ", entry);
        let datasetData = await zip.file("dataset.json").async("string");
        datasetData = JSON.parse(datasetData);
        
        if(projectData.projectType === "OBJECT_DETECTION"){
          for(let i = 0; i < datasetData.data.length; i++){
            let data = datasetData.data[i];
            // read xml file in pascol voc format
            let xml = await zip.file("dataset/Annotations/" + data.id + ".xml").async("string");
            // convert xml to dataset
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(xml, "text/xml");
            let objects = xmlDoc.getElementsByTagName("object");
            let dataset = [];
            for(let j = 0; j < objects.length; j++){
              let object = objects[j];
              let bndbox = object.getElementsByTagName("bndbox")[0];
              let xmin = bndbox.getElementsByTagName("xmin")[0].innerHTML;
              let ymin = bndbox.getElementsByTagName("ymin")[0].innerHTML;
              let xmax = bndbox.getElementsByTagName("xmax")[0].innerHTML;
              let ymax = bndbox.getElementsByTagName("ymax")[0].innerHTML;
              dataset.push({
                id: data.id,
                class: object.getElementsByTagName("name")[0].innerHTML,
                xmin: xmin,
                ymin: ymin,
                xmax: xmax,
                ymax: ymax,
              });
            }
            datasetStore.data = datasetStore.data.concat(dataset);
            // read image file
            let fileData = await zip.file("dataset/JPEGImages/" + data.id + "." + data.ext).async("blob");
            await storage.writeFile(this.$fs, `${projectData.id}/${data.id}.${data.ext}`, fileData);
            //scale progress from 1 - 97
            this.openingProgress = 1 + Math.round(((i + 1) / datasetData.data.length) * 97);
            //await sleep(1000);
          }
        }else if(projectData.projectType === "IMAGE_CLASSIFICATION"){
          for(let i = 0; i < datasetData.data.length; i++){
            let data = datasetData.data[i];
            let fileData = await zip.file("dataset/" + data.class + "/" + data.id + "." + data.ext).async("blob");
            await storage.writeFile(this.$fs, `${projectData.id}/${data.id}.${data.ext}`, fileData);
            //scale progress from 1 - 97
            this.openingProgress = 1 + Math.round(((i + 1) / datasetData.data.length) * 97);
            //await sleep(1000);
          }
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
        datasetStore.baseURL = entry.toURL();

        if(projectData.plugin){
          const pluginStore = usePluginStore();
          pluginStore.installed = projectData.plugin;
          await loadPlugin(projectData.plugin);
        }
        await loadBoard(this.currentBoard);

        this.openingProgress = 100;        
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        return true;        
      }catch(e){
        if(e == "NOFILE"){
          console.log('no file selected');
        }else{
          console.log(e);
          return false;
        } 
      } finally {
        this.opening = false;
      }
    },

    async importModelFromZip(){
      try{
        let data = await this.selectAndReadZipFile();
        let zip = new JSZip();
        await zip.loadAsync(data);
        let modelBinaries = await zip.file("classifier.bin").async("arraybuffer");
        let modelParams = await zip.file("classifier.param").async("arraybuffer");
        //remove old model
        try{
          await storage.removeFile(this.$fs, `${this.id}/model.bin`);          
        }catch(e){
          console.log(e);
        }
        try{
          await storage.removeFile(this.$fs, `${this.id}/model.param`);          
        }catch(e){
          console.log(e);
        }
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
    async importObjectDetectionModelFromZip(){
      try{
        let data = await this.selectAndReadZipFile();
        let zip = new JSZip();
        await zip.loadAsync(data);
        let modelBinaries = await zip.file("classifier_awnn.bin").async("arraybuffer");
        let modelParams = await zip.file("classifier_awnn.param").async("arraybuffer");
        //remove old model
        try{
          await storage.removeFile(this.$fs, `${this.id}/model.bin`);          
        }catch(e){
          console.log(e);
        }
        try{
          await storage.removeFile(this.$fs, `${this.id}/model.param`);          
        }catch(e){
          console.log(e);
        }

        await storage.writeFile(this.$fs, `${this.id}/model.bin`, new Blob([modelBinaries]));
        await storage.writeFile(this.$fs, `${this.id}/model.param`, new Blob([modelParams]));
        let hash = await md5(new Uint8Array(modelBinaries));
        let paramHash = await md5(new Uint8Array(modelParams));
        console.log("params hash : ", paramHash);
        console.log("model hash : ", hash);
        // check again
        let modelBinariesFile = await storage.readAsFile(this.$fs, `${this.id}/model.bin`);
        let modelParamsFile = await storage.readAsFile(this.$fs, `${this.id}/model.param`);
        let paramHashFile = await md5(new Uint8Array(await modelParamsFile.arrayBuffer()));
        let modelHashFile = await md5(new Uint8Array(await modelBinariesFile.arrayBuffer()));
        console.log("storeage param hash : ", paramHashFile);
        console.log("storage model hash : ", modelHashFile);

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
