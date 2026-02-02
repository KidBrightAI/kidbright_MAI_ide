<template>
  <div
    class="img-slider"
    @mousewheel="scrollX"
  >
    <div class="info-text">
      <span>press 'A' - 'D' or 'Left Arrow' - 'Right Arrow' to move select</span>
    </div>
    <DynamicScroller
      ref="img_scroller"
      :items="datasetStore.data"
      :min-item-size="135"
      direction="horizontal"
      class="scroller"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
          :data-active="active"
        >
          <div
            :key="index"
            class="img"
            :class="{
              active: props.multiple ? props.modelValue.includes(item.id) : props.modelValue === item.id,
            }"
            @click="selectImage($event, item.id, index)"
          >
            <VImg
              class="thumb"
              :src="`${datasetStore.baseURL}/${item.id}.${item.ext}`"
              alt=""
              srcset=""
            />
            <div
              v-if="props.showInfo && item.annotate.length"
              class="annotate-data"
            >
              <span>{{ item.annotate.length }}</span>
            </div>
            <div
              v-if="showInfo && item.class"
              class="label-data"
            >
              {{ item.class }}
            </div>
          </div>
          <img
            title="กดปุ่ม CTRL ค้างไว้ เพื่อทำการลบรูปที่เลือก"
            class="cancel-btn"
            src="@/assets/images/png/cancel.png"
            @click="removeItem($event, item)"
          >
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup>
import { useDatasetStore } from "@/store/dataset"
import { onMounted, onBeforeUnmount } from "vue"
import { useConfirm } from "@/components/comfirm-dialog"

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  showInfo: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(["update:modelValue"])
const datasetStore = useDatasetStore()
const confirm = useConfirm()

const selected = ref(props.value || [])
const lastSelectedIndex = ref(0)


const scrollX = e => {
  e.preventDefault()
  let el = document.getElementsByClassName("vue-recycle-scroller")[0]
  el.scrollLeft += e.deltaY
}

const scrollXBy = px => {
  let el = document.getElementsByClassName("vue-recycle-scroller")[0]
  el.scrollLeft += px
}

const onKey = e => {
  if (e.key == "d" || e.key == "ArrowRight") {
    if (lastSelectedIndex.value >= 0 && lastSelectedIndex.value < datasetStore.data.length - 1) {
      let nextPos = lastSelectedIndex.value + 1
      let item = datasetStore.data[nextPos].id
      if (props.multiple) {
        selected.value = [item]
        lastSelectedIndex.value = nextPos
        emit("update:modelValue", selected.value)
      } else {
        emit("update:modelValue", item)
      }
      scrollXBy(135)
    }
  } else if (e.key == "a" || e.key == "ArrowLeft") {
    if (lastSelectedIndex.value > 0 && lastSelectedIndex.value < datasetStore.data.length) {
      let nextPos = lastSelectedIndex.value - 1
      let item = datasetStore.data[nextPos].id
      if (props.multiple) {
        selected.value = [item]
        lastSelectedIndex.value = nextPos
        emit("update:modelValue", selected.value)
      } else {
        emit("update:modelValue", item)
      }
      scrollXBy(-135)
    }
  }
}

const selectImage = (event, item, index) => {
  if (props.multiple) {
    // ---- multiple select ---- //
    if (event.shiftKey) {
      let ds = datasetStore.data
      let range = null
      if (index < lastSelectedIndex.value) {
        range = ds.slice(
          index,
          event.ctrlKey ? lastSelectedIndex.value : lastSelectedIndex.value + 1,
        )
      } else if (index > lastSelectedIndex.value) {
        range = ds.slice(
          event.ctrlKey ? lastSelectedIndex.value + 1 : lastSelectedIndex.value,
          index + 1,
        )
      }
      if (range) {
        selected.value = event.ctrlKey
          ? selected.value.concat(range.map(el => el.id))
          : range.map(el => el.id)
      }
    } else if (event.ctrlKey) {
      let indexed = selected.value.indexOf(item)
      if (indexed !== -1) {
        //selected item contained, let remove
        selected.value.splice(indexed, 1)
      } else {
        selected.value.push(item)
      }
      lastSelectedIndex.value = index
    } else {
      selected.value = [item]
      lastSelectedIndex.value = index
    }

    // ---------------------- //
    emit("update:modelValue", selected.value)
  } else {
    emit("update:modelValue", item)
  }
}

const removeItem = async (e, item) => {
  if (props.multiple) {
    if (e.ctrlKey) {
      if (selected.value.length > 1) {
        try{
          await confirm({ title: `ยืนยันการลบรูปภาพ ต้องการลบรูปที่เลือก ${selected.value.length} รูป หรือไม่ ?`, dialogProps: { width: 'auto' } })
          emit("update:modelValue", [])
          await datasetStore.deleteDatasetItems(selected.value)
          selected.value = []
        }catch(e){
          console.log("user cancel delete")

          //console.log(e);
        }
      }
    } else {
      if (selected.value.includes(item.id)) {
        selected.value = selected.value.filter(el => el != item.id) || []
        emit("update:modelValue", selected.value)
      }
      await datasetStore.deleteDatasetItem(item)
    }
  } else {
    if (item.id == value) {
      emit("update:modelValue", null)
    }
    await datasetStore.deleteDatasetItem(item)
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey)
})
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
$secondary-color: #007e4e;
.info-text {
  position: absolute;
  text-align: center;
  font-size: 13px;
  bottom: -17px;
  width: 100%;
}
.label-data {
  position: absolute;
  bottom: 0px;
  width: 100%;
  text-align: center;
  background-color: #000000b5;
  color: white;
  font-size: 15px;
}
.annotate-data {
  position: absolute;
  bottom: 10px;
  width: 100%;
  span {
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
  overflow-x: scroll !important;
}
.img-slider {
  display: -webkit-box;
  width: calc(100% - 50px); //margin 25 + 25 = 50
  height: 160px;
  position: relative;
  margin-top: 15px;
  margin-right: 25px;
  margin-bottom: 15px;
  margin-left: 25px;
  .labeled::after {
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
  .img {
    background-color: #2f3241;
    height: 120px;
    width: 120px;
    margin-top: 15px;
    margin-right: 5px;
    margin-bottom: 0px;
    margin-left: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    opacity: 0.7;
    transition: opacity 0.3s ease-in;
    cursor: pointer;
    &.active,
    &:hover {
      opacity: 1;
    }
    &.active::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border: 7px solid $primary-color;
      border-radius: 20px;
      pointer-events: none;
    }
    .thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .cancel-btn {
    position: absolute;
    right: -5px;
    top: 0px;
    width: 30px;
    height: 30px;
    opacity: 0.8;
    transition: opacity 0.2s ease-in;
    cursor: pointer;
    &.active,
    &:hover {
      opacity: 1;
    }
  }
}
</style>
