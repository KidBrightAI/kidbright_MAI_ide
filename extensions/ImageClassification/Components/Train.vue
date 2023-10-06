<template>
  <div style="height: 100vh; width: 100vw">
    <b-input-group class="train-panel">
      <b-input-group-prepend>
        <b-button class="btn-create" variant="primary" @click="openColab"
          >Create</b-button
        >
      </b-input-group-prepend>
      <b-form-input
        :value="currentDevice == 'ROBOT' ? serverUrl : url"
        @change="connectServer"
        placeholder="Put Google Colab URL here . . ."
      ></b-form-input>
      <b-input-group-append>
        <b-button
          class="btn train-btn"
          :variant="isTraining ? 'danger' : 'primary'"
          :disabled="!isConnected || isTerminating"
          @click="handleTrain()"
        >
          <b-spinner v-if="isTerminating" small></b-spinner>
          <b-spinner v-else-if="isTraining" small type="grow"></b-spinner>
          {{ isTraining ? "Terminate" : "Train" }}
        </b-button>
        <b-button
          class="btn base-btn"
          v-b-modal.inference
          :disabled="!isTrained"
        >
          Test
        </b-button>
        <b-button
          :disabled="!isTrained || isConverting || isDownloading"
          class="btn base-btn"
          @click="downloadModel"
        >
          <b-spinner v-if="isConverting" small></b-spinner>
          <b-spinner v-else-if="isDownloading && currentDevice=='ROBOT'" small></b-spinner>
          <vm-progress v-else-if="isDownloading && currentDevice=='BROWSER'"
            type="circle"
            :percentage="downloadProgress"
            style="vertical-align: middle"
            strokeColor="blue"
            stroke-width="4"
            :width="24"
          >
          </vm-progress>
          {{progressText}}
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <multipane layout="horizontal" class="horizontal-panes multplane">
      <div
        class="test"
        :style="{ height: '70%', maxHeight: '90%', minHeight: '10%' }"
        @mousedown.stop
      >
        <MLModelDesigner></MLModelDesigner>
      </div>
      <multipane-resizer></multipane-resizer>
      <div :style="{ display: 'flex', flexGrow: 1, width: '100%' }">
        <server-report></server-report>
      </div>
    </multipane>
    <sync-project-modal></sync-project-modal>
    <inference-modal></inference-modal>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";

import MLModelDesigner from "~/components/MLModelDesign.vue";
import SyncProjectModal from "~/components/Modals/SyncProjectModal.vue";
import ServerReport from "~/components/ServerReport.vue";
import InferenceModal from "../Modals/InferenceModal.vue";
import axios from "axios";
import { Multipane, MultipaneResizer } from "vue-multipane";
export default {
  name: "Train",
  components: {
    Multipane,
    MultipaneResizer,
    SyncProjectModal,
    MLModelDesigner,
    ServerReport,
    InferenceModal,
  },
  props: {},
  data() {
    return {
      file: null,
      isDownloading: false,
      downloadProgress: 0,
      downloadMaxFile : 3,
      downloadIndex: 1
    };
  },
  methods: {
    ...mapMutations("server", ["setURL", "setTrained"]),
    ...mapMutations("project", [
      "savePretrained",
      "saveTfjs",
      "saveEdgeTPU",
      "saveModelLabel"
    ]),
    ...mapActions("server", ["connect", "convert_model"]),
    ...mapActions("dataset", ["addBlobToFs", "exists"]),
    ...mapActions(["saveProject"]),
    openColab: () => {
      window.open(
        "https://colab.research.google.com/drive/1a14kNdqn6K3EN3P7sSB9wHnjjuvMB6Lf?usp=sharing",
        "_blank"
      );
    },
    downloadFile: async function (url, outType="blob") {
      try {
        let tempFile = await axios.get(url, {
          responseType: outType,
          onDownloadProgress : (pg)=>{
            this.downloadProgress = Math.round((pg.loaded * 100) / pg.total);
          }
        });
        this.downloadProgress = 100;
        if (tempFile.status == 200) {
          return tempFile.data;
        }
      } catch (err) {
        console.log("Failed to download : ", url);
        console.log(err);
        throw "Fail to download : " + url;
      }
    },
    downloadAndSave: async function (url, filename) {
      let file = await this.downloadFile(url);
      if (file) {
        await this.addBlobToFs({
          data: file,
          filename: filename,
        });
      }
    },
    downloadTfjs: async function (projectId) {
      this.downloadIndex += 1;
      let tfjsModelBasePath = `${this.url}/projects/${projectId}/output/tfjs`;
      let modelJson = await axios.get(`${tfjsModelBasePath}/model.json`);
      if (
        modelJson.status == 200 &&
        modelJson.data.weightsManifest &&
        modelJson.data.weightsManifest.length == 1
      ) {
        this.downloadMaxFile += modelJson.data.weightsManifest[0].paths.length;
        for (let binFile of modelJson.data.weightsManifest[0].paths) {
          this.downloadIndex += 1;
          await this.downloadAndSave(
            `${tfjsModelBasePath}/${binFile}`,
            binFile
          );
        }
      }
      await this.downloadAndSave(
        `${tfjsModelBasePath}/model.json`,
        "model.json"
      );
      let modelEntry = await this.exists(`${projectId}/model.json`);
      if (modelEntry.isFile === true) {
        this.saveTfjs(this.getBaseURL + "/model.json");
      }
    },
    syncModelFile: async function(projectId){
      this.downloadIndex = 1;
      this.downloadMaxFile = 3;
      //============= download label =============//
      let labelsContent = await this.downloadFile(`${this.url}/projects/${projectId}/output/labels.txt`, "text");
      console.log("----- download labels------");
      console.log(labelsContent);
      let labels = labelsContent.replace(/\r/g,'').split("\n").map(str=>str.trim()).filter(Boolean);
      console.log(labels);
      this.saveModelLabel(labels);
      //============= download tfjs ==============//
      await this.downloadTfjs(projectId);
      //============= download edgetpu =============//
      this.downloadIndex += 1;
      await this.downloadAndSave(
        `${this.url}/projects/${projectId}/output/Classifier_edgetpu.tflite`,
        "model_edgetpu.tflite"
      );
      let modelEdgeEntry = await this.exists(
        `${projectId}/model_edgetpu.tflite`
      );
      if (modelEdgeEntry.isFile === true) {
        this.saveEdgeTPU(this.getBaseURL + "/model_edgetpu.tflite");
      }
      //============ download tflite =============//
    },
    downloadModel: async function () {
      let res = await this.convert_model();
      this.isDownloading = true;
      let projectId = this.$store.state.project.project.id;
      if (res && this.currentDevice == "BROWSER") {
        try {
          await this.syncModelFile(projectId);
          this.$toast.success(
            "Download success, all models saved to your project"
          );
        } catch (err) {
          console.log("download model failed : ", err);
          this.$toast.error(err.message);
        }
      } else if (
        res &&
        this.currentDevice == "ROBOT" &&
        !this.url.startsWith(this.serverUrl)
      ) {
        console.log("sync project to local file system");
        await this.syncModelFile(projectId);
        let serverDownloadModel = await axios.post(
          `${this.serverUrl}/download_server_project`,
          {
            project_id: projectId,
            url: this.url,
            model_file: "Classifier"
          }
        );
        if (serverDownloadModel && serverDownloadModel.data && serverDownloadModel.data.result === "OK") {
          this.$toast.success("ดาวน์โหลดข้อมูลสำเร็จ");
          await this.saveProject();
        }
      } else if (res && this.currentDevice == "ROBOT" && this.url.startsWith(this.serverUrl)) {
        console.log("convert local project");
        await this.syncModelFile(projectId);
        let localDownloadResp = await axios.post(`${this.serverUrl}/download_local_project`, { project_id: projectId });
        if (localDownloadResp && localDownloadResp.data && localDownloadResp.data.result === "OK") {
          this.$toast.success("ดาวน์โหลดข้อมูลสำเร็จ");
          await this.saveProject();
        }
      }
      this.isDownloading = false;
    },
    connectServer: function (url) {
      console.log("connect server");
      const regex = new RegExp(
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
      );
      if (url != "" || regex.test(url)) {
        console.log("set url to ", url);
        this.setURL(url);
        this.connect();
        this.setTrained(false);
      }
    },
    handleTrain: async function () {
      if (this.isTraining) {
        await this.$store.dispatch("server/terminate");
      } else {
        if(this.currentDevice == "ROBOT"){
          await this.$store.dispatch("saveProject");
        }
        await this.$store.dispatch("server/train");
      }
    },
    handleInference: function () {},
  },
  mounted() {
    if (this.currentDevice == "ROBOT") {
      this.connectServer(this.serverUrl);
    }
  },
  computed: {
    ...mapGetters("dataset", ["projectName", "getBaseURL", "getFileExt"]),
    ...mapState(["currentDevice", "serverUrl"]),
    ...mapState("server", [
      "url",
      "isConnected",
      "isTraining",
      "isTerminating",
      "isTrained",
      "isConverting",
      "isConverted",
    ]),
    progressText(){
      if(this.isConverting){
        return "Converting...";
      }
      if(this.isDownloading){
        if(this.currentDevice == "BROWSER"){
          return `Downloading (${this.downloadIndex}/${this.downloadMaxFile})`;
        }else{
          return `Downloading...`;
        }
      }
      return "Download";
    }
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
.horizontal-panes {
  width: 100%;
  height: calc(100vh - 80px);
  border: 1px solid #ccc;
  overflow: hidden;
}
.multipane.horizontal-panes.layout-h .multipane-resizer {
  margin: 0;
  top: 0; /* reset default styling */
  height: 5px;
  background: #aaa;
}
.train-panel {
  padding: 20px;
  background: #222;
  height: 78px;
  display: flex;
  justify-content: flex-end;
}
.train-btn {
  color: white;
  margin-left: 10px !important;
  border-radius: 15px !important;
  min-width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
.base-btn {
  color: white;
  background-color: $primary-color;
  margin-left: 10px !important;
  border-radius: 15px !important;
  min-width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
</style>
