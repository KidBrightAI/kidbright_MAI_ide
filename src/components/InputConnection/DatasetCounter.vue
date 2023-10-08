<template>
  <div class="img-counter">
    <span class="current-img">{{props.prefix}} </span>
    <span class="ov-img">{{props.current || "-"}} {{props.seperator}} {{datasetStore.dataLength}} {{props.suffix}}{{datasetStore.dataLength > 1? "s" : ""}}</span>
  </div>
</template>
<script setup>
import { useDatasetStore } from "@/store/dataset";
const datasetStore = useDatasetStore();
const props = defineProps({
  prefix : {
    type : String
  },
  current : {
    type : [String, Number]
  },
  seperator : {
    type: String,
    default : "/"
  },
  suffix:{
    type : String
  },
});
</script>
<style lang="scss" scoped>
$primary-color: #007e4e;
.img-counter {
    position: absolute;
    bottom: 30px;
    right: 30px;
    background-color: #fff;
    border-radius: 19px;
    padding: 10px 20px;
    box-shadow: 0 0 10px #33333333;
    span {
      font-weight: bold;
    }
    .current-img {
      color: $primary-color;
      padding-right: 5px;
    }
  }
</style>
