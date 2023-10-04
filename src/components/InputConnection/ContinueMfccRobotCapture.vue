<template>
  <div class="recorder-container d-flex align-items-center">
    <div class="full">
      <canvas :class="{ cssrecording : listening }" id="mfcc-client" width="224" height="224"></canvas>
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
export default {
  components: {
  },
  data() {
    return {
      recording: false,
      listening: false,
      volume: 0.7,
      threshold: 25,
      mfccCanvas: null,
      mfccCtx: null,
      startTime: 0,
      //- ros -//
      ros: null,
      rmsListener: null,
      mfccListener: null,
      statusListener: null,
      feedback: "",
    };
  },
  computed: {
    ...mapState('project', ['project']),
    ...mapState(['currentDevice','rosWebsocket']),
  },
  mounted() {
    // ------ init canvas ------//
    this.initRecord();

    this.ros = new ROSLIB.Ros({
      url : this.rosWebsocket
    });

    this.rmsListener = new ROSLIB.Topic({
      ros : this.ros,
      name : '/sound_level',
      messageType : 'std_msgs/Float32'
    });

    this.mfccListener = new ROSLIB.Topic({
      ros: this.ros,
      name: "/output/mfcc",
      messageType: "std_msgs/String"
    })

    this.statusListener = new ROSLIB.Topic({
      ros: this.ros,
      name: "/voice_class/status",
      messageType : 'std_msgs/String'
    })

    this.ros.on('connection', this.onRosConnected.bind(this));
    this.ros.on('error', this.onRosError.bind(this));
    this.ros.on('close', this.onRosClosed.bind(this));
  },
  methods: {
    initRecord(){
      this.mfccCanvas = document.getElementById("mfcc-client");
      this.mfccCtx = this.mfccCanvas.getContext("2d");
    },
    onRosConnected() {
      console.log("ROS connected");
    },
    onRosError() {
      console.log("ROS error");
    },
    onRosClosed() {
      console.log("ROS Closed");
    },
    onRms(rmsMessage) {
      if (this.recording) {
        this.mfccCtx.clearRect(0, 0, 224, 224);
        this.mfccCtx.beginPath()
        this.mfccCtx.arc(112, 112, rmsMessage.data * 2, 0, 2 * Math.PI, false)
        this.mfccCtx.fillStyle = "#fa0000";
        this.mfccCtx.fill();
      }
    },
    onMfcc(mfccMessage) {
      this.mfccCtx.clearRect(0, 0, 224, 224);
      var image = new Image();
      image.onload = ()=>{
        this.mfccCtx.drawImage(image, 0, 0);
      };
      image.src = "data:image/png;base64," + mfccMessage.data
    },
    onStatus(statusMessage) {
      console.log(statusMessage.data);
      if (statusMessage.data == "START_RECORD") {
        this.recording = true;
      } else if (statusMessage.data == "END_RECORD") {
        this.recording = false;
      } else if (statusMessage.data == "START") {
        this.listening = true;
      } else if (statusMessage.data == "CLASSIFY") {
        this.listening = false;
      }
    },
    startListening() {
      console.log("start listening");
      this.mfccCtx.clearRect(0, 0, 224, 224);
      this.rmsListener.subscribe(this.onRms.bind(this));
      this.mfccListener.subscribe(this.onMfcc.bind(this));
      this.statusListener.subscribe(this.onStatus.bind(this));
      this.listening = true;
    },
    stopListening(){
      console.log("stop listening");
      this.mfccCtx.clearRect(0, 0, 224, 224);
      this.rmsListener.unsubscribe();
      this.mfccListener.unsubscribe();
      this.statusListener.unsubscribe();
      this.listening = false;
    },
    getThreshold() {
      return this.threshold;
    }
  }
}
</script>
<style scoped lang="scss">
$primary-color: #007e4e;
.cssrecording{
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
