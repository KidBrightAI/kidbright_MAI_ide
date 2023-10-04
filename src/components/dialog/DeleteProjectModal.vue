<template>
  <b-modal
      id="delete-project-modal"
      title="ลบโปรเจค"
      @show="clearForm"
      @hidden="clearForm"
      @ok="deleteProject"
      :ok-disabled="!projectState"
  >
    <p v-if="currentDevice=='BROWSER'" class="p-notice-color">ข้อมูลโปรเจคนี้ทั้งหมดจะหายไป! ต้องการที่จะลบโปรเจคหรือไม่ ?</p>
    <form v-else @submit.stop.prevent="">
      <b-form-group label="Project type">
        <b-form-select
          id="project-type"
          v-model="selectType"
          :options="models"
          required
        ></b-form-select>
      </b-form-group>
      <p class="p-notice-color small">* เลือกโปรเจคที่ต้องการลบ</p>
    </form>
  </b-modal>
</template>

<script>
import { mapState, mapActions, mapMutations  } from 'vuex';
export default {
  data(){
    return {
      models: [
        { text: 'เลือกประเภทการเรียนรู้ (Select training type)', value: null },
        ...this.$extensions.map((el) => ({text : el.title, value : el.id}))
      ],
      selectType : null,
      projectList : [],
      projectToDelete : null,
    };
  },
  created(){
  },
  computed: {
    ...mapState('project', [
      'project',
      'listProjectModal',
      'isLoading',
      'isSaving',
    ]),
    ...mapState(['currentDevice']),
    projectState() {
      if(this.currentDevice == "BROWSER"){
        return this.project.id ? true : false;
      }else{
        return this.projectToDelete ? true : false;
      }
    }
  },
  methods : {
    ...mapMutations("project", ["setProject"]),
    ...mapMutations("dataset",["setDataset"]),
    ...mapActions("dataset", ["clearDataset"]),
    clearForm(){
      this.selectType = null;
      this.projectToDelete = null;
      this.projectList = [];
    },
    async deleteProject(){
      if(this.currentDevice == "BROWSER"){
        this.setDataset({
          project: "",
          datasetType: null,
          data: [],
          baseURL: ""
        });
        await this.clearDataset();
        this.setProject({
          name: "",
          description: "",
          id: null,
          projectType: null,
          lastUpdate: null,
          dataset: [],
          model: null,
          labelFile: "",
          modelLabel: [],
          labels: "",
          pretrained: "",
          tfjs: "",
          edgetpu: "",
          options: {},
          code: "",
          workspace: "",
          anchors: [],
        });
      }
    },
    fetchProject(){

    }
  }
}
</script>