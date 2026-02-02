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
    type: String,
    required: true,
  },
})
const AsyncComponent = shallowRef(null)
watchEffect(() => {
  AsyncComponent.value = defineAsyncComponent(() => import(`/extensions/${props.target}`))
})
</script>
