<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-center justify-center view-panel">
          <ImageDisplay v-show="current.length" :id="current.slice(-1).pop()" ref="img"></ImageDisplay>
          <div class="cropbox_container" :style="{width: cropboxSize[0] + 'px', height: cropboxSize[1]+'px'}">
            <VueCrop
              :disabled="!(cropboxSize[2] > 0 && cropboxSize[3] > 0 && currentLabel)"
              :id="current.slice(-1).pop()"
              :allowStartNewCrop="true"
              :label="currentLabel"
              :dimension="cropboxSize"
              ref="cropbox"
            >
            </VueCrop>
          </div>
          <p class="view-img-desc" v-if="!current.length">
            No selected image, please click on the image below to select.
          </p>
        </div>
        <ImageDatasetList v-model="current" :multiple="true" :showInfo="true"></ImageDatasetList>
      </div>
      <div class="side-panel">
        <div class="w-100">
          <h4 class="side-panel-ttl">LABEL</h4>
          <div class="feature-wrap">
            <VBtn block rounded="xl">
              <VDialog
                v-model="onLabelInputDialog"
                activator="parent"
                width="500px"
              >
                <v-card>
                  <v-toolbar density="compact">
                    <v-toolbar-title>เพิ่มป้ายกำกับใหม่</v-toolbar-title>
                    <v-spacer/> 
                    <v-btn icon @click="onLabelInputDialog = false" density="compact">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-card-text>
                    <v-text-field
                      v-model="labelName"
                      label="ตั้งชื่อป้ายกำกับ"
                      outlined
                    ></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="onNewLabel" variant="elevated" :disabled="!labelName.length">เพิ่มป้ายกำกับ</v-btn>
                  </v-card-actions>
                </v-card>
              </VDialog>
              <VIcon>mdi-plus</VIcon> New label
            </VBtn>
            <div class="pills w-100">
              <button class="rounded-xl w-100 bg-secondary px-3 py-1 my-1" @click="selectLabel(cls.label)" v-for="(cls, index) in workspaceStore.labels">
                <div class="d-flex align-center justify-space-between w-100">
                  <div class="annotation-label-color" :style="{backgroundColor: getColorIndex(index)}"></div>
                  {{ cls.label }}
                  <div>
                    <v-btn density="compact" icon="mdi-rotate-left" variant="text" color="white" @click.stop="()=> {changeLabelName = cls.label, onLabelChangeDialog = true}">
                    </v-btn>
                    <v-btn density="compact" icon="mdi-trash-can" variant="text" color="white" @click.stop="onRemoveLabel(cls.label)"></v-btn>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <h4 class="side-panel-ttl">ANNOTATE</h4>
          <div class="feature-wrap">
            <div class="annotate-cn-list w-100">
              <div
                class="annotate-cn active"
                v-for="(item, idx) in datasetStore.getAnnotateByIds(current)"
                :key="'class-' + idx"
              >
                <div class="annotate-cn-list-ttl">
                  <img src="@/assets/images/png/Group_177_white.svg"/>
                  {{ item.label }}
                </div>
                <div class="annotate-cn-list-content">
                  <div class="d-flex flex-fill flex-column justify-content-between text-right">
                    <div class="annotation-txt">X:{{ item.x1 }},Y:{{ item.y1 }}</div>
                    <div class="annotation-txt">X:{{ item.x1 }},Y:{{ item.y2 }}</div>
                  </div>
                  <img src="@/assets/images/png/interface-1.png" width="60" class="ml-1 mr-1"/>
                  <div class="d-flex flex-fill flex-column justify-content-between text-left">
                    <div class="annotation-txt">  X:{{ item.x2 }},Y:{{ item.y1 }} </div>
                    <div class="annotation-txt">  X:{{ item.x2 }},Y:{{ item.y2 }} </div>
                  </div>
                </div>
                <img
                  class="cancel-btn op-btn"
                  src="@/assets/images/png/cancel.png"
                  height="24"
                  @click="onRemoveAnnotatedLabel(item.id)"
                />
              </div>
            </div>
          </div>
          <DatasetCounter class="second-counter" prefix="Labeled" seperator="of" :current="datasetStore.getLabeledLength" suffix="Image"></DatasetCounter>
          <DatasetCounter prefix="Selected" seperator="of" :current="current.length" suffix="Image"></DatasetCounter>
        </div>
        <div class="w-100"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDatasetStore } from '@/store/dataset';
import { useWorkspaceStore } from '@/store/workspace';

import ImageDisplay from '@/components/InputConnection/ImageDisplay.vue';
import ImageDatasetList from "@/components/InputConnection/ImageDatasetList.vue";
import DatasetCounter from '@/components/InputConnection/DatasetCounter.vue';
import VueCrop from "@/components/Tools/VueCrop.vue";
import { watch, nextTick } from 'vue';
import { getColorIndex } from '@/components/utils';
const datasetStore = useDatasetStore();
const workspaceStore = useWorkspaceStore();

const currentLabel = ref("");
const current = ref([]);
const cropboxSize = ref([0,0]);
const img = ref({});
const cropbox = ref({});

const onLabelInputDialog = ref(false);
const onLabelChangeDialog = ref(false);
const labelName = ref("");
const changeLabelName = ref("");
const tobeChangeLabel = ref("");

const onNewLabel = async() => {
  workspaceStore.addLabel({label : labelName.value});
  onLabelInputDialog.value = false;
  labelName.value = "";
};

const selectLabel = (label) => {
  currentLabel.value = label;
}

const onRemoveLabel = async(name) => {
  let confirm = await this.$dialog.confirm({ text: `หากลบ '${name}' ภาพที่ใช้ป้ายกำกับนี้จะถูกล้างค่า`, title : "ยืนยันการลบป้ายกำกับ"});
  if(confirm){
    this.removeDataAnnotation(name);
    this.removeLabel(name);
  }
};

const onChangeLabel = async (name)=> {
  let label = await this.$dialog.prompt({ text: `ชื่อป้ายกำกับจาก '${name}' เป็น`, title: 'เปลี่ยนชื่อป้ายกำกับใหม่' });
  if(label){
      this.changeDataAnnotation( { oldLabel : name, newLabel : label});
      this.changeLabel({ oldLabel : name, newLabel : label});
      this.processBbox();
  }
};

const onRemoveAnnotatedLabel = async (id) => {
  datasetStore.removeDataAnnotationWhere({ ids: current.value, annotationId : id });
};

const processBbox = async ()=>{
  if(img.value){
    let actualSize = await img.value.getActualSize();
    cropboxSize.value = actualSize;
    if(cropbox.value){
      cropbox.value.loadBboxFromDataset(current.value.slice(-1).pop());
    }
  }
};

watch(current, async (val, oldVal) => {
  
  // this.$nextTick(async ()=>{
  //   await this.processBbox();
  // });
  //next tick in vue3
  await nextTick();
  await processBbox();
});
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
.annotation-label-color{
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
}
.cropbox_container{
  display: block;
  position: absolute;
}
.second-counter{
  margin-bottom: 50px;
}
.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
}
.pills {
  overflow-y: auto;
  padding: 4px;
}
.annotate-cn-list {
  overflow-y: auto;
}
.annotate-cn {
  text-align: left;
  background-color: #ddd;
  border-radius: 23px;
  position: relative;
  margin-bottom: 10px;
  opacity: 0.7;
  border: 5px solid #aaa;
  cursor: pointer;
  transition: opacity 0.3s ease-in;
  overflow: hidden;
  .annotate-cn-list-ttl {
    background-color: #aaa;
    padding: 5px 32px 5px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    img {
      width: 30px;
      height: 30px;
      // &:last-child {
      //   display: none;
      // }
    }
  }
  .annotate-cn-list-content {
    display: flex;
    padding: 15px 10px;
  }
  .annotation-txt {
    color: $primary-color;
    font-size: 12px;
    font-weight: bold;
  }
  &:last-child {
    margin-bottom: 0;
  }
  &.active {
    border: 5px solid $primary-color;
    opacity: 1;
    .annotate-cn-list-ttl {
      background-color: $primary-color;
      color: #fff;
      img {
        &:first-child {
          display: none;
        }
        &:last-child {
          display: inline-block;
        }
      }
    }
  }
  &:hover {
    opacity: 1;
  }
}
.cancel-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
}
.right-group {
  position: absolute;
  right: 15px;
  top: 0;
  bottom: 0;
  display: flex;
  vertical-align: middle;
  align-items: center;
}
.added-label {
  position: relative;
  border-radius: 16px;
  text-align: left;
  background-color: #dddddd;
  border: 1px solid #ddd;
  margin-bottom: 8px;
  &.active {
    background-color: $primary-color;
    color: white;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.new-label {
  position: relative;
  border-radius: 16px;
  text-align: left;
  color: $primary-color;
  margin-bottom: 10px;
}
.side-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  overflow-y: auto;
  .side-panel-ttl {
    color: $primary-color;
    font-weight: bold;
    background: #cdcdcd;
    padding: 10px 20px;
    margin-bottom: 10px;
  }
  .feature-wrap {
    padding: 0 20px 10px;
  }
}
.outer-wrap {
  overflow: hidden;
}
.main-panel {
  width: calc(100% - 300px);
}
.view-panel {
  background-color: #333;
  position: relative;
  img {
    min-width: 50%;
    min-height: 50%;
    object-fit: contain;
  }
  .view-img-desc {
    color: #fff;
  }
}
</style>
