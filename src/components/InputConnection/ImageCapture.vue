<template>
  <div class="display-panel liveview w-100">
    <div class="config-camera-float-button">
      <VBtn
        v-if="captureDevices.length > 1"
        density="comfortable"
        icon="mdi-skip-next-outline"
        @click="nextCamera"
      />
    </div>
    <div class="video-container">
      <AdbCameraStreaming v-if="captureDevice.label == 'ADB'" ref="adbCameraStreaming" @started="onStarted" @stopped="onStoped"/>
      <Webcam
        v-show="captureDevice.label == 'WEBCAM'"
        :width="props.width"
        :height="props.height"
        ref="webcam"
        @cameras="onCameras"
        @started="onStarted"
        @stopped="onStoped"
        :deviceId="captureDevice.id"
      />
    </div>
  </div>
</template>
<script setup>
import Webcam from "./Webcam.vue";
import AdbCameraStreaming from "./AdbCameraStreaming.vue";
import { useBoardStore } from "@/store/board";
const boardStore = useBoardStore();
const props = defineProps({
  source: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["started", "stoped"]);

const adbCameraStreaming = ref({});
const webcam = ref({});
const captureDevices = ref([{
  id: "ADB",
  label: "ADB",
}]);
const currentCaptureDeviceIndex = ref(0);
const currentDevice = ref(null);

const onCameras = (cameras) => {
  console.log("Capture Device Loaded : ", cameras);
  cameras.forEach((camera) => {
    captureDevices.value.push({
      id: camera.deviceId,
      label: "WEBCAM",
    });
  });
};

const onStarted = (stream) => {
  emit("started", stream);
};

const onStoped = () => {
  emit("stopped");
};

const nextCamera = () => {
  currentCaptureDeviceIndex.value = (currentCaptureDeviceIndex.value + 1) % captureDevices.value.length;
};

const captureDevice = computed(() => {
  if(Array.isArray(captureDevices.value) && captureDevices.value.length > 0){
    return captureDevices.value[currentCaptureDeviceIndex.value];
  }else{
    return {id : null, label : null};
  }
});

onMounted(() => {
  
});

const snap = async () => {
  let src = null;
  if(captureDevice.value.label == "ADB"){
    src = await adbCameraStreaming.value.capture();
  }else if(captureDevice.value.label == "WEBCAM"){
    src = await webcam.value.capture();
  }
  return src;
};

defineExpose({
  snap,
});

</script>
<style lang="scss" scoped>
.video-container {
  position: relative;
  display: contents;
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
  margin-top: -50px;
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
