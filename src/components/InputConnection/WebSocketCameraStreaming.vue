<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useBoardStore } from "@/store/board";
import { useWorkspaceStore } from "@/store/workspace";
import { toast } from "vue3-toastify";
import { Command, packMessage } from "@/engine/helper";

const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();
const status = ref("disconnected");
const handler = ref(null);
const imageUrl = ref(null);

const start = async () => {
  console.log("start streaming");
  status.value = "connecting";

  handler.value = await boardStore.getHandler();
  handler.value.on('image', ({ type, data }) => {
    const blob = new Blob([data], { type: `image/${type}` });
    imageUrl.value = URL.createObjectURL(blob);
    status.value = "streaming";
  });

  handler.value.on('close', () => {
    status.value = "disconnected";
    imageUrl.value = null;
    handler.value = null;
  });

  const success = await handler.value.connect(workspaceStore.currentBoard);
  if (!success) {
    status.value = "disconnected";
    toast.error("ไม่สามารถเชื่อมต่อ WebSocket ได้");
  }
// //run script 
// from maix import camera
// cam = camera.Camera(640, 480)
// while 1:
//     img = cam.read()
//     print(img)
  let script = `
from maix import camera, display, app
cam = camera.Camera(512, 320)
disp = display.Display()
while not app.need_exit():
    img = cam.read()
    disp.show(img)
`;
  handler.value.socket.send(packMessage(Command.Run, script));

};

const stop = () => {
  if (handler.value) {
    handler.value.disconnect();
  }
};

const drawImage = (data) => {
  const blob = new Blob([data], { type: "image/jpeg" });
  const img = document.getElementById("cont");
  if (img) {
    const reader = new FileReader();
    reader.onload = function () {
      img.src = reader.result;
    };
    reader.readAsDataURL(blob);
  }
};

const canvasToBlob = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.8);
  });
};

const capture = async (width = 240, height = 240) => {
  const img = document.getElementById("cont");
  if (!img || !img.src) {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, width, height);
  const data = await canvasToBlob(canvas);
  return {
    image: data,
    width: width,
    height: height,
  };
};

onMounted(() => {
  if (boardStore.connected && workspaceStore.currentBoard.protocol === 'websocket') {
    start();
  }
});

onBeforeUnmount(() => {
  stop();
});

watch(
  () => boardStore.connected,
  (connected) => {
    if (workspaceStore.currentBoard.protocol !== 'websocket') return;
    if (connected) {
      start();
    } else {
      stop();
    }
  }
);

defineExpose({
  capture,
});
</script>
<template>
  <div v-if="status !=='streaming'" class="w-100 d-flex text-white align-center justify-center" style="height: 200px;">
    <span v-if="status == 'disconnected'">กรุณาเชื่อมต่ออุปกรณ์</span>
    <v-progress-circular
      v-if="status == 'connecting'"
      :width="7"
      size="64"
      color="green"
      indeterminate
    ></v-progress-circular>
  </div>
  <img v-else id="cont" :src="imageUrl" style="width: 100%; height: 100%;"/>
</template>
