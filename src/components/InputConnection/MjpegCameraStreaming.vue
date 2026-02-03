<template>
  <div class="mjpeg-container">
    <div v-if="loading" class="d-flex align-center justify-center fill-height">
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>
    <img
      v-show="!loading"
      ref="imgElement"
      :src="computedUrl"
      crossorigin="anonymous"
      alt="Camera Stream"
      @error="onError"
      @load="onLoad"
    >
  </div>
</template>

<script setup>
import { ref, defineExpose, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['started', 'stopped'])
const imgElement = ref(null)
const loading = ref(true)
const timestamp = ref(Date.now())

const computedUrl = computed(() => {
  if (!props.url) return ''

  // Append timestamp to prevent caching
  const separator = props.url.includes('?') ? '&' : '?'

  return `${props.url}${separator}t=${timestamp.value}`
})

onBeforeUnmount(() => {
  if (imgElement.value) {
    // Force browser to stop the request
    imgElement.value.src = ''
    imgElement.value.removeAttribute('src')
  }
})

const onLoad = () => {
  loading.value = false
  emit('started')
}

const onError = (e) => {
  console.error('MJPEG Stream Error', e)
  loading.value = false // Stop loading on error
  emit('stopped')
}

const capture = async () => {
  if (!imgElement.value) return null

  const canvas = document.createElement('canvas')
  canvas.width = imgElement.value.naturalWidth
  canvas.height = imgElement.value.naturalHeight
  const ctx = canvas.getContext('2d')
  try {
    ctx.drawImage(imgElement.value, 0, 0)
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve({
          image: blob,
          width: canvas.width,
          height: canvas.height,
        })
      }, 'image/jpeg', 0.8)
    })
  } catch (e) {
    console.error('Capture Failed (CORS?)', e)
    return null
  }
}

defineExpose({ capture })
</script>

<style scoped>
.mjpeg-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
    position: relative;
    min-height: 240px; 
}

img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}
</style>
