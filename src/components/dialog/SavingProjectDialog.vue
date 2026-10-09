<script setup>
import { useWorkspaceStore } from "@/store/workspace"
const workspaceStore = useWorkspaceStore()
</script>

<template>
  <VDialog
    :model-value="workspaceStore.saving"
    width="auto"
    persistent
  >
    <VCard width="480">
      <VCardTitle class="bg-primary d-flex flex-row">
        {{ $t('dialog.savingProject.title') }}
      </VCardTitle>
      <VCardItem class="d-flex align-center justify-center">
        <VProgressCircular
          :rotate="360"
          :size="200"
          :width="30"
          :model-value="workspaceStore.savingProgress"
          color="primary"
        >
          <h4
            class="my-3 text-center"
            text-black
          >
            {{ $t('dialog.savingProject.saving') }}<br> {{ workspaceStore.savingProgress }}%
          </h4>
        </VProgressCircular>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
