<template>
  <div class="source-streamer-container d-flex align-items-center justify-content-center">
    <div class="center-streamer">
      <div class="config-camera-float-button">
        <b-avatar
          v-if="captureDevices.length > 1"
          icon="arrow-repeat"
          :size="32"
          button
          @click="nextCamera"
        ></b-avatar>
      </div>
      <vue-web-cam
        v-show="deviceType == 'WEBCAM'"
        width="auto"
        :height="height"
        ref="webcam"
        @cameras="onCameras"
        @started="onStarted"
        @stopped="onStoped"
        :deviceId="captureDevice"
      />
      <div v-show="deviceType == 'STREAM' || deviceType == 'UPLOAD' || deviceType == 'SIM'" class="sim-display">
        <canvas width="320" height="240" 
          id="streamCanvas" 
          ref="displayCanvas" 
          class="resizable-canvas" 
          @dragover.prevent @drop="handleDrop">
        </canvas>
      </div>
      <div v-show="boxes.length" class="display-controller">
        <div v-show="boxes.length" class="bboxes" ref="boxContainer">
          <div
            v-for="(box, i) in boxes"
            :key="i"
            class="bbox"
            :style="{
              left: box.x1 + 'px',
              top: box.y1 + 'px',
              width: box.x2 - box.x1 + 'px',
              height: box.y2 - box.y1 + 'px',
            }"
          >
            <span class="label-box">{{ box.label }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  components:{
  },
  props: {
    bbox: {
      type: Array,
      default() {
        return [];
      },
    },
    speed:{
      type: Number,
      default: 80
    },
    source: {
      type: Object,
    },
    height: {
      type: Number,
      default: 220,
    }
  },
  data() {
    return {
      captureDevices: ["SIM", "UPLOAD"],
      currentCaptureDeviceIndex: 0,
      
      uploadImage : null,
      imageUrl: "",
      streamingUrl: "/images/streaming.jpg",
      simImage : null,
      
      looper : null,
      ctx:null,
      boxes: [],
    };
  },
  mounted(){
    this.looper = setInterval(this.loopGetImageStream.bind(this), this.speed);
    this.ctx = this.$refs.displayCanvas.getContext("2d");
  },
  beforeDestroy(){
    clearInterval(this.looper);
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType(){
      let curr = this.captureDevices[this.currentCaptureDeviceIndex];
      if(!curr){
        return "WEBCAM"
      }else if(curr == "STREAM"){
        return "STREAM";
      }else if(curr == "SIM"){
        return "SIM";
      }else if(curr == "UPLOAD"){
        return "UPLOAD";
      }else if(curr.length == 64 && !curr.startsWith("http")){
        return "WEBCAM";
      }
    },
    captureDevice(){
      if(Array.isArray(this.captureDevices) && this.captureDevices.length > 0){
        return this.captureDevices[this.currentCaptureDeviceIndex];
      }else{
        return null;
      }
    }
  },
  methods: {
    loopGetImageStream(){
      if(this.source.instance.gameInstance && this.deviceType == "SIM"){
        let imgStr = "data:image/jpeg;base64," + this.source.instance.gameInstance.contentWindow.ImageBase64();
        let image = new Image();
        image.onload = ()=>{
          if(this.deviceType == "SIM"){
            this.$refs.displayCanvas.width = image.width;
            this.$refs.displayCanvas.height = image.height;
            this.ctx.drawImage(image,0,0);
          }
        };
        image.src = imgStr;
      }
    },
    changeStreamSource(event){
      this.streamingUrl = event;
    },
    handleDrop(e){
      e.preventDefault();
      if(e.dataTransfer.files && e.dataTransfer.files.length > 0){
        let img = new Image();
        // var reader = new FileReader();
        // reader.onload = (et)=>{
        //   img.src = et.target.result; 
        // }
        let file = e.dataTransfer.files[0];
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            if(this.deviceType == "UPLOAD"){
            this.$refs.displayCanvas.width = img.width;
            this.$refs.displayCanvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
          }
        }
      }
      
    },
    onCameras(devices) {
      this.captureDevices = [...this.captureDevices, ...devices.map(el=>el.deviceId)];
      this.currentCaptureDeviceIndex = 0;
      console.log("capture devices : ", devices.length);
    },
    onStarted() {
      this.$emit("started");
    },
    onStoped() {
      this.$emit("stoped");
    },
    nextCamera() {
      this.currentCaptureDeviceIndex++;
      if (this.currentCaptureDeviceIndex >= this.captureDevices.length) {
        this.currentCaptureDeviceIndex = 0;
      }
      console.log(
        "change camera to : ",
        this.captureDevices[this.currentCaptureDeviceIndex]
      );
      // webcam 
      if(this.deviceType == "WEBCAM"){
        this.$refs.webcam.changeCamera(
          this.captureDevices[this.currentCaptureDeviceIndex]
        );
      }
      if(this.deviceType == "SIM"){
        this.ctx = this.$refs.displayCanvas.getContext("2d");
      }
      if(this.deviceType == "UPLOAD"){
        this.ctx = this.$refs.displayCanvas.getContext("2d");
        this.$refs.displayCanvas.width = 300;
        this.$refs.displayCanvas.height = 300;
        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(0,0,300,300);
        this.ctx.font = "22px Poppins";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = 'white';
        this.ctx.fillText("Drag image here", 150, 150);
        this.ctx.fillText("to upload", 150, 180);
      }
    },
    capture() {
      if(this.deviceType == "WEBCAM"){
        let canvas = this.$refs.webcam.getCanvas();
        let src = this.$refs.webcam.$refs.video;
        return canvas.getContext('2d').getImageData(0,0,src.videoWidth,src.videoHeight);
      }else if(this.deviceType == "UPLOAD" || this.deviceType == "SIM"){
        let src = this.$refs.displayCanvas;
        return this.ctx.getImageData(0,0, src.width, src.height);
      }
    },
  },
  watch: {
    bbox: function (newValue) {
      if (newValue && newValue.length) {
        this.boxes = newValue.map((el) => {
          let w = 1,h = 1;
          if(this.deviceType == "WEBCAM"){
            let src = this.$refs.webcam.$refs.video;
            w = src.videoWidth;
            h = src.videoHeight;
          }else{
            w = this.canvas.width;
            h = this.canvas.height;
          }
          let cWidth = this.$refs.boxContainer.clientWidth / w;
          let cHeight = this.$refs.boxContainer.clientHeight / h;
          return {
            x1: el.left * cWidth,
            y1: el.top * cHeight,
            x2: el.right * cWidth,
            y2: el.bottom * cHeight,
            label: el.class,
            prob: el.score,
          };
        });
      }else{
        this.boxes = [];
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.sim-display{
  display: flex;
  height: 220px;
  position: relative;
  width: 100%;
  flex-direction: column;
}
.resizable-canvas{
  width: auto;
  height: 100%;
}
.image-upload{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.source-streamer-container{
  background-image: url(/images/kanom-see-2.png);
  background-repeat: no-repeat;
  background-size: contain;
  width: 100%;
  position: relative;
}
.center-streamer {
  position: relative;
  display: flex;
  min-height: 10px;
}
.config-camera-float-button {
  position: absolute;
  right: -45px;
  top: 5px;
}


.display-controller {
  pointer-events: none;
  position: absolute;
  width: 100%;
  border: solid green 1px;
  top: 50%;
  height: 100%;
  transform: translateY(-50%);
}
.bboxes {
  width: 100%;
  height: 100%;
  right: 0;
  position: absolute;
}
.bbox {
  display: block;
  position: absolute;
  border-width: 2px;
  border-color: green;
  border-style: solid;
}
.label-box {
  color: black;
  font-size: 11px;
  background-color: #fff;
}
</style>