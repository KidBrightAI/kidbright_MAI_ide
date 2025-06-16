<script setup>
import WaveFormPlayer from '@/components/InputConnection/WaveFormPlayer.vue';
import { useDatasetStore } from '@/store/dataset';
import { useWorkspaceStore } from '@/store/workspace';
import { useConfirm } from "@/components/comfirm-dialog";

const workspaceStore = useWorkspaceStore();
const datasetStore = useDatasetStore();

const duration = workspaceStore.extension.options.durations.value;

const value = defineModel({
  type: [String, Array],
  default: null,
  required: true,
});

const showMFCCDialog = ref(false);
const targetMFCC = ref(null);
const confirm = useConfirm();

const lastSelectedIndex = ref(0);
const selected = ref([]);
const playing = ref(null);
const player = ref([]);

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
  showInfo: {
    type: Boolean,
    default: false,
  },
  volume: {
    type: Number,
    default: 1,
  },
});
const emit = defineEmits(["mfcc", "play"]);
const onMFCC = (id) => {
  targetMFCC.value = id;
  showMFCCDialog.value = true;
};
const onPlay = (id) => {
  emit("play", id);
};
const onEnd = (id) => {
  console.log("end", id);
};
const selectImage = (event, item, index) => {
  // if(props.multiple){
  //   // ---- multiple select ---- //
  //   if(event.shiftKey){
  //     let ds = this.dataList;
  //     let range = null;
  //     if(index < this.lastSelectedIndex){
  //       range = ds.slice(index,event.ctrlKey? this.lastSelectedIndex :  this.lastSelectedIndex + 1);
  //     }else if(index > this.lastSelectedIndex){
  //       range = ds.slice(event.ctrlKey? this.lastSelectedIndex + 1 : this.lastSelectedIndex , index + 1);
  //     }
  //     if(range){
  //       this.selected = event.ctrlKey ? this.selected.concat(range.map(el=>el.id)) : range.map(el=>el.id);
  //     }
  //   }else if (event.ctrlKey){
  //     let indexed = this.selected.indexOf(item);
  //     if (indexed !== -1) {
  //       //selected item contained, let remove
  //       this.selected.splice(indexed, 1);
  //     }else{
  //       this.selected.push(item);
  //     }
  //     this.lastSelectedIndex = index;
  //   }else{
  //     this.selected = [item];
  //     this.lastSelectedIndex = index;
  //   }
  //   // ---------------------- //
  //   this.$emit("input",this.selected);
  // }else{
  //   this.$emit("input",item);
  // }
  if(props.multiple) {
    // ---- multiple select ---- //
    if (event.shiftKey) {
      let ds = datasetStore.data;
      let range = null;
      if (index < lastSelectedIndex.value) {
        range = ds.slice(index, event.ctrlKey ? lastSelectedIndex.value : lastSelectedIndex.value + 1);
      } else if (index > lastSelectedIndex.value) {
        range = ds.slice(event.ctrlKey ? lastSelectedIndex.value + 1 : lastSelectedIndex.value, index + 1);
      }
      if (range) {
        selected.value = event.ctrlKey ? selected.value.concat(range.map((el) => el.id)) : range.map((el) => el.id);
      }
    } else if (event.ctrlKey) {
      let indexed = selected.value.indexOf(item);
      if (indexed !== -1) {
        //selected item contained, let remove
        selected.value.splice(indexed, 1);
      } else {
        selected.value.push(item);
      }
    } else {
      selected.value = [item];
    }
    value.value = selected.value;
    // ---------------------- //
  } else {
    value.value = item;
  }
  lastSelectedIndex.value = index;
};
/*
const selectImage = (e, id, index) => {
  if (e.ctrlKey) {
    removeItem(e, datasetStore.data[index]);
  } else {
    if (props.multiple) {
      if (value.value.includes(id)) {
        value.value = value.value.filter((v) => v !== id);
      } else {
        value.value = [...value.value, id];
      }
    } else {
      value.value = id;
    }
  }
};
*/
const removeItem = async (e, item) => {
  e.stopPropagation();
  if (props.multiple) {
    if (e.ctrlKey) {
      if (selected.value.length > 1) {
        try {
          await confirm({ title: "ยืนยันการลบเสียงที่เลือก", content: `ต้องการลบรูปที่เลือก ${selected.value.length} รูป`, dialogProps: { width: 'auto' } });
          await datasetStore.deleteDatasetItems(selected.value);
          selected.value = [];
          value.value = [];
        } catch (e) {
          return;
        }
      }
    } else {
      await datasetStore.deleteDatasetItem(item);
      if (selected.value.includes(item.id)) {
        selected.value = selected.value.filter((v) => v !== item.id) || [];
        value.value = selected.value;
      }
    }
  } else {
    await datasetStore.deleteDatasetItem(item);
    if (item.id === value.value) {
      value.value = null;
    }
  }
};
const playHandler = (id) => {
  emit("play", id);
  let target = player.value.find((el) => el.id === id);
  if (target) {
    target.play();
  }
};

</script>
<template>
  <div class="img-slider">
    <v-dialog max-width="500" v-model="showMFCCDialog">
      <v-card title="MFCC">
        <v-card-text>
          <img width="455px" height="450px" :src="`${datasetStore.baseURL}/${targetMFCC}_mfcc.png`"></img>
        </v-card-text>
        <v-card-actions>
          <VSpacer></VSpacer>
          <v-btn @click="showMFCCDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DynamicScroller
      :items="datasetStore.data"
      :item-size="65"
      class="scroller"
      ref="img_scroller"
      :min-item-size="60"
    >
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
          :data-active="active"
        >
          <div
            :key="index"
            :class="{
              'dataset-item' : true,
              active: multiple? value.includes(item.id) : value === item.id,
            }"
            @click="selectImage($event,item.id,index)"
          >
            <div v-if="showInfo && item.annotate.length" class="annotate-data">
              <span>{{item.annotate.length}}</span>
            </div>
            <WaveFormPlayer 
              :id="item.id" 
              :sound_ext="item.sound_ext" 
              :img_ext="item.ext" 
              :delay="duration" 
              :ref="el => player.includes(el) || player.push(el)"
              @onPlay="onPlay"
              @onEnd="onEnd"
              :volume="volume"
            >
            </WaveFormPlayer>
            <div v-if="showInfo && item.class" class="label-data">
              <img src="@/assets/images/png/Group_177_green.svg" height="20" style="padding-right: 10px"/>
              {{item.class}}
            </div>
            <div v-if="showInfo && item.class">
              <img src="@/assets/images/png/Group_177_grey.svg" height="20"/>
              </div>
            <div class="control">
              <img src="@/assets/images/png/wave-sound.png" height="20" class="op-btn" @click="onMFCC(item.id)"/>
              <img v-if="playing != item.id" src="@/assets/images/png/play3.png" height="20" class="op-btn" @click.stop="playHandler(item.id)"/>
              <img v-else src="@/assets/images/png/pause1.png" height="20" class="op-btn-disabled"/>
            </div>
            <img title="กดปุ่ม CTRL ค้างไว้ เพื่อทำการลบรูปที่เลือก" class="cancel-btn" src="@/assets/images/png/cancel.png" @click.stop="removeItem($event,item)"/>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>
<style lang="scss" scoped>
$primary-color: #007e4e;
$secondary-color: #007e4e;
.label-data{
  position: absolute;
  border-radius: 25px;
  left: 15px;
  padding: 10px;
  text-align: center;
  background-color: rgba(0,0,0,0.7098);
  color: white;
  font-size: 15px;
}
.annotate-data{
  position: absolute;
  bottom: 10px;
  width: 100%;
  span{
    color: white;
    background-color: red;
    padding: 1px 10px;
    border-radius: 25px;
    margin-left: 10px;
  }
}
.scroller {
  height: 100%;
  width: 100%;
  display: block;
  overflow-y: scroll !important;
  padding-right: 10px;
}
.img-slider {
  display: -webkit-box;
  width: calc(100% - 30px); //margin 25 + 25 = 50
  height: calc(100vh - 280px); //250px margin top , margin bottom 15px
  position: relative;
  margin-top: 15px;
  margin-right: 15px;
  margin-bottom: 15px;
  margin-left: 15px;
  .labeled::after  {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border: 2px solid $secondary-color;
      border-radius: 20px;
      pointer-events: none;
  }
  .dataset-item {
    background-color: #cccccc;
    height: 60px;
    width: 100%;
    margin-bottom: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
    overflow: hidden;
    position: relative;
    opacity: 0.8;
    transition: opacity 0.3s ease-in;
    cursor: pointer;
    &.active{
      background-color: $primary-color;
    }
    &.active,
    &:hover {
      opacity: 1;
    }
    .control{
      background-color: white;
      margin-left: 10px;
      margin-right: 15px;
      padding: 10px;
      border-radius: 25px;
      display: inline-flex;
      img {
        margin-left: 10px;
        margin-right: 10px;
      }
    }
  }
  .cancel-btn {
    margin-right: 13px;
    width: 30px;
    height: 30px;
    transition: opacity 0.2s ease-in;
    opacity: 1;
    cursor: pointer;
    &.active,
    &:hover {
      opacity: 0.8;
    }
  }
  .op-btn {
    transition: opacity 0.3s ease-in;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
  .op-btn-disable{
    pointer-events: none;  
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
  }
}
</style>
