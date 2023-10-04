<template>
  <div class="img-slider" @mousewheel="scrollX">
    <div class="info-text">
      <span>press 'A' - 'D' to move select</span>
    </div>
    <DynamicScroller
      :items="dataList"
      :min-item-size="135"
      direction="horizontal"
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
              img: true,
              active: multiple ? value.includes(item.id) : value === item.id,
            }"
            @click="selectImage($event, item.id, index)"
          >
            <div v-if="showInfo && item.annotate.length" class="annotate-data">
              <span>{{ item.annotate.length }}</span>
            </div>
            <b-img-lazy
              class="thumb"
              :src="`${getBaseURL}/${item.id}.${item.ext}`"
              alt=""
              srcset=""
            >
            </b-img-lazy>
            <div v-if="showInfo && item.class" class="label-data">
              {{ item.class }}
            </div>
          </div>
          <img
            title="กดปุ่ม CTRL ค้างไว้ เพื่อทำการลบรูปที่เลือก"
            class="cancel-btn"
            src="~/assets/images/UI/png/cancel.png"
            @click="removeItem($event, item)"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  name: "ImageDatasetList",
  components: {},
  props: {
    value: {
      //type : String,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    showInfo: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: this.value,
      lastSelectedIndex: 0,
      //current : this.current,
    };
  },
  computed: {
    ...mapGetters("dataset", ["dataList", "getBaseURL", "positionOf"]),
  },
  mounted() {
    window.addEventListener("keypress", this.onKey);
  },
  beforeDestroy() {
    window.removeEventListener("keypress", this.onKey);
  },
  methods: {
    ...mapActions("dataset", [
      "getDataList",
      "deleteDatasetItem",
      "deleteDatasetItems",
    ]),
    onKey(e) {
      if (e.key == "d") {
        if (
          this.lastSelectedIndex >= 0 &&
          this.lastSelectedIndex < this.dataList.length - 1
        ) {
          let nextPos = this.lastSelectedIndex + 1;
          let item = this.dataList[nextPos].id;
          if (this.multiple) {
            this.selected = [item];
            this.lastSelectedIndex = nextPos;
            this.$emit("input", this.selected);
          } else {
            this.$emit("input", item);
          }
          this.scrollXBy(135);
        }
      } else if (e.key == "a") {
        if (
          this.lastSelectedIndex > 0 &&
          this.lastSelectedIndex < this.dataList.length
        ) {
          let nextPos = this.lastSelectedIndex - 1;
          let item = this.dataList[nextPos].id;
          if (this.multiple) {
            this.selected = [item];
            this.lastSelectedIndex = nextPos;
            this.$emit("input", this.selected);
          } else {
            this.$emit("input", item);
          }
          this.scrollXBy(-135);
        }
      }
    },
    selectImage(event, item, index) {
      if (this.multiple) {
        // ---- multiple select ---- //
        if (event.shiftKey) {
          let ds = this.dataList;
          let range = null;
          if (index < this.lastSelectedIndex) {
            range = ds.slice(
              index,
              event.ctrlKey
                ? this.lastSelectedIndex
                : this.lastSelectedIndex + 1
            );
          } else if (index > this.lastSelectedIndex) {
            range = ds.slice(
              event.ctrlKey
                ? this.lastSelectedIndex + 1
                : this.lastSelectedIndex,
              index + 1
            );
          }
          if (range) {
            this.selected = event.ctrlKey
              ? this.selected.concat(range.map((el) => el.id))
              : range.map((el) => el.id);
          }
        } else if (event.ctrlKey) {
          let indexed = this.selected.indexOf(item);
          if (indexed !== -1) {
            //selected item contained, let remove
            this.selected.splice(indexed, 1);
          } else {
            this.selected.push(item);
          }
          this.lastSelectedIndex = index;
        } else {
          this.selected = [item];
          this.lastSelectedIndex = index;
        }
        // ---------------------- //
        this.$emit("input", this.selected);
      } else {
        this.$emit("input", item);
      }
    },
    async removeItem(e, item) {
      if (this.multiple) {
        // if(this.selected.length > 1){
        //   let confirm = await this.$dialog.confirm({ text: 'ต้องการลบ', title : ""});
        // }
        if (e.ctrlKey) {
          if (this.selected.length > 1) {
            let confirm = await this.$dialog.confirm({
              text: `ต้องการลบรูปที่เลือก ${this.selected.length} รูป`,
              title: "ยืนยันการลบรูปภาพ",
            });
            if (confirm) {
              await this.deleteDatasetItems(this.selected);
              this.selected = [];
              this.$emit("input", this.selected);
            }
          }
        } else {
          await this.deleteDatasetItem(item);
          if (this.selected.includes(item.id)) {
            this.selected = this.selected.filter((el) => el != item.id) || [];
            this.$emit("input", this.selected);
          }
        }
      } else {
        await this.deleteDatasetItem(item);
        if (item.id == this.value) {
          this.$emit("input", null);
        }
      }
    },
    scrollX(e) {
      e.preventDefault();
      let el = document.getElementsByClassName("vue-recycle-scroller")[0];
      el.scrollLeft += e.deltaY;
    },
    scrollXBy(px) {
      let el = document.getElementsByClassName("vue-recycle-scroller")[0];
      el.scrollLeft += px;
    },
  },
};
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