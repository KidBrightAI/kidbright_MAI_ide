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
          <b-form-checkbox v-model="importLabel" name="check-button" switch>
            นำเข้า Label (XML-Pascal VOC)
          </b-form-checkbox>
        </b-col>
      </b-row>
      <hr/>
      <b-row v-if="importLabel" class="mb-4">
        <b-col>
          <b-form-file
            v-model="xmlfiles"
            placeholder="เลือกโฟลเดอร์ที่เก็บ Label"
            drop-placeholder="ลากโฟลเดอร์ Label มาวางที่นี่..."
            accept="application/xml"
            multiple
            directory
          >
          </b-form-file>
        </b-col>
      </b-row>
      <b-row v-if="importLabel">
        <b-col>
          <p class="pl-2">
            ชื่อไฟล์ต้องตรงกับชื่อรูปภาพและอยู่ในรูปแบบของ <a href="http://host.robots.ox.ac.uk/pascal/VOC/" target="_blank"><span style="color:red;">PascalVOC</span></a><br/>
            <img src="~/assets/images/UI/png/import_note_anno.png" class="center-img" height="100"/>
          </p>
        </b-col>
      </b-row>
    </b-container>
    <div v-else-if="step>=2" class="text-center">
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
      xmlfiles: [],
      step: 1, //1= select file , 2 = importing, 3 = import success
      progress : 0,
      percentage : 0,
      importLabel: false,
    };
  },
  methods: {
    ...mapMutations("dataset",["addDatasetItems"]),
    ...mapMutations("project",["addLabel"]),
    ...mapActions("dataset",["addData","addDataToFs"]),
    async getImageSize(file){
      return new Promise((resolve,reject)=>{
        let img = new Image();
        img.onload = () => {
          resolve([img.width,img.height]);
        }
        img.onerror = (err)=>{
          reject(err);
        }
        img.src = window.URL.createObjectURL(file);
      });
    },
    parsePascalVoc(file){
      let that = this;
      return new Promise((resolve,reject)=>{
        let fr = new FileReader();
        fr.onload=function(){
          try{
            let xmltext = fr.result;
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(xmltext, 'text/xml');
            let object = {
              filename : xmlDoc.getElementsByTagName("filename")[0].innerHTML,
              width : parseInt(xmlDoc.getElementsByTagName("width")[0].innerHTML),
              height: parseInt(xmlDoc.getElementsByTagName("height")[0].innerHTML),
              annotate : []
            }
            let objs = xmlDoc.getElementsByTagName('object');
            let labels = [];
            for(let bb of objs){
              let label = bb.getElementsByTagName("name")[0].innerHTML;
              let x1 = parseInt(bb.getElementsByTagName("xmin")[0].innerHTML);
              let x2 = parseInt(bb.getElementsByTagName("xmax")[0].innerHTML);
              let y1 = parseInt(bb.getElementsByTagName("ymin")[0].innerHTML);
              let y2 = parseInt(bb.getElementsByTagName("ymax")[0].innerHTML);
              let id = that.$helper.randomString(16);
              object.annotate.push({label : label, id : id, x1 : x1, x2: x2, y1: y1, y2: y2});
              if(!labels.includes(label)){
                labels.push(label);
              }
            }
            object.labels = labels;
            resolve(object);
          }catch(err){
            reject(err);
          }
        }
        fr.onerror = (err)=>{
          reject(err);
        }    
        fr.readAsText(file);
      });
    },
    async importImages(e){
      if(this.step == 1){ //selecting file
        e.preventDefault();
        this.step = 2;
        let dataset = [];
        let labels = [];
        this.progress = 0;
        for(let file of this.files){
          try{
            let size = await this.getImageSize(file);
            let annotate = {};
            if(this.importLabel){
              // TODO : check if it has multiple dot filename
              let targetFile = this.xmlfiles.find(el=>el.name.split(".")[0] == file.name.split(".")[0]);
              if(!targetFile){
                continue;
              }
              annotate = await this.parsePascalVoc(targetFile);
              if(annotate.filename != file.name){
                continue;
              }
              if(annotate.width != size[0] || annotate.height != size[1]){
                continue;
              }
              //labels = labels.concat(annotate.labels);
              labels = labels.concat(annotate.labels.filter((item) => labels.indexOf(item) < 0));
            }

            let data = {
              id : this.$helper.randomString(16),
              image: file,
              annotate : this.importLabel? annotate.annotate : [],
              width: size[0],
              height: size[1],
              class: null,
              ext : file.name.split(".").pop()
            };
            await this.addDataToFs(data);
            delete data.image;
            dataset.push(data);
            this.progress+=1;
            this.percentage= Math.round(this.progress/this.files.length*100);
          }catch(err){
            console.log(err);
            continue;
          }
        }
        this.step = 3;
        console.log("import success");
        console.log(dataset);
        this.addDatasetItems(dataset);
        console.log(labels);
        labels.forEach(label=>{
          this.addLabel({label : label});
        })
      }else if(this.step == 3){
        //import success 
      }
      
    },
    cancelImport(e){
      this.files = [];
      this.step = 1;
      this.progress = 0;
      return;
    },
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