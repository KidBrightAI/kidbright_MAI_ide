<script setup>
import { useDatasetStore } from '@/store/dataset';

const datasetStore = useDatasetStore();

</script>
<template>
  <div class="img-slider">
    <VInfiniteScroll 
      height="100%"
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
    </VInfiniteScroll>
  </div>
</template>
