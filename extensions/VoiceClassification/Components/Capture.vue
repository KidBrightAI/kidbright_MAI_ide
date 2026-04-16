<script setup>
import AdbSoundCapture from "@/components/InputConnection/AdbSoundCapture.vue"
import WaveFormPlayer from "@/components/InputConnection/WaveFormPlayer.vue"
import DatasetCounter from "@/components/InputConnection/DatasetCounter.vue"
import SoundDatasetList from "@/components/InputConnection/SoundDatasetList.vue"
import { randomId } from "@/components/utils"
import { useDatasetStore } from '@/store/dataset'
import { useWorkspaceStore } from '@/store/workspace'
import { useBoardStore } from '@/store/board'

const datasetStore = useDatasetStore()
const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()

const current = ref([])
const status = ref("disconnected")
const soundCapture = ref(null)
const playbackVolume = ref(0.5)
const connecting = ref(false)

const ACTIVE_STATES = ['listening', 'recording', 'processing', 'finishing']
const isRecorderActive = computed(() => ACTIVE_STATES.includes(status.value))
const selectedId = computed(() => current.value.slice(-1).pop() ?? null)
const duration = computed(() => workspaceStore.extension.options.durations.value || 3)

const connectBoard = async () => {
  connecting.value = true
  try {
    await boardStore.deviceConnect()
    if (boardStore.connected && soundCapture.value) {
      await soundCapture.value.init()
    }
  } catch (e) {
    console.error("Board connect failed:", e)
  } finally {
    connecting.value = false
  }
}

const record = () => {
  soundCapture.value.listen()
}

const onRecordComplete = async data => {
  if (data) {
    const newItem = {
      id: randomId(),
      thumbnail: null,
      image: data.preview,
      mfcc: data.mfcc,
      sound: data.sound,
      annotate: [],
      class: null,
      ext: "png",
      sound_ext: "wav",
      mfcc_ext: "png",
      duration: data.duration,
    }
    await datasetStore.addData(newItem)
    current.value = [newItem.id]
  }
}

onMounted(async () => {
  if (!boardStore.connected) {
    await connectBoard()
  }
})
</script>

<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-items-center justify-content-center view-panel">
          <!-- Recorder: always mounted (canvas needs DOM), wrapper div for v-show -->
          <div
            v-show="isRecorderActive || !selectedId"
            class="w-100"
          >
            <AdbSoundCapture
              ref="soundCapture"
              v-model="status"
              @recorded="onRecordComplete"
            />
          </div>

          <!-- Playback: shown when idle + item selected -->
          <div
            v-if="!isRecorderActive && selectedId"
            class="playback-container"
          >
            <WaveFormPlayer
              :id="selectedId"
              sound_ext="wav"
              img_ext="png"
              :delay="duration"
              :volume="playbackVolume"
            />
          </div>

          <!-- Empty state message -->
          <p
            v-if="!selectedId && !isRecorderActive"
            class="center-pos text-white"
          >
            No selected item, please click on the list below to select.
          </p>

          <DatasetCounter
            :current="selectedId ? datasetStore.positionOf(selectedId) + 1 : null"
            prefix="Selected "
            suffix="Sound"
          />
        </div>
        <SoundDatasetList
          v-model="current"
          :multiple="true"
          :show-info="false"
          :volume="playbackVolume"
        />
      </div>
      <div
        class="side-panel d-flex justify-space-between"
        style="width: 300px"
      >
        <div class="w-100">
          <!-- Board Connection Status -->
          <h5 class="side-panel-ttl">
            Board Connection
          </h5>
          <div class="pa-3">
            <div
              v-if="boardStore.connected && status !== 'disconnected' && status !== 'error'"
              class="d-flex align-center ga-2"
            >
              <VIcon
                icon="mdi-check-circle"
                color="success"
                size="20"
              />
              <span class="text-success font-weight-bold">Connected</span>
            </div>
            <div
              v-else-if="connecting || status === 'connecting'"
              class="d-flex align-center ga-2"
            >
              <VProgressCircular
                indeterminate
                size="18"
                width="2"
                color="primary"
              />
              <span>Connecting...</span>
            </div>
            <div v-else>
              <VBtn
                color="primary"
                variant="outlined"
                block
                prepend-icon="mdi-usb"
                :loading="connecting"
                @click="connectBoard"
              >
                Connect Board
              </VBtn>
            </div>
          </div>

          <!-- Recorder Settings -->
          <h5 class="side-panel-ttl">
            Recorder Settings
          </h5>
          <div class="pa-3">
            <p>Range : <b>{{ duration }}</b> seconds</p>
          </div>

          <!-- Playback Volume -->
          <h5 class="side-panel-ttl">
            Playback Volume
          </h5>
          <div class="pa-3">
            <VSlider
              v-model="playbackVolume"
              min="0"
              max="1"
              step="0.1"
              prepend-icon="mdi-volume-high"
              hide-details
              color="primary"
            />
          </div>
        </div>

        <!-- Record Button with status feedback -->
        <div class="center bottom-action d-flex flex-column align-center ga-2">
          <span
            v-if="status === 'disconnected' || status === 'error'"
            class="text-caption text-medium-emphasis"
          >
            Connect board to record
          </span>
          <span
            v-else-if="status === 'connecting'"
            class="text-caption text-medium-emphasis"
          >
            Initializing microphone...
          </span>
          <span
            v-else-if="status === 'listening'"
            class="text-caption text-primary font-weight-bold"
          >
            Listening for sound...
          </span>
          <span
            v-else-if="status === 'recording'"
            class="text-caption text-error font-weight-bold"
          >
            Recording...
          </span>
          <span
            v-else-if="status === 'processing' || status === 'finishing'"
            class="text-caption text-medium-emphasis"
          >
            Processing audio...
          </span>

          <img
            v-if="status === 'ready'"
            class="op-btn"
            src="@/assets/images/png/Group_200.png"
            height="96"
            @click="record"
          >
          <img
            v-else
            class="op-btn op-btn-disable"
            src="@/assets/images/png/Group_200.png"
            height="96"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$primary-color: #007e4e;
.center-pos {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 1.0rem;
  font-weight: 700;
}
.playback-container {
  width: 100%;
  height: 100%;
  background: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;
  margin: 0 0.5em;
  &:hover {
    opacity: 0.7;
  }
}
.op-btn-disable {
  pointer-events: none;
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
}
.side-panel-ttl {
  color: $primary-color;
  font-weight: 700;
  background: #cdcdcd;
  padding: 10px 20px;
  margin-bottom: 0;
  width: 100%;
}
.side-panel {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.bottom-action {
  padding: 15px;
}
.outer-wrap {
  overflow: hidden;
}
.main-panel {
  width: calc(100% - 300px);
}
.view-panel {
  background-color: #ffffff;
  position: relative;
  img {
    min-width: 50%;
    min-height: 50%;
    object-fit: contain;
  }
}
</style>
