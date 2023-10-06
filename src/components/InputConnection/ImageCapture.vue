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
      <!-- <Webcam
          :width="props.width"
          :height="props.height"
          ref="webcam"
          @cameras="onCameras"
          @started="onStarted"
          @stopped="onStoped"
          :deviceId="captureDevice"
      /> -->
      
      <AdbCameraStreaming v-if="boardStore.isConnected()" ref="adbCameraStreaming"/>
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
const captureDevices = ref([]);
const currentCaptureDeviceIndex = ref(0);
const currentDevice = ref(null);

const onCameras = (cameras) => {
  console.log("Capture Device Loaded : ", cameras);
  captureDevices.value = cameras.map((camera) => {
    return {
      id: camera.deviceId,
      label: camera.label,
    };
  });
  currentCaptureDeviceIndex.value = 0;
};

const onStarted = (stream) => {
  emit("started", stream);
};

const onStoped = () => {
  emit("stopped");
};

const nextCamera = () => {
  currentCaptureDeviceIndex.value =
    (currentCaptureDeviceIndex.value + 1) % captureDevices.value.length;
  currentDevice.value =
    captureDevices.value[currentCaptureDeviceIndex.value].label;
};

const captureDevice = computed(() => {
  if(Array.isArray(captureDevices.value) && captureDevices.value.length > 0){
    return captureDevices.value[currentCaptureDeviceIndex.value].id;
  }else{
    return null;
  }
});


onMounted(() => {
  
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
