<template>
  <div class="waveform">
    <div class="full">
      <b-img-lazy v-if="!playing" class="thumb" :src="`${getBaseURL}/${id}.${img_ext}`" alt="" srcset=""></b-img-lazy>
      <div class="playing-overlay" :ref="`img_${id}`"></div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
export default {
  props : {
    id: [String, Array, Object],
    img_ext : {
      required : true,
      type: String, 
    },
    sound_ext : {
      type: String,
      default: "wav"
    },
    mute : {
      type: Boolean,
      default: false
    },
    volume : {
      type: Number,
      default: 0.5 
    },
    delay : {
      required : true,
    }
  },
  data(){
    return {
      playing : false,
    }
  },
  computed: {
    ...mapGetters("dataset",[ 'dataList','getBaseURL','positionOf']),
  },
  methods: {
    async playSound(url){
      return new Promise((resolve,reject)=>{
        var myAudio = new Audio(url);
        myAudio.volume = this.volume;
        myAudio.addEventListener("ended", resolve);
        myAudio.play();
      });
    },
    async play(){
      if(this.$refs[`img_${this.id}`]){
        let target = this.$refs[`img_${this.id}`];
        target.classList.add("playing-overlay");
        target.style.transitionDuration = this.delay + "s";
        target.style.width = "100%";
        this.$emit("onPlay",this.id);
        if(!this.mute){
          await this.playSound(`${this.getBaseURL}/${this.id}.${this.sound_ext}`);
        }else{
          await this.$helper.sleep(this.delay * 1000);
        }
        this.$emit("onEnd",this.id);
        //await this.$helper.sleep(this.delay * 1000);
        target.style.transition = "";
        target.classList.remove("playing-overlay");
        target.style.width = "0%";
      }
    },
  }
}
</script>
<style lang="scss" scoped>
  .waveform{
    width: 100%;
    height: 100%;
    padding: 8px;
    .full{
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 25px;
      overflow: hidden;
      .playing-overlay {
        position: absolute;
        top: 0px;
        left: -2px;
        width: 0%;
        height: 100%;
        border-right-color: red;
        border-right-style: solid;
        border-right-width: 2px;
        background-color: #66000066;
        overflow: hidden;
        transition: width 30s linear;
      }
      .thumb{
        width: 100%;
        height: 100%;
        object-fit: fill;
        image-rendering: -webkit-optimize-contrast;
      }
    }
  }
</style>