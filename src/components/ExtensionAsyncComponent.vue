<template>
  <AsyncComponent :data="data" />
</template>

<script setup>
import { shallowRef , ref, defineAsyncComponent, watchEffect } from 'vue'


const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  target: {
    type: [String, Function],
    required: true,
  },
})
const AsyncComponent = shallowRef(null)
watchEffect(() => {
  if (typeof props.target === 'function') {
    AsyncComponent.value = defineAsyncComponent(props.target)
  } else {
    AsyncComponent.value = defineAsyncComponent(() => import(`/extensions/${props.target}`))
  }
})
</script>
