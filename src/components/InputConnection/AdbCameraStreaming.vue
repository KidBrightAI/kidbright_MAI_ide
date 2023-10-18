<script setup>
import { onMounted, onBeforeUnmount, ref, computed, defineEmits } from "vue";
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

import { useBoardStore } from "@/store/board";

const emit = defineEmits(["started", "stoped"]);

const boardStore = useBoardStore();
const status = ref("disconnected");

async function* Decoder(readableStream){
  const reader = readableStream.getReader();
  let partialData = new Uint8Array(0);
  
  const delimter = new TextEncoder().encode("\r\nContent-Type: image/jpeg\r\n\r\n");

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const videoData = new Uint8Array(partialData.length + value.length);
    videoData.set(partialData, 0);
    videoData.set(value, partialData.length);
    partialData = videoData;

    let frameStartIndex = 0;
    let frameEndIndex = indexOfSubarray(partialData, delimter);

    while (frameEndIndex !== -1) {
      const frameData = partialData.subarray(frameStartIndex, frameEndIndex);

      yield frameData;

      frameStartIndex = frameEndIndex + delimter.length;
      frameEndIndex = partialData.indexOf(delimter, frameStartIndex);

      partialData = partialData.subarray(frameStartIndex);
    }
      
  }
}

const indexOfSubarray = (mainArray, subArray) => {
  const mainLength = mainArray.length;
  const subLength = subArray.length;

  for (let i = 0; i <= mainLength - subLength; i++) {
    let found = true;

    for (let j = 0; j < subLength; j++) {
      if (mainArray[i + j] !== subArray[j]) {
        found = false;
        break;
      }
    }

    if (found) {
      return i;
    }
  }

  return -1;
}

const start = async () => {
  console.log("start streaming");
  console.log("wait for shell ready");
  status.value = "connecting";
  //await sleep(1000);
  try{
    await SingletonShell.waitWriter();
    console.log("shell ready");
    const shell = SingletonShell.getInstance();
    const adb = shell.getAdb();
    //send ctrl + c
    SingletonShell.write("\x03\n");
    SingletonShell.write("killall python3\n");
    await sleep(1000);
    SingletonShell.write("python3 /usr/lib/python3.8/site-packages/maix/mjpg.pyc &\n");
    console.log("create socket");
    let sock = null;
    let retry = 15;
    while (retry--) {
      try {
        sock = await adb.createSocket("tcp:18811");
        break;
      } catch (e) {
        console.log(e);
        await sleep(1000);
      }
    }
    //let sock = await adb.createSocket("tcp:18811");
    let reqText = "GET / HTTP/1.1\r\nHost: localhost:18811\r\n\r\n";
    let writer = sock.writable.getWriter();
    writer.write(new Consumable(encodeUtf8(reqText)));
    status.value = "streaming";
    emit("started");
    const decoder = Decoder(sock.readable);
    for await (const frame of decoder) {
      drawImage(frame);
    }
  }catch(e){
    console.log(e);
  }
};

const drawImage = (data, canvas) => {
  const blob = new Blob([data], { type: "image/jpeg" });
  const img = document.getElementById("cont");
  const reader = new FileReader();
  reader.onload = function () {
    const dataurl = reader.result;
    img.src = dataurl;
  };

  reader.readAsDataURL(blob);
};
const canvasToBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    },"image/jpeg", 0.8);
  });
};
const capture = async (width = 240, height = 240) => {
  const img = document.getElementById("cont");
  const canvas = document.createElement("canvas");
  // resize image to 224x224
  canvas.width = width;
  canvas.height = height;
  console.log("canvas size", canvas.width, canvas.height);
  console.log("image width", img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, width, height);
  const data = await canvasToBlob(canvas);
  return {
    image: data,
    width: width,
    height: height
  };
}
onMounted(async () => {
  status.value = "disconnected";
  if(boardStore.connected){
    await start();
  }
});

onBeforeUnmount(() => {
  console.log("stop streaming");
  SingletonShell.write("killall python3\n");
  status.value = "disconnected";
  emit("stoped");
});

watch(
  () => boardStore.connected,
  async (connected) => {
    if (connected) {
      //device connected start streaming
      await start();
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
  <img v-else id="cont" style="width: 100%; height: 100%;"/>
</template>
