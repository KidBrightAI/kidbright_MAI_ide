<script setup>

</script>
<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <div class="d-flex flex-fill align-items-center justify-content-center view-panel">
          <RobotSoundCapture ref="soundCapture" @recorded="onRecordComplete" :id="current.slice(-1).pop()" @volumeChange="v=>volume = v"></RobotSoundCapture>
          <p class="view-img-desc center-pos" v-if="(current.length == null || current.length <= 0) && !isRecording">
            No selected item, please click on the list below to select.
          </p>
          <dataset-counter :current="current.length ? positionOf(current.slice(-1).pop())+1 : null" prefix="Select" suffix="Voices"></dataset-counter>
        </div>
        <SoundDatasetList v-model="current" :multiple="true" :showInfo="false" @mfcc="onMFCC" @play="onPlay" :volume="volume"></SoundDatasetList>
      </div>
      <div class="side-panel" style="width: 300px">
        <div class="w-100">
          <h5 class="side-panel-ttl">Recorder Settings</h5>
          <div class="feature-wrap">
            <p>Range : <b> {{ project.options.duration }} </b> seconds</p>
            <p>Delay : <b> {{ project.options.delay }} </b> ms</p>
          </div>
        </div>
        <div class="center bottom-action">
          <img
            v-if="!isRecording"
            class="op-btn"
            src="~/assets/images/UI/png/Group 200.png"
            height="96"
            alt=""
            srcset=""
            @click="record"
          />
          <img
            v-else
            class="op-btn op-btn-disable"
            src="~/assets/images/UI/png/Group 169.png"
            height="96"
            alt=""
            srcset=""
            @click="endRecord"
          />
        </div>
      </div>
    </div>
    <MfccModal ref="mfcc-modal"></MfccModal>
  </div>
</template>
  