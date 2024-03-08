<script setup>
import { useWorkspaceStore } from "@/store/workspace";
const workspaceStore = useWorkspaceStore();
</script>

<template>
  <VDialog :model-value="workspaceStore.isUploading" width="auto" persistent>
    <VCard width="480">
      <VCardTitle class="bg-primary d-flex flex-row">
        อัพโหลดโปรเจค        
      </VCardTitle>
      <VCardItem class="d-flex align-center justify-center">
        <VProgressCircular
          :rotate="360"
          :size="200"
          :width="30"
          :model-value="workspaceStore.uploadProgress"
          color="primary"
        >
          <h4 class="my-3 text-center" text-black>กำลังอัพโหลด ...<br/> {{workspaceStore.uploadProgress.toFixed(1) }}%</h4>
        </VProgressCircular>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
