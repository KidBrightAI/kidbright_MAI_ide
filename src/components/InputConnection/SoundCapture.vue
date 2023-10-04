<template>
  <div class="recorder-container d-flex align-items-center">
    <div v-if="recording" class="recorder-container-active"></div>
    <p v-if="counting > 0" class="counting-timer-p">
      {{ counting }}
    </p>
    <div class="voice-meter">
      <canvas id="uv-meter" width="20"></canvas>
    </div>
    <div v-show="id == null" class="full">
      <canvas id="waveform-client"></canvas>
      <canvas id="mfcc-client" width="224" height="224" style="display:none;"></canvas>
    </div>
    <div v-show="id != null" class="full">
      <WaveFormPlayer 
      :id="id" 
      sound_ext="wav" 
      img_ext="jpg" 
      :delay="project.options.duration" 
      :ref="`wavsuf`"
      :mute="true"
      >
      </WaveFormPlayer>
    </div>
    <div class="recorder-wrap">
      <div class="d-flex">
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
      <div class="time-counter">
        <span class="current-time">{{
          timeCurrent ? timeCurrent + ":00": "0:00"
        }}</span
        ><span>/ {{ project.options.duration }}:00</span>
      </div>
    </div>
  </div>
</template>
<script>
import WaveFormPlayer from "./WaveFormPlayer.vue";
import { mapState, mapActions, mapGetters } from 'vuex';
import Meyda from "meyda";
export default {
  components: {
    WaveFormPlayer
  },
  props: ["id"],
  // model: {
  //     prop: 'myInput',
  //     event: 'blur'
  // },
  data() {
    return {
      mode: "single_short", //"continue"
      drawMode: "listening", //recording
      recording : false,
      volume: 0.5,
      threshold: 25,
      timeCurrent: 0,
      timeCounter : null,
      counting: 0,
      recorder : null,
      analyser : null,
      audioContext: null,
      audioSource: null,
      audioGain: null,
      rmsCanvas: null,
      mfccCanvas: null,
      uvCanvas: null,
      canvasSize : [0,0],
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
    analyed(features){
      if(this.recording){ // draw on record
        let esp = (new Date()) - this.startTime;
        let x = esp / (this.project.options.duration * 1000) * this.canvasSize[0];
        let h = features["rms"] * 1000;
        this.rmsCanvas.fillStyle = '#FFA500';
        this.rmsCanvas.fillRect(this.prevX, (this.canvasSize[1] - h) / 2, x - this.prevX, h);
        this.prevX = x;

        let mfcc = features["mfcc"];
        let mx = esp / (this.project.options.duration * 1000) * 224;
        let mh = 224 / mfcc.length;
        for(let i in mfcc){
          let v = mfcc[i];
          if(v >= 0){
            this.mfccCanvas.fillStyle = `rgb(100,${((v * 100) | 0)}, 100)`
          }else{
            this.mfccCanvas.fillStyle = `rgb(100, 100, ${((-v * 100) | 0)})`
          }
          this.mfccCanvas.fillRect(this.prevMX, i * mh, mx - this.prevMX, mh); 
        }
        this.prevMX = mx;
      }else{ //listening mode
        this.uvCanvas.fillRect(0, (this.canvasSize[1] - h), 20, h);
        this.uvCanvas.fillStyle = '#FF0000';
        let h = features["rms"] * 1000;
        this.uvCanvas.fillRect(0, (this.canvasSize[1] - h), 20, h);
        if(h > this.threshold){
          this.uvCanvas.clearRect(0, 0, 20, this.canvasSize[1]);
          this.startRecord();
        }
      }
    },
    async recordComplete(rec,blob){
      console.log("recorded");
      let img = await this.downloadPreview("waveform-client");
      let mfcc = await this.downloadPreview("mfcc-client");
      this.$emit("recorded", {sound : blob, preview : img, mfcc : mfcc});
      this.clearCanvas();
    },
    recordTimeout(){
      console.log("record timeout");
      this.recorder.finishRecording();
      this.analyzer.stop();
      this.endRecord();
    },
    downloadPreview(id){
      return new Promise(resolve=>{
        const tmpCanvas = document.getElementById(id);
        tmpCanvas.toBlob(resolve, "image/jpeg", 0.8);
      });
    },
    async initRecord(){

      let rCanvas = document.getElementById("waveform-client");
      this.rmsCanvas = rCanvas.getContext("2d");
      rCanvas.style.width = "100%";
      rCanvas.style.height = "100%";
      rCanvas.width = rCanvas.offsetWidth;
      rCanvas.height = rCanvas.offsetHeight;
      this.canvasSize = [rCanvas.width, rCanvas.height];
      
      let mCanvas = document.getElementById("mfcc-client");
      this.mfccCanvas = mCanvas.getContext("2d");

      let uvMeterCanvas = document.getElementById("uv-meter");
      uvMeterCanvas.height = rCanvas.height;
      this.uvCanvas = uvMeterCanvas.getContext("2d");

      this.audioContext = new AudioContext();
      this.audioGain = this.audioContext.createGain();
      this.audioGain.gain.value = this.volume; // setting it to 10%
      this.audioGain.connect(this.audioContext.destination);
      try{
        let stream = await navigator.mediaDevices.getUserMedia({audio: true,video: false});
        this.audioSource = this.audioContext.createMediaStreamSource(stream);
        //stop the input from playing back through the speakers
        this.recorder = new WebAudioRecorder(this.audioSource, {
          workerDir: "/js/",
          encoding: "wav",
          options:{
            timeLimit: this.project.options.duration,
            encodeAfterRecord: true,
          }
        });
        this.recorder.onComplete = await this.recordComplete.bind(this);
        this.recorder.onTimeout = this.recordTimeout.bind(this);

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
    clearCanvas(){
      this.rmsCanvas.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
      this.uvCanvas.clearRect(0, 0, 20, this.canvasSize[1]);
    },
    async continueRecord(){
      if(!this.audioContext){
        let res = await this.initRecord();
        if(!res){
          return;
        }
      }
      this.clearCanvas();
      //--------- countdown --------//
      this.counting = 3;
      await this.$helper.sleep(1000);
      this.counting = 2;
      await this.$helper.sleep(1000);
      this.counting = 1;
      await this.$helper.sleep(1000);
      this.counting = 0;
      //---------------------------//
      this.analyzer.start();
    },
    async endContinueRecord(){
      this.analyzer.stop();
    },

    async singleRecord(){
      if(!this.audioContext){
        let res = await this.initRecord();
        if(!res){
          return;
        }
      }
      this.clearCanvas();
      //--------- countdown --------//
      this.counting = 3;
      await this.$helper.sleep(1000);
      this.counting = 2;
      await this.$helper.sleep(1000);
      this.counting = 1;
      await this.$helper.sleep(1000); 
      this.counting = 0;
      
      this.startRecord();
      await this.$helper.sleep(this.project.options.duration * 1000);
      this.endRecord();
    },

    startRecord(){
      this.recording = true;
      this.recorder.startRecording();
      //this.analyzer.start();
      this.startTime = new Date();
      this.prevX = 0;
      this.prevMX = 0;
      this.startTimer();
      this.$emit("onRecording");
      console.log("=== start record ===");
    },
    endRecord(){
      this.recording = false;   
      this.stopTimer();   
      this.$emit("onStopRecord");
      console.log("=== end record ===");
    },
    
    async simulatePlay(){
      if(this.$refs.wavsuf){
        this.startTimer();
        await this.$refs.wavsuf.play();
        this.stopTimer();
      }
    },
    startTimer(){
      this.timeCurrent = 0;
      this.timeCounter  = setInterval(()=>{
        this.timeCurrent += 1;
      },1000);
    },
    stopTimer(){
      clearInterval(this.timeCounter);
    }
  }
}
</script>
<style scoped lang="scss">
$primary-color: #007e4e;
.counting-timer-p{
  color: #6b6b6b;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 120px;
  position: absolute;
}
.recorder-container {
  background: #333333;
  width: 100%;
  height: 250px;
  position: relative;
  .recorder-wrap {
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 30px;
    left: 30px;
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
    .time-counter {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      span {
        font-weight: bold;
      }
      .current-time {
        color: $primary-color;
        padding-right: 5px;
      }
    }
    .rec-counter {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      color: $primary-color;
      font-weight: bold;
      text-transform: uppercase;
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
}
.config-btn{
  margin-right: 10px;
}
.voice-meter{
  position: absolute;
  height: 100%;
}
.threshold-config{
  width: 180px;
}
</style>