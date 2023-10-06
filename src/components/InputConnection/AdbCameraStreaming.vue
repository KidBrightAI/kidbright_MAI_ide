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

import { useBoardStore } from "@/store/board";

const boardStore = useBoardStore();

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
  const shell = SingletonShell.getInstance();
  const adb = shell.getAdb();

  SingletonShell.write("killall python3\n");
  SingletonShell.write("python3 /usr/lib/python3.8/site-packages/maix/mjpg.pyc &\n");
  await sleep(5000);
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

  const decoder = Decoder(sock.readable);
  for await (const frame of decoder) {
    drawImage(frame);
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

onMounted(async () => {
  if(await boardStore.deviceConnect()){
    return;
  }
  await sleep(1000);
  await start();
});

onBeforeUnmount(() => {
  console.log("stop streaming");
  SingletonShell.write("killall python3\n");
});
</script>
<template>
  <img id="cont" style="width: 100%; height: 100%;"/>
</template>
