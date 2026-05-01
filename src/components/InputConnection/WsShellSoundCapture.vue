<script setup>
import { sleep } from "@/engine/helper"
import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"
import { onBeforeMount, onUnmounted } from "vue"

/**
 * V2 (kidbright-mai-plus / websocket-shell) variant of AdbSoundCapture.
 *
 * The V1 component speaks ADB and opens an in-band TCP socket to the
 * board's voice_stream.py daemon (`adb.createSocket("tcp:5000")`). V2
 * has no ADB transport, so we go through ws_shell's `tcp_relay_*`
 * commands instead — same daemon, same wire protocol (text lines like
 * `#uv,<rms>`), different transport.
 */

const emits = defineEmits(["recorded"])
const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()

const status = defineModel({ default: "disconnected" })
const recording = ref(false)
const counting = ref(0)
const threshold = ref(80)
const timeCurrent = ref(0)

const canvas = ref(null)
const canvasCtx = ref(null)
const uvMeter = ref(null)
const uvMeterCtx = ref(null)
const waveform = ref(null)
const waveformCtx = ref(null)
const mfcc = ref(null)
const mfccCtx = ref(null)

let relay = null
const decoder = new TextDecoder()

const RATE = 44100
const SAMPLES_PER_FRAME = 1024
let startPos = 0
let barWidth = (RATE / SAMPLES_PER_FRAME * (workspaceStore.extension.options.durations.value || 3))

const drawWaveform = data => {
  const value = parseInt(data) / 2
  waveformCtx.value.fillStyle = "#ff0000"
  const w = waveform.value.clientWidth
  const h = waveform.value.clientHeight
  const esp = (w / barWidth)
  waveformCtx.value.fillRect(startPos, (h - value) / 2, esp, value)
  startPos += esp
}

const drawUv = data => {
  const value = parseInt(data)
  uvMeterCtx.value.clearRect(0, 0, uvMeter.value.width, uvMeter.value.height)
  uvMeterCtx.value.fillStyle = "#ff0000"
  uvMeterCtx.value.fillRect(0, uvMeter.value.height - value, uvMeter.value.width, value)
}

const clearCanvas = () => {
  waveformCtx.value.clearRect(0, 0, waveform.value.width, waveform.value.height)
  uvMeterCtx.value.clearRect(0, 0, uvMeter.value.width, uvMeter.value.height)
}

const countdown = () => {
  counting.value = workspaceStore.extension.options.durations.value || 3
  const interval = setInterval(() => {
    counting.value--
    if (counting.value <= 0) clearInterval(interval)
  }, 1000)
}

// Voice_stream.py emits `#uv,<n>` / `#rm,<n>` / `#rec_start` / `#rec_stop`
// / `#process_start` / `#process_stop` / `#novoice`. We assume one message
// per relay chunk (small text packets — the daemon always send()s one
// message at a time, and asyncio.reader.read on the loopback side
// preserves those boundaries in practice for LAN-speed flows).
const processChunk = chunk => {
  const text = decoder.decode(chunk)
  if (text.startsWith("#uv")) {
    drawUv(text.split(",")[1])
  } else if (text.startsWith("#rm")) {
    drawWaveform(parseInt(text.split(",")[1]))
  } else if (text.startsWith("#rec_start")) {
    status.value = "recording"
    clearCanvas()
    startPos = 0
    recording.value = true
    countdown()
  } else if (text.startsWith("#rec_stop")) {
    recording.value = false
    counting.value = 0
  } else if (text.startsWith("#process_start")) {
    status.value = "processing"
  } else if (text.startsWith("#process_stop")) {
    status.value = "finishing"
    onFinish()
  } else if (text.startsWith("#novoice")) {
    status.value = "ready"
  }
}

const init = async () => {
  try {
    status.value = "connecting"
    const handler = boardStore.handler
    if (!handler || !boardStore.capabilities.tcpRelay) {
      status.value = "error"
      console.error("ws_shell tcp_relay not available")
      return
    }

    // Kill any leftover voice_stream from a previous session, then
    // start fresh. The daemon binds 0.0.0.0:5000 but we connect via
    // 127.0.0.1 so it's effectively private to this board.
    await handler.interrupt()
    // Surgical kill: only the voice_stream.py daemon, not all python.
    // BusyBox killall matches process name (python3) not cmdline, and
    // pkill isn't on this image, so we go through ps | awk | kill.
    await handler.execShell(
      "ps -ef | awk '/voice_stream\\.py/ && !/awk/ {print $1}' | xargs -r kill -9 2>/dev/null; true",
    )
    await sleep(500)
    await handler.execShell("cd /root && python3 scripts/voice_stream.py &")
    // Daemon binds with up to ~10 retry-with-1s delays on its side, so
    // 1 s before opening the relay is usually enough. Real fallback is
    // tcpRelay() itself — the open command surfaces a meaningful error
    // if voice_stream isn't listening yet.
    await sleep(1500)

    let retry = 8
    while (retry-- > 0) {
      try {
        relay = await handler.tcpRelay(5000, {
          onData: processChunk,
          onClose: () => { status.value = "disconnected" },
        })
        break
      } catch (e) {
        console.log("tcp_relay open retry:", retry, e?.message)
        await sleep(1000)
      }
    }
    if (!relay) {
      status.value = "error"
      return
    }
    status.value = "ready"
  } catch (e) {
    console.log(e)
    status.value = "error"
  }
}

const listen = async () => {
  if (!relay) return
  clearCanvas()
  status.value = "listening"
  const th = threshold.value || 128
  const sec = workspaceStore.extension.options.durations.value || 3
  barWidth = (RATE / SAMPLES_PER_FRAME * sec)
  relay.send(`#start,${th},${sec}\n`)
}

const onFinish = async () => {
  try {
    const [wav, wavform, mfccBlob] = await Promise.all([
      boardStore.readFile("/root/kbvoice.wav"),
      boardStore.readFile("/root/waveform.png"),
      boardStore.readFile("/root/mfcc.png"),
    ])
    if (!wav || !wavform || !mfccBlob) {
      throw new Error("missing recording artifact on board")
    }
    clearCanvas()
    emits("recorded", {
      sound:    wav,
      mfcc:     mfccBlob,
      preview:  wavform,
      duration: workspaceStore.extension.options.durations.value || 3,
    })
  } catch (e) {
    console.error("pull recording artifacts failed:", e)
  } finally {
    status.value = "ready"
  }
}

const stop = async () => {
  if (!relay) return
  status.value = "ready"
  relay.send("#stop\n")
}

const assignCanvas = () => {
  canvas.value = document.getElementById("waveform-client")
  canvasCtx.value = canvas.value.getContext("2d")

  uvMeter.value = document.getElementById("uv-meter")
  uvMeter.value.width = 20
  uvMeter.value.height = 250
  uvMeterCtx.value = uvMeter.value.getContext("2d")

  waveform.value = document.getElementById("waveform-client")
  waveformCtx.value = waveform.value.getContext("2d")
  waveform.value.width = waveform.value.clientWidth
  waveform.value.height = waveform.value.clientHeight

  mfcc.value = document.getElementById("mfcc-client")
  mfcc.value.width = 224
  mfcc.value.height = 224
  mfccCtx.value = mfcc.value.getContext("2d")
}

onMounted(async () => {
  assignCanvas()
  if (boardStore.connected) {
    await init()
  }
  window.addEventListener("resize", () => {
    waveform.value.width = waveform.value.clientWidth
    waveform.value.height = waveform.value.clientHeight
    uvMeter.value.width = uvMeter.value.clientWidth
    uvMeter.value.height = uvMeter.value.clientHeight
  })
})

onBeforeMount(() => {
  status.value = "disconnected"
})

onUnmounted(() => {
  try { relay?.close() } catch (e) { /* ws may be gone */ }
  relay = null
  // Best-effort cleanup of the daemon. ws_shell.py also drops the
  // relay on socket close, but the python process keeps running until
  // we explicitly stop it; that's wasted RAM for the next session.
  boardStore.handler?.execShell?.(
    "ps -ef | awk '/voice_stream\\.py/ && !/awk/ {print $1}' | xargs -r kill -9 2>/dev/null; true",
  )
  status.value = "disconnected"
})

defineExpose({ init, listen, stop, clearCanvas })
</script>

<template>
  <div class="recorder-container d-flex align-items-center">
    <div
      v-if="recording"
      class="recorder-container-active"
    />
    <p
      v-if="counting > 0"
      class="counting-timer-p"
    >
      {{ counting }}
    </p>
    <div class="voice-meter">
      <canvas
        v-show="status == 'listening'"
        id="uv-meter"
        width="20"
        height="250"
      />
    </div>
    <div class="full">
      <canvas
        id="waveform-client"
        style="width: 100%; height: 250px;"
      />
      <canvas
        id="mfcc-client"
        width="224"
        height="224"
        style="display:none;"
      />
    </div>
    <div class="recorder-wrap">
      <VMenu
        :close-on-content-click="false"
        location="bottom"
      >
        <template #activator="{props}">
          <VBtn
            class="me-3"
            icon="mdi-cog"
            v-bind="props"
          />
        </template>
        <VList>
          <VListItem>
            <VListItemTitle>Setting Threshold</VListItemTitle>
            <VListItem>
              <VSlider
                v-model="threshold"
                min="1"
                max="255"
                step="1"
              />
            </VListItem>
          </VListItem>
        </VList>
      </VMenu>
      <div class="time-counter">
        <span class="current-time">{{
          timeCurrent ? timeCurrent + ":00": "0:00"
        }}</span><span>/ {{ workspaceStore.extension.options.durations.value }}:00</span>
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
