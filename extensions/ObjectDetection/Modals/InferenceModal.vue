<template>
  <b-modal
      id="inferenceDetection"
      centered
      size="md"
      title="TEST"
      modal-class="my-modal-class"
      :hide-footer="true"
      @close="onClose"
      @hide="onClose"
    >
      <div class="display-screen">
        <div class="bboxes">
          <div v-for="(box,i) in bbox"
            :key="i"
            class="bbox"
            :style="{left: box.x1+'px', top : box.y1+'px', width:(box.x2-box.x1)+'px',height:(box.y2-box.y1)+'px'}"
          >
          <span class="label-box">{{box.label}} : {{box.prob.toFixed(2)}}</span>
          </div>
        </div>
        <image-capture
          :width="435"
          source=""
          ref="camera"
          :simulator="false"
          @started="_=>(cameraReady=true)"
          @stoped="_=>(cameraReady=false)"
        ></image-capture>
      </div>
      <div class="infer_control">
        <b-form-group
          label-cols-sm="8"
          label-cols-lg="8"
          content-cols-sm
          content-cols-lg="3"
          label="Object Detection threshold"
          label-for="input-threshold"
        >
          <b-form-input id="input-threshold" type="number" placeholder="detection threshold ex : 0.5" v-model="threshold" min=0.1 max=0.9 step=0.1></b-form-input>
        </b-form-group>
        <b-avatar button @click="onInfer" :disabled="cameraReady == false" variant="primary" :icon="terminated? 'play-fill':'stop-fill'" class="align-baseline"></b-avatar>

      </div>
    </b-modal>
</template>
<script>
import axios from 'axios';
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
import ImageCapture from '~/components/InputConnection/ImageCapture.vue';
export default {
  name : "InferenceModal",
  components:{
    ImageCapture
  },
  data(){
    return {
      bbox : [],
      cameraReady : false,
      terminated: false,
      result: "-",
      prob: 0,
      threshold : 0.5
    }
  },
  computed: {
    ...mapState("server",["url","isConnected","isTraining","isTerminating","isTrained"]),
    ...mapState("project",["project"]),
  },
  methods:{
    doInference: async function(){
      if(this.terminated){
        return;
      }
      if(!this.cameraReady){
        await this.sleep(500);
        return await this.doInference();
      }
      let {image,thumbnail} = await this.$refs.camera.snap();
      const formData = new FormData();
      formData.append("image", image, "infer.jpg");
      let project_id = this.project.id;
      formData.append("project_id", project_id);
      formData.append("type", "detection");
      formData.append("threshold", this.threshold || 0.5);
      try{
        let res = await axios({
          method: "POST",
          url: this.url + "/inference_image",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          }
        });
        if(res.data.result == "OK"){
          this.bbox = res.data.boxes || [];
          console.log(this.bbox);
          this.bbox = res.data.boxes.map(el=>{
            let x1 =  el.x1 / 640 * 435;
            let x2 = el.x2 / 640 * 435;
            let y1 = el.y1 / 480 * 326;
            let y2 = el.y2 / 480 * 326;
            el.x1 = x1;
            el.x2 = x2;
            el.y1 = y1;
            el.y2 = y2;
            return el;
          });
          // for(box of res.data){

          // }
        }
        await this.sleep(200);
        return await this.doInference();
      }catch(err){
        console.log(err);
        return;
      }
    },
    onInfer: async function(){
      this.terminated = !this.terminated;
      console.log("terminated : ", this.terminated);
      if(!this.terminated){
        await this.doInference();
      }
    },
    onClose: async function(){
      this.terminated = true;
      this.cameraReady = false;
      this.bbox = [];
    },
    sleep: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}
</script>
<style lang="scss" scoped>
  .display-screen {
    background-color: #fff;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #000;
    margin-top: 10px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .infer-class {
    padding: 10px;
    img {
      margin-right: 0.5em;
    }
    span {
      font-weight: 600;
    }
  }
  .infer_control{
    text-align: center;
  }
  .bboxes{
    width: 100%;
    height: 100%;
    position: absolute;
    padding-top: 35px;
    padding-bottom: 35px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .bbox{
    display: block;
    position: absolute;
    border-width: 3px;
    border-color: green;
    border-style: solid;
  }
  .label-box{
    color: black;
    background-color: #fff;
  }
</style>
