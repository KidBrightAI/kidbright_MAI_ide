<template>
  <b-modal 
    id="import-classify-image" 
    title="นำเข้าไฟล์รูปภาพ" 
    @ok="importImages"
    @show="cancelImport"
    @hidden="cancelImport"
    header-bg-variant="success" 
    header-text-variant="light" 
    size="md"
    :ok-disabled="step==2"
    :cancel-disabled="step==2"
    no-close-on-backdrop
    no-close-on-esc
  >
    <b-container fluid v-if="step <= 1">
      <b-row class="mb-4">
        <b-col>
          <img src="~/assets/images/UI/png/khanomchan-import.png" class="center-img" height="200"/>
        </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col>
          <b-form-file
            v-model="files"
            placeholder="เลือกโฟลเดอร์ที่เก็บรูปภาพ"
            drop-placeholder="ลากโฟลเดอร์รูปภาพมาวางที่นี่..."
            accept="image/jpeg, image/png"
            multiple
            directory
          >
          </b-form-file>
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col class="mb-2">
          <b-form-checkbox v-model="importWithLabel" name="check-button" switch>
            ใช้ชื่อโฟลเดอร์เป็น Label
          </b-form-checkbox>
        </b-col>
      </b-row>
      <b-row v-if="importWithLabel">
        <b-col>
          <p class="pl-2">
            ภาพทั้งหมดจะตั้งชื่อตามโฟลเดอร์หลักที่เลือก<br/>
            <img src="~/assets/images/UI/png/import_note1.png" class="center-img" height="100"/>
          </p>
        </b-col>
      </b-row>
    </b-container>
    <div v-else-if="step>=2" class="text-center">
      <!-- <Progress :radius="100" strokeColor="#007E4E" :strokeWidth="24" :value="percentage" :transitionDuration="1200">
        <h3 class="content">{{percentage}}%</h3>
        <template v-slot:footer>
          <h4 v-if="step == 2" class="my-3" text-black>กำลังนำเข้า ... {{progress}}/{{files.length || ""}}</h4>
          <h4 v-else-if="step == 3" class="my-3" text-black>นำเข้าสำเร็จ</h4>
        </template>
      </Progress> -->
      <vm-progress
            type="circle"
            :percentage="percentage"
            style="vertical-align: middle"
            strokeColor="#007E4E"
            stroke-width="24"
            :width="200"
      >
            <h4 v-if="step == 2" class="my-3" text-black>กำลังนำเข้า ... {{progress}}/{{files.length || ""}}</h4>
            <h4 v-else-if="step == 3" class="my-3" text-black>นำเข้าสำเร็จ</h4>
      </vm-progress>
    </div>
  </b-modal>
</template>
<script>
import Progress from 'vue-multiple-progress';
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
export default {
  name: "ImportImages",
  components: {
    Progress
  },
  data() {
    return {
      files: [],
      importWithLabel:false,
      step: 1, //1= select file , 2 = importing, 3 = import success
      progress : 0,
      percentage : 0,
    };
  },
  methods: {
    ...mapMutations("dataset",["addDatasetItems"]),
    ...mapMutations("project",["addLabel"]),
    ...mapActions("dataset",["addData","addDataToFs"]),
    async importImages(e){
      if(this.step == 1){ //selecting file
        e.preventDefault();
        this.step = 2;
        let dataset = [];
        this.progress = 0;
        let labels = [];
        for(let file of this.files){
          let label = null;
          if(this.importWithLabel){ //check parent dirs
            let path = file.$path || file.webkitRelativePath;
            if(path && path.includes("/")){
              let dirs = path.split("/");
              if(dirs[0]){
                label = dirs[0];
              }
            }
            if(!labels.includes(label)){
              labels.push(label);
              this.addLabel({label : label});
            }
          }
          let data = {
            id : this.$helper.randomString(16),
            //thumbnail : thumbnail,
            image: file,
            annotate : [],
            class: this.importWithLabel ? label : null,
            ext : file.name.split(".").pop()
          };
          await this.addDataToFs(data);
          delete data.image;
          dataset.push(data);
          this.progress+=1;
          this.percentage= Math.round(this.progress/this.files.length*100);
          //await this.delay(100);
        }
        this.step = 3;
        console.log("import success");
        this.addDatasetItems(dataset);
      }else if(this.step == 3){
        //import success 
      }
      
    },
    cancelImport(e){
      this.files = [];
      this.importWithLabel = false;
      this.step = 1;
      this.progress = 0;
      return;
    },
    async delay(time){
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve();
        },time);
      });
    }
  }
}
</script>
<style lang="scss" scoped>
$primary-color: #007e4e;
.bg-main{
  background-color: $primary-color;
}
.center-img{
  display: block;
  margin-left: auto;
  margin-right: auto;
  image-rendering: -moz-crisp-edges;         /* Firefox */
  image-rendering:   -o-crisp-edges;         /* Opera */
  image-rendering: -webkit-optimize-contrast;/* Webkit (non-standard naming) */
  image-rendering: crisp-edges;
  -ms-interpolation-mode: nearest-neighbor; 
}
</style>