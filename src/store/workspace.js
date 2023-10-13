import JSZip from "jszip";
import { defineStore } from "pinia";
import { loadBoard, loadPlugin } from "../engine/board";
import { usePluginStore } from "./plugin";
import { useDatasetStore } from "./dataset";

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
      model : null,
      labels: [],

      saving: false,
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

    // open select file dialog and read ziped file
    openProjectFromZip() {
      return new Promise((resolve, reject) => {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".ezk";     
        let that = this;
        input.addEventListener("change", function () {
          // console.log(this.files);
          let fr = new FileReader();
          fr.onload = async () => {
            let zip = new JSZip();
            await zip.loadAsync(fr.result);
            let data = await zip.file("project.json").async("string");                        
            let workspace = await zip.file("workspace.json").async("string");
            let projectData = JSON.parse(data);
            projectData.block = workspace;
            await that.createNewProject(projectData);          
            resolve(true);
          };
          fr.readAsArrayBuffer(this.files[0]);
        }, false);
        input.click();
      });      
    },
    
    saveAs(content, filename) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    },
    
    async saveProjectToZip(workspace) {
      const pluginStore = usePluginStore();
      let zip = new JSZip();
      zip.file("project.json", JSON.stringify({
        mode: this.mode,
        board: this.currentBoard.id,
        code: this.code,
        name: this.name,
        plugin: pluginStore.installed
      }));
      zip.file("workspace.json", workspace);
      let content = await zip.generateAsync({ type: "blob" });      
      this.saveAs(content, (this.name || 'EasyKidProject') + ".ezk");
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
