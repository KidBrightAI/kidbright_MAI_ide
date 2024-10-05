<script setup>
import { sleep } from "@/engine/helper";
import {
  WrapConsumableStream,
  WrapReadableStream,
  Consumable,
  InspectStream,
  WritableStream,
} from "@yume-chan/stream-extra";
import { Adb, AdbDaemonTransport, LinuxFileType, encodeUtf8  } from "@yume-chan/adb";

import SingletonShell from "@/engine/SingletonShell";

import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import { onUnmounted } from "vue";

const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();

const status = defineModel({  
  default: "disconnected",
});

const recording = ref(false);
const counting = ref(0);
const volume = ref(0.5);
const threshold = ref(80);
const id = ref(null);
const timeCurrent = ref(0);

const canvas = ref(null);
const canvasCtx = ref(null);
const uvMeter = ref(null);
const uvMeterCtx = ref(null);
const waveform = ref(null);
const waveformCtx = ref(null);
const mfcc = ref(null);
const mfccCtx = ref(null);

let writer = null;
let sock = null;

const RATE = 44100;
const CHANNELS = 1;
const SAMPLE_SIZE = 2;
const SAMPLES_PER_FRAME = 1024;

const init = async()=>{
  // init streaming
  console.log("init streaming");
  console.log("wait for shell ready");
  //await sleep(1000);
  try{
    status.value = "connecting";
    await SingletonShell.waitWriter();
    console.log("shell ready");
    const shell = SingletonShell.getInstance();
    const adb = shell.getAdb();
    //send ctrl + c
    SingletonShell.write("\x03\n");
    SingletonShell.write("killall python3\n");
    await sleep(1000);
    SingletonShell.write("cd /root\n");
    SingletonShell.write("python3 scripts/voice_stream.py &\n");
    // shell.setCallback((data)=>{
    //   //unit8array to string
    //   const text = new TextDecoder().decode(data);
    //   console.log(text);
    // });
    console.log("create socket");
    sock = null;
    let retry = 5;
    while (retry--) {
      console.log("retry", retry);
      try {
        sock = await adb.createSocket("tcp:5000");
        break;
      } catch (e) {
        console.log(e);
        await sleep(1000);
      }
    }
    if(sock == null){
      status.value = "error";
      console.log("socket error");
      return;
    }
    status.value = "ready";
    console.log("socket created");
    writer = sock.writable.getWriter();
  }catch(e){
    console.log(e);
  }
};
let startPos = 0;
let duration = workspaceStore.extension.options.durations.value;
let barWidth = (RATE / SAMPLES_PER_FRAME * duration);
const drawWaveform = (data)=>{
  const value = parseInt(data) / 2;
  //draw waveform sync with now time and duration
  waveformCtx.value.fillStyle = "#ff0000";
  let w = waveform.value.clientWidth;
  let h = waveform.value.clientHeight;
  let esp = (w / barWidth);
  waveformCtx.value.fillRect(startPos, (h - value) / 2, esp, value);
  startPos += esp;
};
const drawUv = (data)=>{
  const value = parseInt(data);
  //draw uv meter
  uvMeterCtx.value.clearRect(0, 0, uvMeter.value.width, uvMeter.value.height);
  uvMeterCtx.value.fillStyle = "#ff0000";
  uvMeterCtx.value.fillRect(0, uvMeter.value.height - value, uvMeter.value.width, value);
};
const clearCanvas = ()=>{
  waveformCtx.value.clearRect(0, 0, waveform.value.width, waveform.value.height);
  uvMeterCtx.value.clearRect(0, 0, uvMeter.value.width, uvMeter.value.height);
};
const listen = async()=>{
  //sending command to start recording  
  clearCanvas();
  status.value = "listening";
  let th = threshold.value || 128;
  let sec = workspaceStore.extension.options.durations.value || 3;
  let command = `#start,${th},${sec}\n`;  
  writer.write(new Consumable(encodeUtf8(command))); 
  sock.readable.pipeTo(new WritableStream({
    write(chunk){
      const text = new TextDecoder().decode(chunk);
      //console.log(text);      
      if(text.startsWith("#uv")){
        const value = text.split(",")[1];        
        drawUv(value);
      }
      if(text.startsWith("#rm")){ //wave form to draw         
        const value = text.split(",")[1];
        const data = parseInt(value);
        drawWaveform(data);
      }
      if(text.startsWith("#rec_start")){
        status.value = "recording";
        clearCanvas();
        startPos = 0;
        recording.value = true;
        counting.value = sec;
        const interval = setInterval(()=>{
          counting.value--;
          if(counting.value <= 0){
            clearInterval(interval);
            recording.value = false;
          }
        }, 1000);
      }      
      if(text.startsWith("#rec_stop")){
        recording.value = false;
        counting.value = 0;
      }
      if(text.startsWith("#process_start")){
        //start save voice
      }
      if(text.startsWith("#process_stop")){
        //stop save voice
        status.value = "ready";
      }
      if(text.startsWith("#novoice")){        
        status.value = "ready";
      }
    }
  }));
};

const stop = async()=>{

};
const pullFile = async()=>{
  const shell = SingletonShell.getInstance();
  const adb = shell.getAdb();
  const sync = await adb.sync();
  const file = await sync.pull("/root/kbvoice.wav");  
};
const assignCanvas = ()=>{
  canvas.value = document.getElementById("waveform-client");
  canvasCtx.value = canvas.value.getContext("2d");

  uvMeter.value = document.getElementById("uv-meter");  
  uvMeter.value.width = 20;
  uvMeter.value.height = 250;
  uvMeterCtx.value = uvMeter.value.getContext("2d");

  waveform.value = document.getElementById("waveform-client");
  waveformCtx.value = waveform.value.getContext("2d");
  waveform.value.width = waveform.value.clientWidth;
  waveform.value.height = waveform.value.clientHeight;

  mfcc.value = document.getElementById("mfcc-client");
  mfcc.value.width = 224;
  mfcc.value.height = 224;
  mfccCtx.value = mfcc.value.getContext("2d");
};

onMounted(async () => {
  assignCanvas();
  if(boardStore.connected){
    await init();
  }
  
  //resize canvas
  window.addEventListener("resize", ()=>{
    waveform.value.width = waveform.value.clientWidth;
    waveform.value.height = waveform.value.clientHeight;
    uvMeter.value.width = uvMeter.value.clientWidth;
    uvMeter.value.height = uvMeter.value.clientHeight;
  });
});

onUnmounted(() => {
  console.log("stop streaming");
  SingletonShell.write("killall python3\n");
  status.value = "disconnected";
});

defineExpose({
  init,
  listen,
  stop
});
</script>
<template>
  <div class="recorder-container d-flex align-items-center">
    <div v-if="recording" class="recorder-container-active"></div>
    <p v-if="counting > 0" class="counting-timer-p">
      {{ counting }}
    </p>
    <div class="voice-meter">
      <canvas v-show="status == 'listening'" id="uv-meter" width="20" height="250"></canvas>
    </div>
    <div v-show="id == null" class="full">
      <canvas id="waveform-client" style="width: 100%; height: 250px;"></canvas>
      <canvas id="mfcc-client" width="224" height="224" style="display:none;"></canvas>
    </div>
    <div v-show="id != null" class="full">
      <!--WaveFormPlayer 
      :id="id" 
      sound_ext="wav" 
      img_ext="jpg" 
      :delay="project.options.duration" 
      :ref="`wavsuf`"
      :mute="true"
      >
      </WaveFormPlayer-->
    </div>
    <div class="recorder-wrap">
      <VMenu :close-on-content-click="false" location="bottom">
        <template v-slot:activator="{props}">
          <VBtn class="me-3" icon="mdi-cog" v-bind="props"></VBtn>
        </template>
        <VList>
          <VListItem>
            <VListItemTitle>Setting Threshold</VListItemTitle>
            <VListItemContent>
              <VSlider
                v-model="threshold"
                min="1"
                max="255"
                step="1"
              ></VSlider>
            </VListItemContent>
          </VListItem>
        </VList>
      </VMenu>            
      <div class="vol-adj d-flex">        
        <VSlider
          v-model="volume"
          min="0"
          max="1"
          step="0.1"
          prepend-icon="mdi-volume-high"
        ></VSlider>
      </div>
      <div class="time-counter">
        <span class="current-time">{{
          timeCurrent ? timeCurrent + ":00": "0:00"
        }}</span
        ><span>/ {{ workspaceStore.extension.options.durations.value }}:00</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
      padding: 6px 15px;
      box-shadow: 0 0 10px #33333333;
      margin-right: 10px;
      display: flex;
      align-items: center;
      width: 200px;
      img {
        margin-right: 0.3em;
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