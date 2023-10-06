<template>
  <img
    v-if="id != null"
    crossorigin="anonymous"
    style="height: calc(100vh - 190px);"
    :src="`${getBaseURL}/${id}.${getFileExt(id)}`"
    ref="img"
  />
</template>
<script setup>
import { useDatasetStore } from "@/store/dataset";
const datasetStore = useDatasetStore();

const props = defineProps({
  id: {
    type: String,
    default: null
  }
});

const { projectName, getBaseURL, getFileExt } = mapGetters("dataset",['projectName','getBaseURL',"getFileExt"]);

const getImage = () => {
  if($refs.img){
    return $refs.img;
  }
};

const getActualSize = () => {
  return new Promise((resolve,reject)=>{
    let img = new Image();
    img.onload = ()=>{
      let ratio = img.naturalWidth/img.naturalHeight;
      let width = $refs.img.height*ratio;
      let height = $refs.img.height;
      if (width > $refs.img.width) {
        width = $refs.img.width;
        height = $refs.img.width/ratio;
      }
      resolve([width, height,img.naturalWidth, img.naturalHeight]);
    };
    img.src = `${getBaseURL}/${id}.${getFileExt(id)}`;
  });  
};
</script>

<script>
import { mapState, mapActions, mapMutations, mapGetters  } from 'vuex';
export default {
  props: {
    id: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapGetters("dataset",['projectName','getBaseURL',"getFileExt"]),
  },
  methods :{
    getImage(){
      if(this.$refs.img){
        return this.$refs.img;
      }
    },
    getActualSize(){
      return new Promise((resolve,reject)=>{
        let img = new Image();
        img.onload = ()=>{
          let ratio = img.naturalWidth/img.naturalHeight;
          let width = this.$refs.img.height*ratio;
          let height = this.$refs.img.height;
          if (width > this.$refs.img.width) {
            width = this.$refs.img.width;
            height = this.$refs.img.width/ratio;
          }
          resolve([width, height,img.naturalWidth, img.naturalHeight]);
        };
        img.src = `${this.getBaseURL}/${this.id}.${this.getFileExt(this.id)}`;
      });  
    },
  }
}
</script>
