<script setup>
import { watch } from 'vue';


const props = defineProps({
  isDialogVisible: Boolean,
  labelName: {
    type: String,
    default: ''
  }
})

const labelName = ref('');

const emit = defineEmits(['submit']);

const resetForm = () => {
  labelName.value = '';
  emit('update:isDialogVisible', false);
}
const submitLabel = () => {
  emit('submit', labelName.value);
  resetForm();
}

watch(() => props.isDialogVisible, (newVal) => {
  labelName.value = props.labelName;
});

</script>
<template>
  <VDialog
    :model-value="props.isDialogVisible"
    width="500px"
  >
    <VCard>
      <VToolbar density="compact">
        <VToolbarTitle>{{ !props.labelName? 'เพิ่ม' : 'แก้ไข' }} ป้ายกำกับใหม่</VToolbarTitle>
        <VSpacer/> 
        <VBtn icon @click="resetForm" density="compact">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText>
        <VTextField
          v-model="labelName"
          :label="!props.labelName? 'ตั้งชื่อป้ายกำกับ' : 'แก้ไขชื่อป้ายกำกับ'"
          outlined
        ></VTextField>
      </VCardText>
      <VCardActions>
        <VSpacer/>
        <VBtn color="primary" @click="submitLabel" variant="elevated" :disabled="!labelName.length">{{ !props.labelName? 'เพิ่ม' : 'แก้ไข' }}ป้ายกำกับ</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
