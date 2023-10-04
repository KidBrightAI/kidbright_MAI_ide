<template>
  <b-modal
    id="open-project-modal"
    title="เปิดโปรเจค"
    @show="fetchProject"
    @hidden="clearForm"
    @ok="openProjectHandle"
    :ok-disabled="!projectState"
  >
    <div v-if="currentDevice == 'ROBOT'">
      <form @submit.stop.prevent="">
        <b-form-group label="Project type">
          <b-form-select
            id="project-type"
            v-model="selectType"
            :options="models"
            required
          ></b-form-select>
        </b-form-group>
      </form>
      <p class="p-notice-color small">* เลือกโปรเจคที่ต้องการเปิด</p>
      <b-form-select
        v-if="projectByType"
        id="project-id"
        v-model="projectToOpen"
        :options="projectByType"
        required
      ></b-form-select>
    </div>
    <div v-else-if="currentDevice == 'BROWSER' && step == 1">
      <b-row class="mb-4">
        <b-col>
          <b-form-file
            v-model="files"
            placeholder="เลือกโฟลเดอร์ของโปรเจค"
            drop-placeholder="ลากโฟลเดอร์ของโปรเจคมาวางที่นี่..."
            multiple
            directory
          >
          </b-form-file>
        </b-col>
      </b-row>
      <p class="p-notice-color small">* เลือกโฟลเดอร์ของโปรเจคที่ต้องการเปิด</p>

    </div>
    <div v-if="step >= 2" class="text-center">
      <vm-progress
        type="circle"
        :percentage="percentage"
        style="vertical-align: middle"
        strokeColor="#007E4E"
        stroke-width="24"
        :width="200"
      >
        <h4
          v-if="step == 2 && currentDevice == 'BROWSER'"
          class="my-3"
          text-black
        >
          กำลังนำเข้า ... {{ progress }}/{{ files.length || "" }}
        </h4>
        <h4
          v-if="step == 2 && currentDevice == 'ROBOT'"
          class="my-3"
          text-black
        >
          กำลังนำเข้า ... {{ progress }}/{{ serverFileLength }}
        </h4>
        <h4 v-else-if="step == 3" class="my-3" text-black>นำเข้าสำเร็จ</h4>
        <!-- <h4 class="my-3" text-black>กำลังบันทึก ... {{progress.toFixed(2)}}%</h4> -->
      </vm-progress>
    </div>
  </b-modal>
</template>
<script>
import axios from "axios";
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  data() {
    return {
      models: [
        { text: "เลือกประเภทการเรียนรู้ (Select training type)", value: null },
        ...this.$extensions.map((el) => ({ text: el.title, value: el.id })),
      ],
      selectType: null,
      projectList: [],
      projectToOpen: null,
      files: null,
      step: 1, //1= select folder , 2 = importing, 3 = import success
      progress: 0,
      percentage: 0,
      serverFileLength: 0,
    };
  },
  created() {},
  computed: {
    ...mapState(["currentDevice", "isSaving", "isOpening", "serverUrl"]),
    projectState() {
      if (this.currentDevice == "BROWSER") {
        return (
          (this.step >= 3 || this.step == 1) &&
          this.files &&
          this.files.length > 0
        );
      } else if (this.currentDevice == "ROBOT") {
        return (this.step >= 3 || this.step == 1) && this.projectToOpen;
      }
    },
    projectByType() {
      let filtered = this.projectList.filter(
        (el) => el.projectType == this.selectType
      );
      if (filtered.length > 0) {
        return filtered.map((el) => ({ text: el.name, value: el.id }));
      } else {
        this.projectToOpen = null;
        return null;
      }
    },
  },
  methods: {
    ...mapMutations("project", ["setProject"]),
    ...mapActions("dataset", ["addFileToFs", "clearDataset", "restoreDataset"]),
    ...mapActions("project", ["fetchProjects"]),
    clearForm() {
      this.selectType = null;
      this.projectToOpen = null;
      this.projectList = [];

      this.files = [];
      this.serverFileLength = 0;
      this.step = 1;
      this.progress = 0;
    },
    async fetchProject() {
      if (this.currentDevice == "ROBOT") {
        this.projectList = await this.fetchProjects();
      }
    },
    async getServerFile(filename) {
      let fileContent = await axios.get(
        `${this.serverUrl}/projects/${this.projectToOpen}/raw_dataset/${filename}`,
        { responseType: "blob" }
      );
      return new File([fileContent.data], filename);
    },
    async getServerProjectFile(filename, responseType = "blob") {
      let fileContent = await axios.get(
        `${this.serverUrl}/projects/${this.projectToOpen}/${filename}`,
        { responseType: responseType }
      );
      if (responseType == "blob") {
        return new File([fileContent.data], filename);
      }
      return fileContent.data;
    },
    async openProjectHandle(e) {
      if (this.currentDevice == "BROWSER") {
        if (this.step == 1) {
          //selecting file
          e.preventDefault();
          this.step = 2;
          this.progress = 0;
          let projectFile = this.files.find((el) => el.name == "project.json");
          if (!projectFile) {
            this.step = 1;
            this.$toast.error("Folder ที่เลือกไม่พบโปรเจคไฟล์");
            return false;
          }
          // parse project file
          let files = this.files.filter((el) => el.name != projectFile.name);
          let projectJsonText = await this.$helper.readFile(projectFile);
          let projectJson = JSON.parse(projectJsonText);
          let projectId = projectJson.project.project.id;
          await this.clearDataset(); //clear old dataset file
          console.log("cleared");
          for (let file of files) {
            this.progress += 1;
            this.percentage =
              Math.round((this.progress / files.length) * 100) - 5;
            await this.addFileToFs({ projectId: projectId, file: file });
          }
          //----------- tfjs ----------//
          let tfjsModelFile = this.files.find((el) => el.name == "model.json");
          if (tfjsModelFile) {
            await this.addFileToFs({
              projectId: projectId,
              file: tfjsModelFile,
            });
            for (let binFile of this.files.filter((el) =>
              el.name.endsWith(".bin")
            )) {
              await this.addFileToFs({ projectId: projectId, file: binFile });
            }
          } else {
            projectJson.project.project.tfjs = "";
          }
          this.percentage = 96.0;
          //----------- model edgetpu -------// ? TODO: จำเป็นไหม
          let modelEdgeTpu = this.files.find(
            (el) => el.name == "model_edgetpu.tflite"
          );
          if (modelEdgeTpu) {
            await this.addFileToFs({
              projectId: projectId,
              file: modelEdgeTpu,
            });
          } else {
            projectJson.project.project.edgetpu = "";
          }
          this.percentage = 98.0;
          //----------- labels --------//
          let labels = this.files.find((el) => el.name == "labels.txt");
          if (labels) {
            await this.addFileToFs({
              projectId: projectId,
              file: modelEdgeTpu,
            });
          } else {
            projectJson.project.project.labelFile = "";
          }
          this.percentage = 99.0;

          //--------- restore data ---------//
          this.restoreDataset(projectJson.dataset.dataset);
          this.setProject(projectJson.project.project); //assign new dataset

          this.step = 3;
          this.$toast.success("เปิดโปรเจคและนำเข้าเสร็จเรียบร้อย");
        } else if (this.step == 3) {
          //import success
        }
      } else if (this.currentDevice == "ROBOT") {
        if (this.step == 1) {
          //selecting file
          e.preventDefault();
          this.step = 2;
          this.progress = 0;
          let projectFile = await axios.get(
            `${this.serverUrl}/projects/${this.projectToOpen}/project.json`
          );
          if (projectFile && projectFile.status != 200) {
            this.step = 1;
            this.$toast.error("ไม่พบโปรเจคไฟล์");
            return false;
          }
          // parse project file
          let projectJson = projectFile.data;
          let projectId = projectJson.project.project.id;
          await this.clearDataset(); //clear old dataset file
          console.log("cleared");
          let files = projectJson.dataset.dataset.data; //  this.files.filter(el=>el.name != projectFile.name);
          this.serverFileLength = files.length;
          for (let data of files) {
            this.progress += 1;
            this.percentage = Math.round((this.progress / files.length) * 100);
            if (
              projectJson.project.project.projectType == "VOICE_CLASSIFICATION"
            ) {
              let file = await this.getServerFile(`${data.id}.${data.ext}`);
              await this.addFileToFs({ projectId: projectId, file: file });
              let fileMfcc = await this.getServerFile(`${data.id}_mfcc.jpg`);
              await this.addFileToFs({ projectId: projectId, file: fileMfcc });
              let fileSound = await this.getServerFile(
                `${data.id}.${data.sound_ext}`
              );
              await this.addFileToFs({ projectId: projectId, file: fileSound });
            } else {
              let file = await this.getServerFile(`${data.id}.${data.ext}`);
              await this.addFileToFs({ projectId: projectId, file: file });
            }
          }
          try{
            let file = await this.getServerProjectFile(`labels.txt`);
            await this.addFileToFs({ projectId: projectId, file: file });
          }catch{}
          try{
            let file = await this.getServerProjectFile(`model_edgetpu.tflite`);
            await this.addFileToFs({ projectId: projectId, file: file });
          } catch { }
          try{
            let file = await this.getServerProjectFile(`model.json`);
            await this.addFileToFs({ projectId: projectId, file: file });
          } catch { }
          try{
            let modelJson = await this.getServerProjectFile(`model.json`, "text");
            for (let binFile of modelJson.weightsManifest[0].paths) {
              let file = await this.getServerProjectFile(binFile);
              await this.addFileToFs({ projectId: projectId, file: file });
            }
          } catch { }
          this.restoreDataset(projectJson.dataset.dataset);
          this.setProject(projectJson.project.project); //assign new dataset
          this.step = 3;
          this.$toast.success("เปิดโปรเจคและนำเข้าเสร็จเรียบร้อย");
        } else if (this.step == 3) {
          //import success
        }
      }
    },
    async delay(time) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    },
  },
};
</script>

