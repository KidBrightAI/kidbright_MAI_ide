<template>
  <div
    ref="drawPanel"
    class="draw-panel unselect"
    @mousedown="startDrawNewCrop"
  >
    <div :class="{'crop-container': true, unselect: true, 'cursor-crosshair': disabled? false: true}">
      <vue-crop-rect 
        v-for="rect in rects"
        :key="rect.id"
        :initRect="rect" 
        @remove="remove(rect.id)"
        @changed="onRectUpdate"
      >
      {{ rect.label  }}, {{ rect.x1 }}, {{ rect.y1 }}, {{ rect.x2 }}, {{ rect.y2 }}
      </vue-crop-rect>
      <vue-crop-rect :initRect="rect" :showRect="onCreateNew"></vue-crop-rect>
    </div>
  </div>
</template>
<script setup>
import { useDatasetStore } from '@/store/dataset';
import { useWorkspaceStore } from '@/store/workspace';
import VueCropRect from './VueCropRect.vue';
import { nextTick, toRaw } from 'vue';
import { getColorIndex, addAlpha, randomId } from "../utils";

const datasetStore = useDatasetStore();
const workspaceStore = useWorkspaceStore();

const props = defineProps({
  disabled: {
    type: Boolean,
    default: true
  },
  showRect: {
    type: Boolean,
    default: true
  },
  label: {
    type: String,
    default: "",
    required: true,
  },
  dimension:{
    type: Array,
    default: [0,0,0,0]
  },
  id: {
    type: String,
    default: ""
  },
});

const emit = defineEmits(['changed']);
const rect = ref({
  x1:-1,
  y1:-1,
  x2:-1,
  y2:-1,
  color: "#000",
  label: "",
});
const rects = ref([]);
const onCreateNew = ref(false);
const drawPanel = ref({});

const innerMaxHeight = computed(()=>{
  return drawPanel.value.offsetHeight;
});
const innerMaxWidth = computed(()=>{
  return drawPanel.value.offsetWidth;
});
const getCurrentAnnotation = computed(()=>{
  return datasetStore.getAnnotateById(props.id);
});
const colorByLabel = (label)=>{
  let colorIndex = workspaceStore.labels.findIndex(el=>el.label == label);
  colorIndex = colorIndex < 0 ? 0 : colorIndex;
  let color = addAlpha(getColorIndex(colorIndex), 0.5);
  return color;
};
const startDrawNewCrop = (e)=>{
  if (props.disabled) {
    return;
  }
  onCreateNew.value = true;
  window.document.addEventListener('mousemove', doDrag);
  let rectTemp = drawPanel.value.getBoundingClientRect();
  let targetRect = e.target.getBoundingClientRect();
  let pointX = e.offsetX - rectTemp.left + targetRect.left;
  let pointY = e.offsetY - rectTemp.top + targetRect.top;
  rect.value.x1 = pointX;
  rect.value.y1 = pointY;
  rect.value.x2 = pointX;
  rect.value.y2 = pointY;
  rect.value.label = props.label;
  rect.value.color = colorByLabel(props.label);
};
const doDrag = (e)=>{
  if (e.movementX === 0 && e.movementY === 0) {
    return;
  }
  let x2 = rect.value.x2 + e.movementX;
  let y2 = rect.value.y2 + e.movementY;
  
  rect.value.x2 = x2 > innerMaxWidth.value ? innerMaxWidth.value : (x2 < 0 ? 0: x2);
  rect.value.y2 = y2 > innerMaxHeight.value ? innerMaxHeight.value : (y2 < 0 ? 0 : y2);
};
const remove = (id)=>{
  rects.value = rects.value.filter(el=>el.id !== id);
  datasetStore.removeAnnotation({annotationId : id, id : props.id});
};
const onRectUpdate = (rect)=>{
  saveRect(rect);
};
const saveRect = (rect)=>{
  let r = JSON.parse(JSON.stringify(rect));
  let actualRect = exportRect(r,props.dimension);
  datasetStore.addOrUpdateAnnotation({annotation : actualRect, id: props.id});
};
const loadBboxFromDataset = (id)=>{
  nextTick(()=>{
    let annotate = datasetStore.getAnnotateById(id);
    if(annotate){
      let rectsJ = JSON.parse(JSON.stringify(annotate));
      rectsJ = restoreRect(rectsJ, props.dimension);
      rects.value = rectsJ;
    }
  });
};
const exportRect = (rect,dimension)=>{
  let ratioW = dimension[2] / dimension[0]; //imgNatureSizeWidth / displayWidth 
  let ratioH = dimension[3] / dimension[1]; 
  rect.x1 = Math.floor(ratioW * rect.x1);
  rect.x2 = Math.floor(ratioW * rect.x2);
  rect.y1 = Math.floor(ratioH * rect.y1);
  rect.y2 = Math.floor(ratioH * rect.y2);
  return rect;
};
const restoreRect = (rects,dimension)=>{
  let ratioW = dimension[0] / dimension[2]; //displayWidth / imgNatureSizeWidth  
  let ratioH = dimension[1] / dimension[3]; 
  for(let i in rects){
    rects[i].x1 = Math.floor(ratioW * rects[i].x1);
    rects[i].x2 = Math.floor(ratioW * rects[i].x2);
    rects[i].y1 = Math.floor(ratioH * rects[i].y1);
    rects[i].y2 = Math.floor(ratioH * rects[i].y2);
    rects[i].color = colorByLabel(rects[i].label);
  }
  return rects;
};

const leaveOrUp = () => {
  window.document.removeEventListener('mousemove', doDrag);
  if(onCreateNew.value){
    let x1 = (rect.value.x2 < rect.value.x1)? rect.value.x2 : rect.value.x1;
    let x2 = (rect.value.x1 > rect.value.x2)? rect.value.x1 : rect.value.x2;
    let y1 = (rect.value.y2 < rect.value.y1)? rect.value.y2 : rect.value.y1;
    let y2 = (rect.value.y1 > rect.value.y2)? rect.value.y1 : rect.value.y2;
    let color = colorByLabel(props.label);
    let newRect = Object.assign({
      label : props.label,
      id : randomId(16),
      color : color,
    }, rect.value);
    newRect.id = randomId(16);
    rects.value.push(newRect);
    onCreateNew.value = false;
    emit("changed",newRect);
    saveRect({
      x1 : x1,
      y1 : y1,
      x2 : x2,
      y2 : y2,
      label : props.label,
      id : newRect.id
    });
  }
};

onMounted(()=>{
  window.document.addEventListener('mouseup', leaveOrUp);
  window.document.addEventListener('mouseleave', leaveOrUp);
})
watch(getCurrentAnnotation, async (newRects, oldVal) => {
  if(!newRects){
    rects.value = [];
    return;
  }
  if(newRects && newRects.length != rects.value.length && props.id && props.dimension[2] > 0 && props.dimension[3] > 0){
    loadBboxFromDataset(props.id);
  }
});

defineExpose({
  rects,
  getCurrentAnnotation,
  exportRect,
  restoreRect,
  loadBboxFromDataset,
  saveRect,
  remove,
  onRectUpdate,
  startDrawNewCrop,
  doDrag,
  onCreateNew,
  innerMaxHeight,
  innerMaxWidth,
  getCurrentAnnotation,
  colorByLabel,
  rect,
  emit,
});
</script>
<style scoped>
.draw-panel {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  position: absolute;
}

.crop-container {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.rect-box{
  width: 100%;
  height: 100%;
}
.cursor-crosshair {
  cursor: crosshair;
}
</style>
