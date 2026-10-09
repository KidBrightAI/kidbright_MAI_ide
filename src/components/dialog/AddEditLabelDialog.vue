<script setup>
import { watch } from 'vue'


const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

const props = defineProps({  labelName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit'])

const labelName = ref('')

const resetForm = () => {
  labelName.value = ''
  isDialogVisible.value = false
}
const submitLabel = () => {
  emit('submit', labelName.value)
  resetForm()
}

watch(isDialogVisible, newVal => {
  labelName.value = props.labelName
})
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    width="500px"
  >
    <VCard>
      <VToolbar density="compact">
        <VToolbarTitle>{{ !props.labelName ? $t('dialog.addEditLabel.addTitle') : $t('dialog.addEditLabel.editTitle') }}</VToolbarTitle>
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
          :label="!props.labelName ? $t('dialog.addEditLabel.name') : $t('dialog.addEditLabel.editName')"
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
          {{ !props.labelName ? $t('dialog.addEditLabel.add') : $t('dialog.addEditLabel.edit') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
