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
  </div>
</template>

<style lang="scss" scoped>
$primary-color: #007e4e;

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;
  margin: 0 0.5em;
  &:hover {
    opacity: 0.7;
  }
}
.op-btn-disable{
  cursor: pointer;
  //pointer-events: none;
  //-webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  //filter: grayscale(100%);
}
.side-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 300px;
  .side-panel-ttl {
    color: $primary-color;
    font-weight: bold;
    background: #cdcdcd;
    padding: 10px 20px;
    margin-bottom: 10px;
    width: 100%;
  }
  .feature-wrap {
    padding: 2em;
    width: 100%;
    background: #e6e6e6;
    border-radius: 20px;
  }
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
.bottom-action{
  margin-bottom: 2em;
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
.center-pos {
  color: white;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  text-align: center;
}
</style>