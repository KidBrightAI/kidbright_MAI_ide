
<script setup>

import ImageDisplay from "@/components/InputConnection/ImageDisplay.vue";
import ImageDatasetList from "@/components/InputConnection/ImageDatasetList.vue";
import SoundDatasetList from "@/components/InputConnection/SoundDatasetList.vue";
import DatasetCounter from "@/components/InputConnection/DatasetCounter.vue";
import NewLabelDialog from "@/components/dialog/NewLabelDialog.vue";
import { useDatasetStore } from "@/store/dataset";
import { useWorkspaceStore } from "@/store/workspace";
import { useConfirm } from "@/components/comfirm-dialog";

const confirm = useConfirm();
const datasetStore = useDatasetStore();
const workspaceStore = useWorkspaceStore();

const current = ref([]);
const onLabelChangeDialog = ref(false);
const changeLabelName = ref("");
const tobeChangeLabel = ref("");

const onNewLabel = (label) => {
  workspaceStore.addLabel({label : label});  
};
const selecteLabel = (label) => {
  if (current.value.length) {
    datasetStore.setClass({ids: current.value, label : label});
  }
};
const onRemoveLabel = async(label) => {
  try{
    await confirm({ title: "ยืนยันการลบป้ายกำกับ", content: `หากลบ '${label}' ภาพที่ใช้ป้ายกำกับนี้จะถูกล้างค่า`, dialogProps: { width: 'auto' } });
    datasetStore.changeClassData({oldLabel : label, newLabel : null});
    workspaceStore.removeLabel(label);
  }catch(e){
    return;
  }
};
const onChangeLabel = (oldLabel) => {  
  datasetStore.changeClassData({oldLabel : oldLabel, newLabel : tobeChangeLabel.value});
  workspaceStore.changeLabel({oldLabel : oldLabel, newLabel : tobeChangeLabel.value});
  onLabelChangeDialog.value = false;
  tobeChangeLabel.value = "";
  changeLabelName.value = "";
};
const onRemoveAnnotatedLabel = (label) => {
  if (current.value.length) {
    datasetStore.changeClassDataWhere({ids: current.value, oldLabel : label, newLabel : null});
  }
};

</script>

<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-center justify-center view-panel">
          <ImageDisplay v-if="current.length" :id="current.slice(-1).pop()" :height="'250px'"></ImageDisplay>
          <p class="view-img-desc" v-if="!current.length">
            No selected image, please click on the image below to select.
          </p>
          <DatasetCounter class="second-counter" prefix="Labeled" seperator="of" :current="datasetStore.getLabeledLength" suffix="Image"></DatasetCounter>
          <DatasetCounter prefix="Selected" seperator="of" :current="current.length" suffix="Image"></DatasetCounter>
        </div>
        <SoundDatasetList v-model="current" :multiple="true" :showInfo="true"></SoundDatasetList>
      </div>
      <div class="side-panel">
        <div class="w-100">
          <h4 class="side-panel-ttl">LABEL</h4>
          <div class="feature-wrap">
            <VBtn block rounded="xl">
              <NewLabelDialog @newLabel="onNewLabel"></NewLabelDialog>
              <VIcon>mdi-plus</VIcon> New label
            </VBtn>
            <div class="pills w-100">
              <button class="rounded-xl w-100 bg-secondary px-3 py-1 my-1" @click="selecteLabel(cls.label)" v-for="(cls, index) in workspaceStore.labels">
                <div class="d-flex align-center justify-space-between w-100">
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
                class="annotate-cn"
                v-for="(item, idx) in datasetStore.getLabelByIds(current)"
                :key="'class-' + idx"
              >
                <div class="annotate-cn-list-content">
                  <img
                    class="tag"
                    src="@/assets/images/png/Group_177_green.svg"
                    height="24"
                  />
                  <span class="annotation-txt">{{ item }}</span>
                </div>
                <img
                  class="cancel-btn op-btn"
                  src="@/assets/images/png/cancel.png"
                  height="24"
                  @click="onRemoveAnnotatedLabel(item)"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="w-100"></div>
      </div>
    </div>
    <VDialog v-model="onLabelChangeDialog" width="500px">
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>แก้ไขป้ายกำกับ</v-toolbar-title>
          <v-spacer/> 
          <v-btn icon @click="onLabelChangeDialog = false" density="compact">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="tobeChangeLabel"
            :label="`เปลี่ยนชื่อป้ายกำกับจาก ${changeLabelName} ใหม่เป็น`"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="onChangeLabel(changeLabelName)" variant="elevated" :disabled="!tobeChangeLabel.length">แก้ไขป้ายกำกับ</v-btn>
        </v-card-actions>
      </v-card>
    </VDialog>
  </div>
</template>


<style lang="scss" scoped>
$primary-color: #007e4e;
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
    img {
      width: 30px;
      height: 30px;
      &:last-child {
        display: none;
      }
    }
  }
  .annotate-cn-list-content {
    display: flex;
    padding: 15px 10px;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .tag {
      margin-right: 5px;
    }
  }
  .annotation-txt {
    color: $primary-color;
    font-size: 1.3rem;
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

