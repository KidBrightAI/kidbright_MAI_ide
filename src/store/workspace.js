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
    }
  },
  persist: {
    paths: ['mode', 'code', 'block', 'currentBoard', 'name', 'board', 'id', 'dataset', 'projectType', 'projectTypeTitle', 'lastUpdate', 'model', 'labels'],
  },
  actions: {
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
  }
});
