<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: 'mdi-close',
  },
  iconSize: {
    type: String,
    required: false,
    default: '22',
  },
})
</script>

<template>
  <VBtn
    icon
    class="v-dialog-close-btn"
    style="position: absolute; right: 16px;"
  >
    <VIcon
      :icon="props.icon"
      :size="props.iconSize"
    />
  </VBtn>
</template>
