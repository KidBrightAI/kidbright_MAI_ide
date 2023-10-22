<template>
    <async-component/>
</template>
<script setup>
import { shallowRef } from 'vue';
import { ref, defineAsyncComponent, watchEffect } from 'vue';

const props = defineProps({
  target: {
    type: String,
    required: true,
  },
});
const AsyncComponent = shallowRef(null);
watchEffect(() => {
  console.log
  AsyncComponent.value = defineAsyncComponent(() => import(`./Instructions/${props.target}`));
});
</script>
