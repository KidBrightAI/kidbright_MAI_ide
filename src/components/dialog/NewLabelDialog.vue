<script setup>
const props = defineProps({
  isDialogVisible: Boolean,
})

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
        <VToolbarTitle>เพิ่มป้ายกำกับใหม่</VToolbarTitle>
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
          label="ตั้งชื่อป้ายกำกับ"
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
          เพิ่มป้ายกำกับ
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
