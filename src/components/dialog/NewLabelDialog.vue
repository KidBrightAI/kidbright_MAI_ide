<script setup>
const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

const emit = defineEmits(['newLabel'])

const labelName = ref('')
const showDialog = ref(false)

const resetForm = () => {
  labelName.value = ''
  showDialog.value = false
}
const submitLabel = () => {
  emit('newLabel', labelName.value)
  resetForm()
}
</script>

<template>
  <VDialog
    v-model="showDialog"
    activator="parent"
    width="500px"
  >
    <VCard>
      <VToolbar density="compact">
        <VToolbarTitle>{{ $t('dialog.newLabel.title') }}</VToolbarTitle>
        <VSpacer /> 
        <VBtn
          icon
          density="compact"
          @click="resetForm"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText>
        <VTextField
          v-model="labelName"
          :label="$t('dialog.newLabel.name')"
          outlined
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!labelName.length"
          @click="submitLabel"
        >
          {{ $t('dialog.newLabel.add') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
