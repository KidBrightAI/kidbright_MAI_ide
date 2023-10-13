<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <splitpanes class="default-theme" style="width: 100%;">
        <pane size="80">
          <div class="d-flex flex-column h-100">
            <div class="d-flex flex-fill aling-center justify-center view-panel">
              <image-display
                v-if="current.length"
                :id="current.slice(-1).pop()"
              ></image-display>
              <p class="d-flex align-center justify-center text-white" v-if="!current.length">
                No selected image, please click on the image below to select.
              </p>
              <DatasetCounter
                :current="
                  current.length ? datasetStore.positionOf(current.slice(-1).pop()) + 1 : null
                "
                suffix="Image"
              ></DatasetCounter>
            </div>
            <ImageDatasetList
              v-model="current"
              :multiple="true"
              :showInfo="true">
            </ImageDatasetList>
          </div>
        </pane>
        <pane class="d-flex justify-center" size="20">
          <div class="side-panel">
            <ImageCapture
              source=""
              ref="camera"
              @started="(_) => (cameraReady = true)"
              @stoped="(_) => (cameraReady = false)"
            >
            </ImageCapture>
            <div class="d-flex align-center justify-center flex-wrap">
              <img
                v-on:click.prevent
                :class="[
                  'mt-2',
                  'op-btn',
                  { 'op-btn-disable': !cameraReady },
                ]"
                src="@/assets/images/png/Group 198.png"
                height="96"
                @click="snapAndSave"
              />
              <img
                v-on:click.prevent="showImportDialog = true"
                class="mt-2 op-btn"
                src="@/assets/images/png/Group 199.png"
                height="96"
              />
            </div>
          </div>
        </pane>
      </splitpanes>
    </div>
    <ImportImageClassifiy v-model:isDialogVisible="showImportDialog"></ImportImageClassifiy>
  </div>
</template>

<script setup>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { randomId } from "@/components/utils";
import ImportImageClassifiy from "@/components/dialog/ImportImageClassify.vue";
import ImageCapture from "@/components/InputConnection/ImageCapture.vue";
import ImageDisplay from "@/components/InputConnection/ImageDisplay.vue";
import ImageDatasetList from "@/components/InputConnection/ImageDatasetList.vue";
import DatasetCounter from "@/components/InputConnection/DatasetCounter.vue";

import { useDatasetStore } from '@/store/dataset';

const datasetStore = useDatasetStore();

const current = ref([]);
const cameraReady = ref(false);
const camera = ref({});
const showImportDialog = ref(false);

const snapAndSave = async () => {
  let { image, width, height } = await camera.value.snap();
  let data = {
    id : randomId(12),
    image: image,
    width: width,
    height: height,
    annotate: [],
    class: null,
    ext: "jpg",
  };
  await datasetStore.addData(data);
  current.value = [data.id];
};
</script>
<style lang="scss" scoped>
$primary-color: #007e4e;

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;
  margin: 0 0.5em;
  &:hover {
    opacity: 0.7;
  }
}
.op-btn-disable {
  pointer-events: none;
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
}
.side-panel {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  .next {
    height: 50px;
    background: #ffffff 0% 0% no-repeat padding-box;
    border-radius: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 15px;

    span {
      color: $primary-color;
      font-size: 1.5rem;
      font-weight: 800;
      &.ico {
        position: absolute;
        top: 7px;
        right: 18px;
      }
    }
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
