<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-items-center justify-content-center view-panel">
          <image-display v-if="current.length" :id="current.slice(-1).pop()"></image-display>
          <p class="view-img-desc" v-if="!current.length">
            No selected image, please click on the image below to select.
          </p>
          <dataset-counter class="second-counter" prefix="Labeled" seperator="of" :current="getLabeledLength" suffix="Image"></dataset-counter>
          <dataset-counter prefix="Selected" seperator="of" :current="current.length" suffix="Image"></dataset-counter>
        </div>
        <image-dataset-list v-model="current" :multiple="true" :showInfo="true"></image-dataset-list>
      </div>
      <div class="side-panel">
        <div class="w-100">
          <h4 class="side-panel-ttl">LABEL</h4>
          <div class="feature-wrap">
            <button @click="onNewLabel" class="btn btn-light new-label w-100">
              New label
              <b-icon-plus class="float-right"></b-icon-plus>
            </button>
            <div class="pills w-100">
              <button
                type="button"
                @click="selectLabel(cls.label)"
                class="btn added-label w-100"
                v-for="(cls, index) in getLabels"
                :key="index"
              >
                {{ cls.label }}
                <div class="right-group">
                  <b-avatar button @click="onChangeLabel(cls.label)" size="sm" icon="arrow-repeat" class="mr-1"></b-avatar>
                  <b-avatar button @click="onRemoveLabel(cls.label)" size="sm" icon="x"></b-avatar>
                </div>
              </button>
            </div>
          </div>
          <h4 class="side-panel-ttl">ANNOTATE</h4>
          <div class="feature-wrap">
            <div class="annotate-cn-list w-100">
              <div
                class="annotate-cn"
                v-for="(item, idx) in getLabelByIds(current)"
                :key="'class-' + idx"
              >
                <div class="annotate-cn-list-content">
                  <img
                    class="tag"
                    src="~/assets/images/UI/svg/Group 177_green.svg"
                    height="24"
                  />
                  <span class="annotation-txt">{{ item }}</span>
                </div>
                <img
                  class="cancel-btn op-btn"
                  src="~/assets/images/UI/svg/cancel-icon.svg"
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

<script>
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
import ImageDisplay from '~/components/InputConnection/ImageDisplay.vue';
import ImageDatasetList from "~/components/InputConnection/ImageDatasetList.vue";
import DatasetCounter from '~/components/InputConnection/DatasetCounter.vue';

export default {
  name: "Anotate",
  components: {
    ImageDisplay,
    ImageDatasetList,
    DatasetCounter,
  },
  data() {
    return {
      current : [],
    };
  },
  methods: {
    ...mapActions("dataset",["setDataClass","changeDataClass","changeDataClassWhere"]),
    ...mapMutations("project",["addLabel","removeLabel","changeLabel"]),
    onNewLabel: async function () {
      let label = await this.$dialog.prompt({ text: 'ชื่อป้ายกำกับ', title: 'ตั้งชื่อป้ายกำกับรูปภาพใหม่' });
      if(label){
        this.addLabel({label: label});
      }
    },
    selectLabel: function (label) {
      this.setDataClass({ids: this.current,label:label});
    },
    onRemoveLabel: async function (name) {
      let confirm = await this.$dialog.confirm({ text: `หากลบ '${name}' ภาพที่ใช้ป้ายกำกับนี้จะถูกล้างค่า`, title : "ยืนยันการลบป้ายกำกับ"});
      if(confirm){
        this.changeDataClass( { oldLabel : name, newLabel : null});
        this.removeLabel(name);
      }
    },
    onChangeLabel: async function(name){
      let label = await this.$dialog.prompt({ text: `ชื่อป้ายกำกับจาก '${name}' เป็น`, title: 'เปลี่ยนชื่อป้ายกำกับใหม่' });
      if(label){
         this.changeDataClass( { oldLabel : name, newLabel : label});
         this.changeLabel({ oldLabel : name, newLabel : label});
      }
    },
    onRemoveAnnotatedLabel: async function (label) {
      //this.setDataClass({ids: this.current.filter(el=>el ),label:null});
      this.changeDataClassWhere({ ids: this.current, oldLabel : label, newLabel : null });
    },
  },
  computed: {
    ...mapGetters("project",["getLabels"]),
    ...mapGetters("dataset",["getLabelByIds","getLabeledLength"]),
  },
};
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