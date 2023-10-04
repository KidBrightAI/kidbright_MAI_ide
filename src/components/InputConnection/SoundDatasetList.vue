<template>
  <div class="img-slider">
    <DynamicScroller
      :items="dataList"
      :min-item-size="75"
      direction="vertical"
      class="scroller"
      ref="img_scroller"
    >
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem
          :item="item.id"
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
              :delay="project.options.duration" 
              :ref="`wav_${item.id}`"
              @onPlay="onPlay"
              @onEnd="onEnd"
              :volume="volume"
            >
            </WaveFormPlayer>
            <div v-if="showInfo && item.class" class="label-data">
              <img src="~/assets/images/UI/svg/Group 177_green.svg" height="20" style="padding-right: 10px"/>
              {{item.class}}
            </div>
            <div v-if="showInfo && item.class">
                <img src="~/assets/images/UI/svg/Group 177_grey.svg" height="20"/>
              </div>
            <div class="control">
              <img src="~/assets/images/UI/svg/wave-icon.svg" height="20" class="op-btn" @click="el=>$emit('mfcc',item.id)"/>
              <img v-if="playing != item.id" src="~/assets/images/UI/svg/play-icon.svg" height="20" class="op-btn" @click="playHandler(item.id)"/>
              <img v-else src="~/assets/images/UI/svg/pause-icon.svg" height="20" class="op-btn-disabled"/>
            </div>
            <img title="กดปุ่ม CTRL ค้างไว้ เพื่อทำการลบรูปที่เลือก" class="cancel-btn" src="~/assets/images/UI/png/cancel.png" @click="removeItem($event,item)"/>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import WaveFormPlayer from "./WaveFormPlayer.vue";
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
export default {
  name: "SoundDatasetList",
  components: {
    WaveFormPlayer
  },
  props:{
    value:{
      //type : String,
    },
    volume: {
      type: Number,
      default : 0.5
    },
    multiple:{
      type: Boolean,
      default: false,
    },
    showInfo:{
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selected: this.value,
      lastSelectedIndex : 0,
      //current : this.current,
      playing : null,
    };
  },
  computed: {
    ...mapGetters("dataset",[ 'dataList','getBaseURL','positionOf']),
    ...mapState("project",[ 'project']),
  },
  methods: {
    ...mapActions("dataset",["getDataList","deleteDatasetItem","deleteDatasetItems"]),
    async playHandler(id){
      if (this.$refs[`wav_${id}`]){
        this.$emit("play",id);
        await this.$refs[`wav_${id}`].play();
      }else{
        console.log("ref not found id : ", id);
      }
    },
    async onPlay(id){
      this.playing = id;
    },
    async onEnd(id){
      this.playing = null;
    },
    selectImage(event,item,index){
      if(this.multiple){
        // ---- multiple select ---- //
        if(event.shiftKey){
          let ds = this.dataList;
          let range = null;
          if(index < this.lastSelectedIndex){
            range = ds.slice(index,event.ctrlKey? this.lastSelectedIndex :  this.lastSelectedIndex + 1);
          }else if(index > this.lastSelectedIndex){
            range = ds.slice(event.ctrlKey? this.lastSelectedIndex + 1 : this.lastSelectedIndex , index + 1);
          }
          if(range){
            this.selected = event.ctrlKey ? this.selected.concat(range.map(el=>el.id)) : range.map(el=>el.id);
          }
        }else if (event.ctrlKey){
          let indexed = this.selected.indexOf(item);
          if (indexed !== -1) {
            //selected item contained, let remove
            this.selected.splice(indexed, 1);
          }else{
            this.selected.push(item);
          }
          this.lastSelectedIndex = index;
        }else{
          this.selected = [item];
          this.lastSelectedIndex = index;
        }
        // ---------------------- //
        this.$emit("input",this.selected);
      }else{
        this.$emit("input",item);
      }
    },

    async removeItem(e,item){
      if(this.multiple){
        // if(this.selected.length > 1){
        //   let confirm = await this.$dialog.confirm({ text: 'ต้องการลบ', title : ""});
        // }
        if(e.ctrlKey){
          if(this.selected.length > 1){
            let confirm = await this.$dialog.confirm({ text: `ต้องการลบรูปที่เลือก ${this.selected.length} รูป`, title : "ยืนยันการลบรูปภาพ"});
            if(confirm){
              await this.deleteDatasetItems(this.selected);
              this.selected = [];
              this.$emit("input",this.selected);
            }
          }
        }else{
          await this.deleteDatasetItem(item);
          if(this.selected.includes(item.id)){
            this.selected = this.selected.filter(el=>el != item.id) || [];
            this.$emit("input",this.selected);
          }
        }
      }else{
        await this.deleteDatasetItem(item);
        if(item.id == this.value){
          this.$emit("input",null);
        }
      }
    },
  }
};
</script>
<style>

</style>
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
    margin-top: 15px;
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