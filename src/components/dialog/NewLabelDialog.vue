<script setup>

const props = defineProps({
  isDialogVisible: Boolean,
})

const labelName = ref('');
const showDialog = ref(false);

const emit = defineEmits(['newLabel']);

const resetForm = () => {
  labelName.value = '';
  showDialog.value = false;
}
const submitLabel = () => {
  emit('newLabel', labelName.value);
  resetForm();
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
        <VSpacer/> 
        <VBtn icon @click="resetForm" density="compact">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText>
        <VTextField
          v-model="labelName"
          label="ตั้งชื่อป้ายกำกับ"
          outlined
        ></VTextField>
      </VCardText>
      <VCardActions>
        <VSpacer/>
        <VBtn color="primary" @click="submitLabel" variant="elevated" :disabled="!labelName.length">เพิ่มป้ายกำกับ</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
