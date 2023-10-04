<template>
  <b-modal
    title="สร้างโปรเจคใหม่"
    id="new-project-modal"
    @show="clearForm"
    @hidden="clearForm"
    @ok="handleCreateProject"
    :ok-disabled="!projectState"
  >
    <form @submit.stop.prevent="">
      <b-form-group label="Project type">
        <b-form-select
          id="project-type"
          v-model="selectType"
          :options="models"
          required
        ></b-form-select>
      </b-form-group>
      <div v-if="selectType in modelOptions">
        <b-form-group v-for="key in Object.keys(modelOptions[selectType])" :key="key"
          :label="modelOptions[selectType][key].title"
        >
          <b-form-input 
            :id="`${selectType}-${key}`" 
            :type="modelOptions[selectType][key].type" 
            v-model="modelOptions[selectType][key].value" 
            v-bind="modelOptions[selectType][key].attributes"
          ></b-form-input>
          <b-form-text v-if="modelOptions[selectType][key].description">
            {{modelOptions[selectType][key].description}}
          </b-form-text>
        </b-form-group>
      </div>
      <b-form-group
        :state="projectState"
        label="Name"
        label-for="name-input"
        invalid-feedback="ต้องเลือกชนิดโปรเจค, ต้องการชื่อโปรเจค"
      >
        <b-form-input
          id="name-input"
          v-model="projectName"
          :state="projectState"
          required
        ></b-form-input>
      </b-form-group>
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
      modelOptions : Object.fromEntries(this.$extensions.map(el=> el.options? [el.id,el.options] : null).filter(el=>el!=null)),
      selectType : 0,
      projectName : ""
    };
  },
  computed: {
    ...mapState('project', [
      'project',
      'listProjectModal',
      'isLoading',
      'isSaving',
    ]),
    projectState() {
      return this.projectName.length > 0 && this.selectType ? true : false
    }
  },
  methods : {
    ...mapActions("project",['createProject']),
    clearForm(){
      this.selectType = null;
      this.projectName = "";
    },
    async handleCreateProject(ev){
      ev.preventDefault();
      try{
        let selectedExtension = this.$extensions.find(el=>el.id == this.selectType);
        let project = {
          name: this.projectName,
          description: "",
          id: this.$helper.createUniqueName(this.projectName),
          projectType: this.selectType, //id of extension
          projectTypeTitle: selectedExtension.name, //this.models.find(el=>el.value == this.selectType).text,
          lastUpdate: new Date(),
          extension: selectedExtension, 
          model : null,
          dataset: [],
          labels: [],
        };
        let modelOptions = this.modelOptions[this.selectType];
        if(modelOptions){
          let options = {};
          Object.keys(modelOptions).forEach(key=>{
            if(modelOptions[key].type == "number"){
              modelOptions[key].value = Number(modelOptions[key].value);
            }
            options[key] = modelOptions[key].value;
          });
          project.options = options;
        }
        await this.createProject(project);
        this.$toast.success("สร้างโปรเจคเสร็จเรียบร้อย");
        this.$bvModal.hide("new-project-modal");
        this.$emit("success", project);
      }catch(e){
        console.error(e);
        this.$toast.error("มีอย่างไม่ถูกต้อง : " + e.message);
        this.$emit("error",e);
      }
    }
  }
}
</script>