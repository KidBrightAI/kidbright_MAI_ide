<script setup>
import { useWorkspaceStore } from "@/store/workspace"
const workspaceStore = useWorkspaceStore()
</script>

<template>
  <VDialog
    :model-value="workspaceStore.opening"
    width="auto"
    persistent
  >
    <VCard width="480">
      <VCardTitle class="bg-primary d-flex flex-row">
        {{ $t('dialog.openingProject.title') }}
      </VCardTitle>
      <VCardItem class="d-flex align-center justify-center">
        <VProgressCircular
          :rotate="360"
          :size="200"
          :width="30"
          :model-value="workspaceStore.openingProgress"
          color="primary"
        >
          <h4
            class="my-3 text-center"
            text-black
          >
            {{ $t('dialog.openingProject.importing') }}<br> {{ workspaceStore.openingProgress }}%
          </h4>
        </VProgressCircular>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
