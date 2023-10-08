import { defineStore } from "pinia";
import storage from "@/engine/storage";

export const useDatasetStore = defineStore({
  id: "dataset",
  state: () => {
    return {
      project: "", //project id
      datasetType: null, //id of extension
      data: [],
      baseURL: "",
      isLoading: false,
      isSaving: false,
    }
  },
  getters: {
    dataLength: (state) => {
      return state.data.length;
    },
    positionOf: (state) => (id) => {
      return state.data.findIndex(el => el.id == id);
    },
    getExt : (state) => (id) => {
      return state.data.find(el => el.id == id).ext;
    },
    getLabelByIds: (state) => (ids) => {
      if (!ids.length) {
        return [];
      }
      return state.data
        .filter((el) => ids.includes(el.id))
        .reduce(
          (prev, curr) =>
            curr.class == null || prev.includes(curr.class)
              ? prev
              : [...prev, curr.class],
          []
        );
    }
  },
  persist: {
    paths: ['project', 'datasetType', 'data', 'baseURL'],
  },
  actions: {
    async prepareDataset(projectId){
      let dirEntry = await storage.createDir(this.$fs, projectId || this.project);
      return dirEntry;
    },
    
    async createDataset(dataset) {
      let dirEntry = await this.prepareDataset(dataset.project);
      
      this.project = dataset.project;
      this.datasetType = dataset.datasetType;
      this.data = dataset.data || [];
      this.baseURL = dirEntry.toURL();
      
      console.log("create dataset for project : ", this.project);
      console.log("dataset base url : ", this.baseURL);
      console.log("dataset type : ", this.datasetType);
    },
    
    async restoreDataset(dataset) {
      console.log("Restore dataset ...");
      let dirEntry = await storage.getDirectory(this.$fs, dataset.project);
      this.project = dataset.project;
      this.datasetType = dataset.datasetType;
      this.data = dataset.data || [];
      this.baseURL = dirEntry.toURL();
      console.log("restore dataset for project : ", this.project);
      console.log("dataset base url : ", this.baseURL);
      console.log("dataset type : ", this.datasetType);
    },

    async clearDataset() {
      console.log("clear dataset : ", this.dataset.project);
      if (this.dataset.project) {
        console.log("remove folder");
        //removeFolder
        let res = await storage.removeFolder(this._vm.$fs, state.dataset.project);
        if (res) {
          console.log("remove folder success");
        }
      }
    },

    exist(filename) {
      return storage.exists(this.$fs, filename);
    },

    async addData(data){
      await storage.writeFile(this.$fs, `${this.project}/${data.id}.${data.ext}`, data.image);
      this.data.unshift(data);
    },

    async deleteDatasetItem({ id, ext }) {
      this.data = this.data.filter((el) => el.id !== id);
      await storage.removeFile(this.$fs,`${this.project}/${id}.${ext}`);
      return true;
    },

    async deleteDatasetItems(ids) {
      let selectedItems = this.data.filter((el) => ids.includes(el.id));
      this.data = this.data.filter(
        (el) => !ids.includes(el.id)
      );
      for (let item of selectedItems) {
        await storage.removeFile(this.$fs,`${this.project}/${item.id}.${item.ext}`);
      }
    }
  }
});
