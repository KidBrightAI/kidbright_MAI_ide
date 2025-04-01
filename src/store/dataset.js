import { defineStore } from "pinia";
import storage from "@/engine/storage";
import { useWorkspaceStore } from "./workspace";

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
    },
    getLabeledLength: (state) => {
      return state.data.filter(
        (el) => el.class != null || el.annotate.length
      ).length;
    },
    getAnnotateById: (state) => (id) => {
      let found = state.data.find((el) => el.id == id);
      return found ? found.annotate : null;
    },
    getAnnotateByIds: (state) => (ids) => {
      if (!ids.length) {
        return [];
      }
      return state.data
        .filter((el) => ids.includes(el.id))
        .reduce((prev, curr) => prev.concat(curr.annotate), []);
    }
  },
  persist: {
    paths: ['project', 'datasetType', 'data', 'baseURL'],
  },
  actions: {
    addOrUpdateAnnotation({ id, annotation }) {
      let ind = this.data.findIndex((el) => el.id == id);
      if (ind >= 0) {
        let found = this.data[ind].annotate.findIndex(
          (el) => el.id == annotation.id
        );
        if (found >= 0) {
          let newOne = JSON.parse(
            JSON.stringify(this.data[ind].annotate)
          );
          newOne[found] = annotation;
          this.data[ind].annotate = newOne; //make it reactive
        } else {
          this.data[ind].annotate.push(annotation);
        }
      }
    },

    removeAnnotation({ id, annotationId }) {
      let ind = this.data.findIndex((el) => el.id == id);
      if (ind >= 0) {
        let found = this.data[ind].annotate.findIndex(
          (el) => el.id == annotationId
        );
        if (found >= 0) {
          this.data[ind].annotate.splice(found, 1);
        }
      }
    },

    changeDataAnnotation ({oldLabel, newLabel}) {
      this.data = this.data.map((el) => ({
        ...el,
        annotate : el.annotate.map((anno) => {
          if (anno.label == oldLabel) {
            anno.label = newLabel;
          }
          return anno;
        }),
      }));
    },

    removeAllDataAnnotationByLabel(label){
      this.data = this.data.map((el) => ({
        ...el,
        annotate : el.annotate.filter((anno) => anno.label != label),
      }));
    },
    
    removeDataAnnotationWhere({ids, annotationId}) {
      let selectedItems = this.data.filter((el) => ids.includes(el.id));
      for (let item of selectedItems) {
        item.annotate = item.annotate.filter((el) =>
          el.id != annotationId
        );
      }
    },

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
    async clearDataset() {
      this.data = [];
      this.project = "";
      this.datasetType = null;
      this.baseURL = "";
      //let dirEntry = await storage.getDirectory(this.$fs, this.project);
      //await storage.removeDir(this.$fs, dirEntry);
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

    exist(filename) {
      return storage.exists(this.$fs, filename);
    },

    async addData(data){
      console.log(data);
      await storage.writeFile(this.$fs, `${this.project}/${data.id}.${data.ext}`, data.image);
      if(data.sound && data.sound_ext){
        await storage.writeFile(this.$fs, `${this.project}/${data.id}.${data.sound_ext}`, data.sound);
      }
      if(data.mfcc && data.mfcc_ext){
        await storage.writeFile(this.$fs, `${this.project}/${data.id}_mfcc.${data.mfcc_ext}`, data.mfcc);
      }
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
    },

    async addDataToFs(data) {
      await storage.writeFile(this.$fs, `${this.project}/${data.id}.${data.ext}`, data.image);
    },

    async getData(filename) {
      return await storage.readFile(
        this.$fs,
        `${this.project}/${filename}`
      );
    },
    async getDataAsFile(filename) {
      return await storage.readAsFile(
        this.$fs,
        `${this.project}/${filename}`
      );
    },

    addDatasetItems(items) {
      this.data = [...this.data, ...items];
    },

    addDatasetItem(item) {
      this.data.push(item);
    },

    setClass({ ids, label }) {
      // assign label to selected items
      this.data = this.data.map((el) => {
        if (ids.includes(el.id)) {
          el.class = label;
        }
        return el;
      });
    },

    changeClassData({ oldLabel, newLabel }) {
      // change label of selected items
      this.data = this.data.map((el) => {
        if (el.class == oldLabel) {
          el.class = newLabel;
        }
        return el;
      });
    },
    
    changeClassDataWhere({ids, oldLabel, newLabel}) {
      // change label of selected items
      this.data = this.data.map((el) => {
        if (ids.includes(el.id) && el.class == oldLabel) {
          el.class = newLabel;
        }
        return el;
      });
    }
  }
});
