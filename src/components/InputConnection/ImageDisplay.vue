<template>
  <img
    v-if="props.id != undefined"
    crossorigin="anonymous"
    style="height: calc(100vh - 190px);"
    :src="`${datasetStore.baseURL}/${props.id}.${datasetStore.getExt(props.id)}`"
    ref="img"
  />
</template>
<script setup>
import { useDatasetStore } from "@/store/dataset";
const datasetStore = useDatasetStore();

const img = ref({});

const props = defineProps({
  id: {
    type: String,
    default: null
  }
});

const getImage = () => {
  if(img.value.$el){
    return img.value.$el;
  }
};

const getActualSize = () => {
  return new Promise((resolve,reject)=>{
    let img = new Image();
    img.onload = ()=>{
      let ratio = img.naturalWidth/img.naturalHeight;
      let width = $refs.img.height*ratio;
      let height = $refs.img.height;
      if (width > $refs.img.width) {
        width = $refs.img.width;
        height = $refs.img.width/ratio;
      }
      resolve([width, height,img.naturalWidth, img.naturalHeight]);
    };
    img.src = `${datasetStore.baseURL}/${props.id}.${datasetStore.getExt(props.id)}`;
  });  
};
</script>
