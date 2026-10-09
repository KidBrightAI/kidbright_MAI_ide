<script setup>
import { t } from "@/plugins/i18n"

const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

// Prop defaults are resolved before setup() runs, so they use the
// module-level translator instead of useI18n().
const props = defineProps({  title : {
    type : String,
    default : () => t('dialog.genericInput.title'),
  },
  label : {
    type : String,
    default : () => t('dialog.genericInput.label'),
  },
  buttonName : {
    type : String,
    default : () => t('dialog.genericInput.submit'),
  },
})

const emit = defineEmits(['value'])

const name = ref('')

const resetForm = () => {
  name.value = ''
  isDialogVisible.value = false
}

const submitLabel = () => {
  emit('value', name.value)
  resetForm()
}
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    width="500px"
    persistent
  >
    <VCard>
      <VToolbar density="compact">
        <VToolbarTitle>{{ props.title }}</VToolbarTitle>
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
          v-model="name"
          :label="props.label"
          outlined
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!name.length"
          @click="submitLabel"
        >
          {{ buttonName }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
