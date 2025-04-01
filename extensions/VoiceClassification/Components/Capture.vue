<script setup>    
  import AdbSoundCapture from "@/components/InputConnection/AdbSoundCapture.vue";
  import DatasetCounter from "@/components/InputConnection/DatasetCounter.vue";
  import SoundDatasetList from "@/components/InputConnection/SoundDatasetList.vue";
  import { randomId } from "@/components/utils";
  import { useDatasetStore } from '@/store/dataset';
  import { useWorkspaceStore } from '@/store/workspace';

  const datasetStore = useDatasetStore();
  const workspaceStore = useWorkspaceStore();

  const current = ref([]);
  const status = ref("disconnected");
  const isRecording = ref(false);  
  const soundCapture = ref(null);
  const showMFCCDialog = ref(false);
  const targetMFCC = ref(null);
  const record = () => {
    soundCapture.value.listen();
  };
  const onRecordComplete = async(data) => {
    if(data) {
      let tobesave = {
        id : randomId(),
        thumbnail : null,
        image: data.preview,
        mfcc: data.mfcc,
        sound : data.sound,
        annotate: [],
        class: null,
        ext: "png",
        sound_ext: "wav",
        mfcc_ext: "png",
        duration: data.duration,
      };
      await datasetStore.addData(tobesave);
      current.value = [data.id];
    }
    //datasetStore.addVoice(data);
  };
</script>
<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-items-center justify-content-center view-panel">
          <AdbSoundCapture ref="soundCapture" v-model="status" @recorded="onRecordComplete" :id="current.slice(-1).pop()"></AdbSoundCapture>
          <p class="view-img-desc center-pos" v-if="(current.length == null || current.length <= 0) && !isRecording">
            No selected item, please click on the list below to select.
          </p>
          <DatasetCounter
                :current="
                  current.length ? datasetStore.positionOf(current.slice(-1).pop()) + 1 : null
                "
                prefix="Selected "
                suffix="Sound"
          ></DatasetCounter>
        </div>
        <SoundDatasetList v-model="current" :multiple="true" :showInfo="false" :volume="volume"></SoundDatasetList>
      </div>
      <div class="side-panel d-flex justify-space-between" style="width: 300px">
        <div class="w-100">
          <h5 class="side-panel-ttl">Recorder Settings</h5>
          <div class="feature-wrap">
            <p>Range : <b> {{ workspaceStore.extension.options.durations.value }} </b> seconds</p>            
          </div>
        </div>
        <div class="center bottom-action">                 
          <img
            v-if="status === 'ready'"
            class="op-btn"
            src="@/assets/images/png/Group_200.png"
            height="96"
            alt=""
            srcset=""
            @click="record"
          />
          <img
            v-else
            class="op-btn op-btn-disable"
            src="@/assets/images/png/Group_200.png"
            height="96"
            alt=""
            srcset=""
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$primary-color: #007e4e;
.center-pos {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  font-size: 1.0rem;
  font-weight: 700;
}
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
.side-panel-ttl {
  color: $primary-color;
  font-weight: 700;
  background: #cdcdcd;
  padding: 10px 20px;
  margin-bottom: 10px;
  width: 100%;
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
  background-color: #ffffff;
  position: relative;
  img {
    min-width: 50%;
    min-height: 50%;
    object-fit: contain;
  }
  .view-img-desc {
    color: #000000;
  }
}
</style>
