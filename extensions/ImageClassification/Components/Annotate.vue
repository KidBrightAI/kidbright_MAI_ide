<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-center justify-center view-panel">
          <ImageDisplay v-if="current.length" :id="current.slice(-1).pop()"></ImageDisplay>
          <p class="view-img-desc" v-if="!current.length">
            No selected image, please click on the image below to select.
          </p>
          <DatasetCounter class="second-counter" prefix="Labeled" seperator="of" :current="getLabeledLength" suffix="Image"></DatasetCounter>
          <DatasetCounter prefix="Selected" seperator="of" :current="current.length" suffix="Image"></DatasetCounter>
        </div>
        <ImageDatasetList v-model="current" :multiple="true" :showInfo="true"></ImageDatasetList>
      </div>
      <div class="side-panel">
        <div class="w-100">
          <h4 class="side-panel-ttl">LABEL</h4>
          <div class="feature-wrap">
            <v-btn block rounded="xl" @click="onNewLabel">
              <VIcon>mdi-plus</VIcon> New label
            </v-btn>
            <div class="pills w-100">
              <v-btn block rounded="xl" @click="selectLabel(cls.label)" v-for="(cls, index) in getLabels">
                {{ cls.label }}
                <div class="right-group">
                  <v-avatar button @click="onChangeLabel(cls.label)" size="sm" icon="arrow-repeat" class="mr-1"></v-avatar>
                  <v-avatar button @click="onRemoveLabel(cls.label)" size="sm" icon="x"></v-avatar>
                </div>
              </v-btn>
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
                    src="@/assets/images/png/Group 177_green.png"
                    height="24"
                  />
                  <span class="annotation-txt">{{ item }}</span>
                </div>
                <img
                  class="cancel-btn op-btn"
                  src="@/assets/images/UI/png/cancel-icon.png"
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
  </div>
</template>

<script setup>
import ImageDisplay from "@/components/InputConnection/ImageDisplay.vue";
import ImageDatasetList from "@/components/InputConnection/ImageDatasetList.vue";
import DatasetCounter from "@/components/InputConnection/DatasetCounter.vue";
import { useDatasetStore } from "@/store/dataset";
import { useConfirm } from "@/components/comfirm-dialog";
import { onMounted, onBeforeUnmount } from "vue";

const datasetStore = useDatasetStore();

const current = ref([]);
</script>

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

