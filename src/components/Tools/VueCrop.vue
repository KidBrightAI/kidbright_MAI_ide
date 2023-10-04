<template>
  <div
    ref="drawPanel"
    class="draw-panel unselect"
    @mousedown="startDrawNewCrop"
  >
    <div :class="{'crop-container': true, unselect: true, 'cursor-crosshair': disabled? false: true}">
      <vue-crop-rect 
        v-for="(rect,ind) in rects" 
        :key="ind" 
        :initRect="rects[ind]" 
        @remove="remove(rect.id)" 
        @changed="onRectUpdate"
      >
      </vue-crop-rect>
      <vue-crop-rect :initRect="rect" :showRect="onCreateNew"></vue-crop-rect>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
import VueCropRect from './VueCropRect.vue';
export default {
  components: { VueCropRect },
  name: 'VueCrop',
  props: {
    id: {
      type: String,
      default: ""
    },
    dimension:{
      type: Array,
      default: [0,0,0,0]
    },
    disabled: {
      type: Boolean,
      default: true
    },
    showRect: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: "",
      required: true,
    },
  },
  data () {
    return {
      rects : [],
      rect : { 
        x1:-1,
        y1:-1,
        x2:-1,
        y2:-1,
        color: "#000",
        label: "",
      },
      onCreateNew: false,
    };
  },
  computed: {
    ...mapGetters("dataset",["getAnnotateById"]),
    ...mapGetters("project",["getLabels"]),
    innerMaxHeight () {
      return this.$refs.drawPanel.offsetHeight;
    },
    innerMaxWidth () {
      return this.$refs.drawPanel.offsetWidth;
    },
    getCurrentAnnotation(){
      return this.getAnnotateById(this.id);
    }
  },
  mounted () {
    const leaveOrUp = () => {
      window.document.removeEventListener('mousemove', this.doDrag);
      if(this.onCreateNew){
        let x1 = (this.rect.x2 < this.rect.x1)? this.rect.x2 : this.rect.x1;
        let x2 = (this.rect.x1 > this.rect.x2)? this.rect.x1 : this.rect.x2;
        let y1 = (this.rect.y2 < this.rect.y1)? this.rect.y2 : this.rect.y1;
        let y2 = (this.rect.y1 > this.rect.y2)? this.rect.y1 : this.rect.y2;
        let color = this.colorByLabel(this.label);
        let newRect = Object.assign({
          label : this.label,
          id : this.$helper.randomString(16),
          color : color,
        },this.rect);
        newRect.id = this.$helper.randomString(16);
        this.rects.push(newRect);
        this.onCreateNew = false;
        this.$emit("changed",newRect);
        this.saveRect({
          x1 : x1,
          y1 : y1,
          x2 : x2,
          y2 : y2,
          label : this.label,
          id : newRect.id
        });
      }
    };
    window.document.addEventListener('mouseup', leaveOrUp);
    window.document.addEventListener('mouseleave', leaveOrUp);
  },
  methods: {
    ...mapMutations("dataset",["addOrUpdateAnnotation","removeAnnotation"]),
    startDrawNewCrop (e) {
      if (this.disabled) {
        return;
      }
      this.onCreateNew = true;
      window.document.addEventListener('mousemove', this.doDrag);
      let rect = this.$refs.drawPanel.getBoundingClientRect();
      let targetRect = e.target.getBoundingClientRect();
      let pointX = e.offsetX - rect.left + targetRect.left;
      let pointY = e.offsetY - rect.top + targetRect.top;
      this.rect.x1 = pointX;
      this.rect.y1 = pointY;
      this.rect.x2 = pointX;
      this.rect.y2 = pointY;
      this.rect.label = this.label;
      this.rect.color = this.colorByLabel(this.label);
    },
    doDrag (e) {
      if (e.movementX === 0 && e.movementY === 0) {
        return;
      }
      let x2 = this.rect.x2 + e.movementX;
      let y2 = this.rect.y2 + e.movementY;
      
      this.rect.x2 = x2 > this.innerMaxWidth ? this.innerMaxWidth : (x2 < 0 ? 0: x2);
      this.rect.y2 = y2 > this.innerMaxHeight ? this.innerMaxHeight : (y2 < 0 ? 0 : y2);
    },
    remove(id){
      this.rects = this.rects.filter(el=>el.id !== id);
      this.removeAnnotation({annotationId : id, id : this.id});
    },
    onRectUpdate(rect){
      this.saveRect(rect);
    },
    saveRect(rect){
      let r = JSON.parse(JSON.stringify(rect));
      let actualRect = this.exportRect(r,this.dimension);
      this.addOrUpdateAnnotation({annotation : actualRect, id: this.id});
    },
    loadBboxFromDataset(id){
      this.$nextTick(()=>{
        let annotate = this.getAnnotateById(id);
        if(annotate){
          let rects = JSON.parse(JSON.stringify(annotate));
          rects = this.restoreRect(rects,this.dimension);
          this.rects = rects;
        }
      });
    },
    exportRect(rect,dimension){
      let ratioW = dimension[2] / dimension[0]; //imgNatureSizeWidth / displayWidth 
      let ratioH = dimension[3] / dimension[1]; 
      rect.x1 = Math.floor(ratioW * rect.x1);
      rect.x2 = Math.floor(ratioW * rect.x2);
      rect.y1 = Math.floor(ratioH * rect.y1);
      rect.y2 = Math.floor(ratioH * rect.y2);
      return rect;
    },
    restoreRect(rects,dimension){
      let ratioW = dimension[0] / dimension[2]; //displayWidth / imgNatureSizeWidth  
      let ratioH = dimension[1] / dimension[3]; 
      for(let i in rects){
        rects[i].x1 = Math.floor(ratioW * rects[i].x1);
        rects[i].x2 = Math.floor(ratioW * rects[i].x2);
        rects[i].y1 = Math.floor(ratioH * rects[i].y1);
        rects[i].y2 = Math.floor(ratioH * rects[i].y2);
        rects[i].color = this.colorByLabel(rects[i].label);
      }
      return rects;
    },
    colorByLabel(label){
      let colorIndex = this.getLabels.findIndex(el=>el.label == label);
      colorIndex = colorIndex < 0 ? 0 : colorIndex;
      let color = this.$helper.addAlpha(this.$helper.getColorIndex(colorIndex), 0.5);
      return color;
    }
  },
  watch: {
    getCurrentAnnotation(rects){ // TODO : this method fire loadBboxFromDataset twice!!!
      if(!rects){
        this.rects = [];
        return;
      }
      if(rects && rects.length != this.rects.length && this.id && this.dimension[2] > 0 && this.dimension[3] > 0){
        this.loadBboxFromDataset(this.id);
      }
    }
    // id:{
    //   handler : function(id){
    //     this.$nextTick(()=>{
    //       this.loadBboxFromDataset(id);
    //     });
    //   }
    // }
  }
};
</script>
<style scoped>
.draw-panel {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  position: absolute;
}

.crop-container {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.rect-box{
  width: 100%;
  height: 100%;
}
.cursor-crosshair {
  cursor: crosshair;
}
</style>