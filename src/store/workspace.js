import JSZip from "jszip";
import { defineStore } from "pinia";
import { loadBoard, loadPlugin } from "../engine/board";
import { usePluginStore } from "./plugin";

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
    }
  },
  persist: {
    paths: ['mode', 'code', 'block', 'currentBoard', 'name'],
  },
  actions: {
    async createNewProject(projectInfo) {
      
      this.mode = projectInfo.mode || 'block';
      this.code = null;
      this.block = null;
      this.name = projectInfo.name;
      this.currentBoard = this.boards.find(board => board.id == projectInfo.board);

      //--------- load default code from board --------//
      if(projectInfo.block){
        this.block = projectInfo.block;        
      }else if(this.currentBoard.defaultBlock){
        this.block = this.currentBoard.defaultBlock;
      }
      if(projectInfo.code){
        this.code = projectInfo.code;
      }
      console.log("create project with code");
      console.log(this.code);
      console.log(this.block);
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
