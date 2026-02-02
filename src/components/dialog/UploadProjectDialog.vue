<script setup>
import { useServerStore } from "@/store/server"
const serverStore = useServerStore()
</script>

<template>
  <VDialog
    :model-value="serverStore.isUploading"
    width="auto"
    persistent
  >
    <VCard width="480">
      <VCardTitle class="bg-primary d-flex flex-row">
        อัพโหลดโปรเจค        
      </VCardTitle>
      <VCardItem class="d-flex align-center justify-center">
        <VProgressCircular
          :rotate="360"
          :size="200"
          :width="30"
          :model-value="serverStore.uploadProgress"
          color="primary"
        >
          <h4
            class="my-3 text-center"
            text-black
          >
            กำลังอัพโหลด ...<br> {{ serverStore.uploadProgress.toFixed(1) }}%
          </h4>
        </VProgressCircular>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
