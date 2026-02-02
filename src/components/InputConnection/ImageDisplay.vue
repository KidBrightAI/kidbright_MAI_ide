<template>
  <img
    v-if="props.id != undefined"
    ref="img"
    crossorigin="anonymous"
    :style="{ maxHeight: props.height, width: '100%', objectFit: 'contain' }"
    class="img-fluid"
    :src="`${datasetStore.baseURL}/${props.id}.${datasetStore.getExt(props.id)}`"
  >
</template>

<script setup>
import { useDatasetStore } from "@/store/dataset"
const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  height : {
    type: [Number, String],
    default: "calc(100vh - 190px)",
  },
})

const datasetStore = useDatasetStore()

const img = ref({})

const getImage = () => {
  if(img.value.$el){
    return img.value.$el
  }
}

const getActualSize = () => {
  return new Promise((resolve,reject)=>{
    let imgSrc = new Image()
    imgSrc.onload = ()=>{
      let ratio = imgSrc.naturalWidth/imgSrc.naturalHeight
      let width = img.value.height*ratio
      let height = img.value.height
      if (width > img.value.width) {
        width = img.value.width
        height = img.value.width/ratio
      }
      resolve([width, height,imgSrc.naturalWidth, imgSrc.naturalHeight])
    }
    imgSrc.src = `${datasetStore.baseURL}/${props.id}.${datasetStore.getExt(props.id)}`
  })  
}

defineExpose({
  getImage,
  getActualSize,
})
</script>
