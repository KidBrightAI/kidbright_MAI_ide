<script setup>
/**
 * Compact board-connection widget for capture side panels.
 * Image Classification / Object Detection don't *need* the board to
 * snap (the camera is the laptop webcam) — the board only matters
 * for the "import from board" flow and any future on-device
 * capture. This widget makes the connection state visible and
 * one-clickable from the same surface where the import button
 * lives, matching the affordance Voice Classification already has.
 *
 * Auto-connect on mount mirrors Voice Classification's behavior so
 * all three capture pages feel the same. V2 (wss) opens silently;
 * V1 (web-adb) succeeds quietly when the WebUSB permission was
 * already granted in a prior session and falls back to button-driven
 * connect on first-time use (where requestDevice needs a user
 * gesture). The try/catch swallows that gesture-required error so
 * the page mount stays clean.
 *
 * Voice has its own inline version because its "Connected" badge
 * also gates on recorder daemon state — the extra coupling makes it
 * not worth extracting.
 *
 * V2-specific reboot hint: a CVITEK firmware bug in the on-board
 * MJPEG server (kill launcher + reopen camera per HTTP request)
 * leaks VPSS video-buffer pools, and after enough fast page-switch
 * cycles the next launcher start fails with "open display failed"
 * on the LCD. We can't fix it from the IDE without hacking the
 * launcher's lifecycle, so the widget surfaces a one-line nudge
 * pointing the student at the reboot they'd otherwise have to be
 * told over chat. README has the full explanation.
 */

import { useBoardStore } from "@/store/board"
import { useWorkspaceStore } from "@/store/workspace"

const boardStore = useBoardStore()
const workspaceStore = useWorkspaceStore()
const connecting = ref(false)

const isV2 = computed(
  () => workspaceStore.currentBoard?.protocol === "websocket-shell",
)

const connect = async () => {
  connecting.value = true
  try {
    await boardStore.deviceConnect()
  } catch (e) {
    // V1 requestDevice() throws when called outside a user gesture
    // (auto-connect path). User can still click the button to get a
    // proper popup; surface a console warning for debugging.
    console.warn("Board connect failed:", e?.message || e)
  } finally {
    connecting.value = false
  }
}

onMounted(() => {
  if (!boardStore.connected) connect()
})
</script>

<template>
  <div class="board-status-wrap">
    <div class="d-flex align-center justify-center pa-2">
      <div
        v-if="boardStore.connected"
        class="d-flex align-center ga-2"
      >
        <VIcon
          icon="mdi-check-circle"
          color="success"
          size="20"
        />
        <span class="text-success font-weight-bold text-body-2">
          Board Connected
        </span>
      </div>
      <div
        v-else-if="connecting"
        class="d-flex align-center ga-2"
      >
        <VProgressCircular
          indeterminate
          size="18"
          width="2"
          color="primary"
        />
        <span class="text-body-2">Connecting...</span>
      </div>
      <VBtn
        v-else
        color="primary"
        variant="outlined"
        size="small"
        block
        prepend-icon="mdi-usb"
        @click="connect"
      >
        Connect Board
      </VBtn>
    </div>
    <div
      v-if="isV2"
      class="reboot-hint d-flex align-start ga-1 px-2 pb-1"
    >
      <VIcon
        size="12"
        color="grey-darken-1"
        class="hint-icon"
      >
        mdi-information-outline
      </VIcon>
      <span class="text-caption text-grey-darken-1">
        หากปรากฏข้อความ "open display failed" บนหน้าจอบอร์ด กรุณารีสตาร์ทบอร์ด
      </span>
    </div>
  </div>
</template>

<style scoped>
.board-status-wrap {
  width: 100%;
}
.reboot-hint {
  line-height: 1.3;
}
.hint-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
</style>
