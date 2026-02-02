<script setup>
import { watch } from 'vue'


const props = defineProps({
  isDialogVisible: Boolean,
  labelName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit'])

const labelName = ref('')

const resetForm = () => {
  labelName.value = ''
  emit('update:isDialogVisible', false)
}
const submitLabel = () => {
  emit('submit', labelName.value)
  resetForm()
}

watch(() => props.isDialogVisible, newVal => {
  labelName.value = props.labelName
})
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    width="500px"
  >
    <VCard>
      <VToolbar density="compact">
        <VToolbarTitle>{{ !props.labelName? 'เพิ่ม' : 'แก้ไข' }} ป้ายกำกับใหม่</VToolbarTitle>
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
          :label="!props.labelName? 'ตั้งชื่อป้ายกำกับ' : 'แก้ไขชื่อป้ายกำกับ'"
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
          {{ !props.labelName? 'เพิ่ม' : 'แก้ไข' }}ป้ายกำกับ
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
