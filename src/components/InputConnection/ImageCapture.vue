<template>
  <div class="display-panel liveview">
    <div class="config-camera-float-button">
      <b-avatar v-if="simulator" icon="box" :size="32" button @click="$emit('openSim')"></b-avatar>
      <!-- <b-avatar icon="gear-fill" :size="32" button></b-avatar> -->
      <b-avatar
        v-if="captureDevices.length > 1"
        icon="arrow-repeat"
        :size="32"
        button
        @click="nextCamera"
      ></b-avatar>
    </div>

    <div v-if="deviceType == 'STREAM'">
      <b-img
        ref="displayImage"
        crossorigin="anonymous"
        :width="width"
        :src="captureDevices[currentCaptureDeviceIndex]"
      >
      </b-img>
    </div>
    <div class="video-container">
      <vue-web-cam
          v-show="deviceType != 'STREAM'"
          :width="width"
          :height="height"
          ref="webcam"
          @cameras="onCameras"
          @started="onStarted"
          @stopped="onStoped"
          :deviceId="captureDevice"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  components:{
  },
  props: {
    source: {
      type: String,
      default: "",
    },
    width: {
      type: [String, Number],
      default: 260,
    },
    height: {
      type: [String, Number],
      default: '100%',
    },
    simulator : {
      type : Boolean,
      default: true
    }
  },
  data() {
    return {
      captureDevices: [],
      currentCaptureDeviceIndex: 0,
      canvas: null,
      canvas_thumbnail: null,
    };
  },
  created() {
    // add robot device
    if (this.currentDevice == "ROBOT") {
      this.captureDevices.push(this.streamUrl + '?topic=/output/image_raw&type=ros_compressed');
      this.$emit("started");
    }
    // add simulator device

  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType(){
      let curr = this.captureDevices[this.currentCaptureDeviceIndex];
      if(!curr){
        return "WEBCAM"
      }else if(curr.length == 64 && !curr.startsWith("http")){
        return "WEBCAM";
      }else if(curr.startsWith("http")){
        return "STREAM";
      }else if(curr == "SIM"){
        return "SIM";
      }
    },
    captureDevice(){
      console.log('capture device change');
      if(Array.isArray(this.captureDevices) && this.captureDevices.length > 0){
        return this.captureDevices[this.currentCaptureDeviceIndex];
      }else{
        return null;
      }
    }
  },
  methods: {
    onCameras(devices) {
      this.captureDevices = [...this.captureDevices, ...devices.map(el=>el.deviceId)];
      this.currentCaptureDeviceIndex = 0;
      console.log("capture devices : ", devices.length);
    },
    onStarted() {
      if(this.deviceType == "WEBCAM"){
        this.$emit("started");
      }
    },
    onStoped() {
      if(this.deviceType == "WEBCAM"){
        this.$emit("stoped");
      }
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
      else if(this.deviceType == "STREAM"){
        console.log("start stream");
        this.$emit("started");
      }
      // reset canvas
      this.ctx = null;
      this.ctx_thumbnail = null;
    },
    async snap() {
      let image = await this.captureWithTumbnail();
      return image;
    },
    canvasToBlob(canvas, format = "image/jpeg", quality = 0.8) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject();
            }
          },
          format,
          quality
        );
      });
    },
    async captureWithTumbnail(thumbnail_height = 120) {
      let src,width,height;
      if(this.deviceType == "WEBCAM"){
        src = this.$refs.webcam.$refs.video;
        width = src.videoWidth;
        height = src.videoHeight;
      }else if(this.deviceType == "STREAM" || this.deviceType == "SIM"){
        src = this.$refs.displayImage;
        width = src.clientWidth;
        height = src.clientHeight;
      }
      if (!this.ctx) {
        let canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
      }
      if (
        !this.ctx_thumbnail ||
        thumbnail_height != this.canvas_thumbnail.height
      ) {
        let canvas = document.createElement("canvas");
        let imageRatio = width / height;
        let newWidth = thumbnail_height * imageRatio;
        canvas.width = newWidth;
        canvas.height = thumbnail_height;
        this.canvas_thumbnail = canvas;
        this.ctx_thumbnail = canvas.getContext("2d");
      }
      const { ctx, ctx_thumbnail, canvas_thumbnail, canvas } = this;
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
      ctx_thumbnail.drawImage(
        src,
        0,
        0,
        canvas_thumbnail.width,
        canvas_thumbnail.height
      );
      let image = await this.canvasToBlob(canvas);
      let thumbnail = await this.canvasToBlob(canvas_thumbnail);
      return {
        image: image,
        thumbnail: thumbnail,
        width: canvas.width,
        height: canvas.height,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.video-container {
  position: relative;
}
.cam-overlay{
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.config-camera-float-button {
  display: inline;
  position: absolute;
  margin-top: -38px;
  right: 20px;
}

.display-panel {
  border-radius: 8px;
  background-color: #333;
  overflow: hidden;
  margin-top: 15px;
  display: flex;
  .display-image {
    margin: 0;
    canvas {
      min-height: 180px;
      height: 180px;
      width: 100%;
      object-fit: cover;
    }
  }
}
.liveview {
  margin: 2em 1em;
}
</style>
