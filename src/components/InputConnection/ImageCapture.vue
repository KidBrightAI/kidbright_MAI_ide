<template>
  <div class="display-panel liveview w-100">
    <div class="config-camera-float-button">
      <VBtn
        v-if="captureDevices.length > 1"
        density="comfortable"
        icon="mdi-cached"
        @click="nextCamera"
      />
    </div>
    <div class="video-container">
      <AdbCameraStreaming
        v-if="captureDevice.label === 'ADB'"
        ref="adbCameraStreaming"
        @started="onStarted"
        @stopped="onStoped"
      />
      <WebSocketCameraStreaming
        v-if="captureDevice.label === 'WebSocket'"
        ref="webSocketCameraStreaming"
        @started="onStarted"
        @stopped="onStoped"
      />
      <Webcam
        v-show="captureDevice.label === 'WEBCAM'"
        ref="webcam"
        :width="props.width"
        :height="props.height"
        :device-id="captureDevice.id"
        @cameras="onCameras"
        @started="onStarted"
        @stopped="onStoped"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Webcam from "./Webcam.vue"
import AdbCameraStreaming from "./AdbCameraStreaming.vue"
import WebSocketCameraStreaming from './WebSocketCameraStreaming.vue'
import { useBoardStore } from "@/store/board"
import { useWorkspaceStore } from "@/store/workspace"

const props = defineProps({
  source: {
    type: String,
    default: "",
  },
})
const emit = defineEmits(["started", "stoped"])
const boardStore = useBoardStore()
const workspaceStore = useWorkspaceStore()

const adbCameraStreaming = ref(null)
const webSocketCameraStreaming = ref(null)
const webcam = ref(null)
const captureDevices = ref([])
const currentCaptureDeviceIndex = ref(0)

const updateCaptureDevices = () => {
  const devices = []
  if (workspaceStore.currentBoard) {
    if (workspaceStore.currentBoard.protocol === 'web-adb') {
      devices.push({ id: "ADB", label: "ADB" })
    } else if (workspaceStore.currentBoard.protocol === 'websocket') {
      devices.push({ id: "WebSocket", label: "WebSocket" })
    }
  }

  // This part for webcam can be adjusted based on how they are detected
  if (webcam.value?.cameras.length > 0) {
    webcam.value.cameras.forEach(camera => {
      devices.push({ id: camera.deviceId, label: "WEBCAM" })
    })
  } else {
    devices.push({id: 'WEBCAM_PLACEHOLDER', label: 'WEBCAM'})
  }
  captureDevices.value = devices
  console.log("capture device : ", devices)
}


const onCameras = cameras => {
  console.log("Capture Device Loaded : ", cameras)
  const webcams = cameras.map(camera => ({ id: camera.deviceId, label: "WEBCAM" }))

  // remove all webcam from captureDevices
  captureDevices.value = captureDevices.value.filter(device => device.label !== 'WEBCAM')

  // add new webcams
  captureDevices.value.push(...webcams)
}

const onStarted = stream => {
  emit("started", stream)
}

const onStoped = () => {
  emit("stopped")
}

const nextCamera = () => {
  currentCaptureDeviceIndex.value = (currentCaptureDeviceIndex.value + 1) % captureDevices.value.length
}

const captureDevice = computed(() => {
  if(Array.isArray(captureDevices.value) && captureDevices.value.length > 0){
    return captureDevices.value[currentCaptureDeviceIndex.value]
  }else{
    return {id : null, label : null}
  }
})

watch(() => workspaceStore.currentBoard, () => {
  updateCaptureDevices()
}, { deep: true, immediate: true })


const snap = async () => {
  const deviceLabel = captureDevice.value.label
  if (deviceLabel === "ADB") {
    return await adbCameraStreaming.value.capture()
  } else if (deviceLabel === 'WebSocket') {
    return await webSocketCameraStreaming.value.capture()
  } else if (deviceLabel === "WEBCAM") {
    return await webcam.value.capture()
  }
  
  return null
}

defineExpose({
  snap,
})
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
