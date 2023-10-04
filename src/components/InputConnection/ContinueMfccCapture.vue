<template>
  <div class="recorder-container d-flex align-items-center">
    <div class="full">
      <canvas class="padding-a-10" id="mfcc-client" width="224" height="224"></canvas>
      <div class="recorder-wrap">
        <div class="d-flex mr-2">
          <b-avatar id="change-threshold-popover" button variant="primary" icon="gear-fill" class="align-baseline config-btn"></b-avatar>
          <b-popover
            target="change-threshold-popover"
            triggers="focus"
            placement="auto"
          >
            <template #title>
              Setting Threshold
            </template>
            <div>
              <b-form-group
                :label="threshold"
                label-cols="2"
                class="mb-0 mt-0 threshold-config"
              >
                <b-form-input
                  class="mt-2"
                  v-model="threshold"
                  type="range"
                  min="1"
                  max="99"
                  step="1"
                ></b-form-input>
              </b-form-group>
            </div>
          </b-popover>
      </div>
        <div class="vol-adj d-flex">
          <img
            src="~/assets/images/UI/svg/volume-up.svg"
            height="16"
            class="op-btn"
          />
          <b-form-input
            type="range"
            v-model="volume"
            @change="(v)=>$emit('volumeChange',parseFloat(v))"
            min="0"
            max="1"
            step="0.1"
          ></b-form-input>
        </div>
      </div>
    </div>
     
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import Meyda from "meyda";
export default {
  components: {
  },
  // model: {
  //     prop: 'myInput',
  //     event: 'blur'
  // },
  data() {
    return {
      recording : false,
      volume: 0.7,
      threshold: 25,
      analyser : null,
      audioContext: null,
      audioSource: null,
      audioGain: null,
      mfccCanvas: null,
      mfccCtx: null,
      startTime: 0,
      prevX : 0,
      prevMX : 0,
    };
  },
  computed: {
    ...mapState('project', ['project']),
    ...mapState(['currentDevice']),
    isBrowser(){
      return this.currentDevice === "BROWSER";
    }
  },
  methods: {
    onImageReady(img){
      this.$emit("onImage", img);
    },
    async analyed(features){
      if(this.recording){
        let esp = (new Date()) - this.startTime;
        let mx = esp / (this.project.options.duration * 1000) * 224;
        let mfcc = features["mfcc"];
        let mh = 224 / mfcc.length;
        for(let i in mfcc){
          let v = mfcc[i];
          if(v >= 0){
            this.mfccCtx.fillStyle = `rgb(100,${((v * 100) | 0)}, 100)`
          }else{
            this.mfccCtx.fillStyle = `rgb(100, 100, ${((-v * 100) | 0)})`
          }
          this.mfccCtx.fillRect(this.prevMX, i * mh, mx - this.prevMX, mh); 
        }
        this.prevMX = mx;
        if(mx >= 224){
          this.endRecord();
        }
      }else{
        let h = features["rms"] * 1000;
        if(h > this.threshold){
          this.startRecord();
        }
      }
    },
    downloadPreview(id){
      return new Promise(resolve=>{
        const tmpCanvas = document.getElementById(id);
        tmpCanvas.toBlob(resolve, "image/jpeg", 0.8);
      });
    },
    async initRecord(){
      this.mfccCanvas = document.getElementById("mfcc-client");
      this.mfccCtx = this.mfccCanvas.getContext("2d");

      this.audioContext = new AudioContext();
      this.audioGain = this.audioContext.createGain();
      this.audioGain.gain.value = this.volume; // setting it to 10%
      this.audioGain.connect(this.audioContext.destination);
      try{
        let stream = await navigator.mediaDevices.getUserMedia({audio: true,video: false});
        this.audioSource = this.audioContext.createMediaStreamSource(stream);
        this.analyzer = Meyda.createMeydaAnalyzer({
          audioContext: this.audioContext,
          source: this.audioSource,
          bufferSize: 512,
          featureExtractors: ["rms","mfcc"],
          callback: this.analyed.bind(this)
        });
        return true;
      }catch(err){
        console.log(err);
        return false;
      }
    },
    async record(){
      if(!this.audioContext){
        let res = await this.initRecord();
        if(!res){
          return;
        }
      }
      this.startListening();
      //--------------------------- //
    },
    startListening(){
      this.analyzer.start();
    },
    stopListening(){
      console.log("stop recording");
      this.recording = false;
      this.analyzer.stop();
    },
    startRecord(){
      this.recording = true;
      this.startTime = new Date();
      this.prevX = 0;
      this.prevMX = 0;
      this.mfccCtx.clearRect(0, 0, 224, 224);
      this.$emit("onRecording");
      console.log("=== start record ===");
    },
    endRecord : function(){
      this.recording = false;
      this.mfccCanvas.toBlob(this.onImageReady, "image/jpeg", 0.8);
      //this.mfccCtx.clearRect(0, 0, 224, 224);
      this.prevMX = 0;
      this.startTime = new Date();
      this.$emit("onEndRecord");
      console.log("=== end record ===");
    },
  }
}
</script>
<style scoped lang="scss">
$primary-color: #007e4e;
.padding-a-10{
  margin : 10px;
  margin-top: 20px;
  border: solid 1px red;
}
.recorder-container {
  background: #333333;
  width: 100%;
  height: 310px;
  position: relative;
  .recorder-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    .vol-adj {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      margin-right: 10px;
      display: flex;
      align-items: center;
      img {
        margin-right: 0.3em;
      }
      input[type="range"] {
        width: 60px;
      }
    }
  }
}
.recorder-container-active {
  border: 10px solid #007e4e !important;
  position: absolute;
  width: 100%;
  height: 100%;
}
.full {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>