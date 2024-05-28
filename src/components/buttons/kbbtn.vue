<script setup>
// override vuetify button
const props = defineProps({
  props : Object,
  icon : String,
  disabledIcon : String,
  disabled : Boolean,
  status : Boolean,
  statusIcon : String
});
const emit = defineEmits(["click"]);
const onClick = (ev) => {
  emit("click", ev, props.status);
};
</script>
<template>
  <button v-bind="props" class="kbbtn" :disabled="props.disabled" @click="onClick">
    <img v-if="!props.status && !props.disabled" :src="icon" alt="icon" width="60" height="60"/>
    <img v-else-if="props.disabled" :src="disabledIcon" alt="icon" width="60" height="60"/>
    <img v-else :src="statusIcon" alt="icon" width="60" height="60"/>
  </button>
</template>
<style lang="scss" scoped>
.kbbtn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  opacity: 0.9;
}
//hover effect
.kbbtn:hover {
  opacity: 1;
}
//disabled
.kbbtn:disabled {
  opacity: 0.8;
  //grey effect
  filter: grayscale(100%);
  cursor: not-allowed;
}
//ripple effect
// .kbbtn::after {
//   content: "";
//   position: absolute;
//   border-radius: 50%;
//   background-color: rgba(255, 255, 255, 0.3);
//   width: 100%;
//   height: 100%;
//   top: 0;
//   left: 0;
//   pointer-events: none;
//   transition: transform 0.6s, opacity 0.6s;
//   transform: scale(0);
//   opacity: 0;
// }
// .kbbtn:hover::after {
//   transform: scale(2);
//   opacity: 1;
// }
// .kbbtn:active::after {
//   transform: scale(0);
//   opacity: 0;
// }

</style>
