<template>
  <video
    ref="video"
    :src="source"
    :autoplay="autoplay"
    :playsinline="playsinline"
  />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  autoplay: {
    type: Boolean,
    default: true
  },
  screenshotFormat: {
    type: String,
    default: "image/jpeg"
  },
  selectFirstDevice: {
    type: Boolean,
    default: false
  },
  deviceId: {
    type: String,
    default: null
  },
  playsinline: {
    type: Boolean,
    default: true
  },
  resolution: {
    type: Object,
    default: null,
    validator: value => {
      return value.height && value.width;
    }
  }
});

const emit = defineEmits([
  "started",
  "stopped",
  "error",
  "notsupported",
  "camera-change",
  "video-live",
  "cameras"
]);

const video = ref({});
const source = ref(null);
const camerasListEmitted = ref(false);
const cameras = ref([]);

const legacyGetUserMediaSupport = () => {
  return constraints => {
    let getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      navigator.oGetUserMedia;

    if (!getUserMedia) {
      return Promise.reject(
        new Error("getUserMedia is not implemented in this browser")
      );
    }

    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  };
};

const setupMedia = () => {
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = legacyGetUserMediaSupport();
  }

  testMediaAccess();
};

const loadCameras = () => {
  navigator.mediaDevices
    .enumerateDevices()
    .then(deviceInfos => {
      for (let i = 0; i !== deviceInfos.length; ++i) {
        let deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === "videoinput") {
          cameras.value.push(deviceInfo);
        }
      }
    })
    .then(() => {
      if (!camerasListEmitted.value) {
        if (props.selectFirstDevice && cameras.value.length > 0) {
          props.deviceId = cameras.value[0].deviceId;
        }

        emit("cameras", cameras.value);
        camerasListEmitted.value = true;
      }
    })
    .catch(error => emit("notsupported", error));
};

const changeCamera = (deviceId) => {
  stop();
  emit("camera-change", deviceId);
  loadCamera(deviceId);
};

const loadSrcStream = (stream) => {
  if ("srcObject" in video.value) {
    video.value.srcObject = stream;
  } else {
    source.value = window.HTMLMediaElement.srcObject(stream);
  }

  video.value.onloadedmetadata = () => {
    emit("video-live", stream);
  };

  emit("started", stream);
};

const stopStreamedVideo = (videoElem) => {
  let stream = videoElem.srcObject;
  let tracks = stream.getTracks();

  tracks.forEach(track => {
    track.stop();
    emit("stopped", stream);

    video.value.srcObject = null;
    source.value = null;
  });
};

const stop = () => {
  if (video.value !== null && video.value.srcObject) {
    stopStreamedVideo(video.value);
  }
};

const start = () => {
  if (props.deviceId) {
    loadCamera(props.deviceId);
  }
};

const pause = () => {
  if (video.value !== null && video.value.srcObject) {
    video.value.pause();
  }
};

const resume = () => {
  if (video.value !== null && video.value.srcObject) {
    video.value.play();
  }
};

const testMediaAccess = () => {
  let constraints = { video: true };

  if (props.resolution) {
    constraints.video = {};
    constraints.video.height = props.resolution.height;
    constraints.video.width = props.resolution.width;
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      let tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      loadCameras();
    })
    .catch(error => emit("error", error));
};

const loadCamera = (device) => {
  let constraints = { video: { deviceId: { exact: device } } };

  if (props.resolution) {
    constraints.video.height = props.resolution.height;
    constraints.video.width = props.resolution.width;
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => loadSrcStream(stream))
    .catch(error => emit("error", error));
};

const canvasToBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    },"image/jpeg", 0.8);
  });
};

const capture = async () => {
  let {canvas, width, height } = getCanvas();
  return {
    image: await canvasToBlob(canvas),
    width: width,
    height: height
  };
};

const getCanvas = () => {
  let canvasElem = document.createElement("canvas");
  canvasElem.height = video.value.videoHeight;
  canvasElem.width = video.value.videoWidth;
  const ctx = canvasElem.getContext("2d");
  ctx.drawImage(video.value, 0, 0, canvasElem.width, canvasElem.height);
  return {
    canvas: canvasElem,
    width: canvasElem.width,
    height: canvasElem.height
  };
};

watch(() => props.deviceId, (id) => {
  changeCamera(id);
});

onMounted(() => {
  setupMedia();
});

onBeforeUnmount(() => {
  stop();
});
defineExpose({
  capture,
  pause,
  resume,
  stop,
  start,
  changeCamera,
  loadCamera,
  loadCameras,
  testMediaAccess,
  getCanvas
});
</script>
<style scoped>
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
