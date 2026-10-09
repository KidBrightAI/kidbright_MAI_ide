<template>
  <div class="img-counter">
    <span class="current-img">{{ props.prefix }} </span>
    <span class="ov-img">{{ props.current || "-" }} {{ props.seperator }} {{ datasetStore.dataLength }} {{ suffixText }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useDatasetStore } from "@/store/dataset"
const props = defineProps({
  prefix : {
    type : String,
  },
  current : {
    type : [String, Number],
  },
  seperator : {
    type: String,
    default : "/",
  },
  suffix:{
    type : String,
  },
})
const { t } = useI18n()
const datasetStore = useDatasetStore()

// The plural form of the unit word belongs to the locale: English appends
// "s" past one item, Thai nouns do not change.
const suffixText = computed(() => (
  datasetStore.dataLength > 1 ? t("capture.datasetList.pluralOf", { word: props.suffix }) : props.suffix
))
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
