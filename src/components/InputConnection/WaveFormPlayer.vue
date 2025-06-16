<script setup>
import { useDatasetStore } from "@/store/dataset";

const datasetStore = useDatasetStore();
const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  img_ext: {
    type: String,
    default: "png",
  },
  sound_ext: {
    type: String,
    default: "wav",
  },
  delay: {
    type: Number,
    default: 0,
  },
  volume: {
    type: Number,
    default: 1,
  },

});

const emits = defineEmits(["onPlay", "onEnd"]);

const playing = ref(false);
const imgRef = ref(null);
const playSound = async (url)=>{
  const audio = new Audio(url);
  audio.volume = props.volume;
  audio.play();
  return new Promise((resolve)=>{
    audio.onended = ()=>{
      resolve();
    };
  });
};

const play = async()=>{
  let target = imgRef.value;
  if(!target) return;
  target.classList.add("playing-overlay");
  playing.value = true;
  emits("onPlay", props.id);
  target.style.transitionDuration = `${props.delay}s`;
  target.style.width = "100%";
  await playSound(`${datasetStore.baseURL}/${props.id}.${props.sound_ext}`);
  target.style.width = "0%";
  target.style.transitionDuration = "0s";
  target.classList.remove("playing-overlay");
  playing.value = false;
  emits("onEnd", props.id);
};

defineExpose({
  play,
  id: props.id,
});
</script>
<template>
  <div class="waveform">
    <div class="full">
      <img class="thumb" :src="`${datasetStore.baseURL}/${id}.${img_ext}`" alt="" srcset=""></img>
      <div class="playing-overlay" ref="imgRef"></div>
    </div>
    <img v-if="!playing" src="@/assets/images/png/play3.png" height="34" class="op-btn ps-3" @click.stop="play"/>
    <img v-else src="@/assets/images/png/pause2.png" height="34" class="op-btn-disable ps-3"/>
  </div>
</template>

<style lang="scss" scoped>
  .waveform{
    width: 100%;
    height: 100%;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    .full{
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 25px;
      overflow: hidden;
      .playing-overlay {
        position: absolute;
        top: 0px;
        left: -2px;
        width: 0%;
        height: 100%;
        border-right-color: red;
        border-right-style: solid;
        border-right-width: 2px;
        background-color: #66000066;
        overflow: hidden;
        transition: width 3s linear;
      }
      .thumb{
        width: 100%;
        height: 100%;
        object-fit: fill;
        image-rendering: -webkit-optimize-contrast;
      }
    }
    
  }
    
.op-btn-disable{
    pointer-events: none;  
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
  }
</style>