<script setup>
const props = defineProps({
  isDialogVisible: Boolean,
  title : {
    type : String,
    default : 'Dialog Title',
  },
  label : {
    type : String,
    default : 'Label',
  },
  buttonName : {
    type : String,
    default : 'Submit',
  },
})

const emit = defineEmits(['update:isDialogVisible','value'])

const name = ref('')

const resetForm = () => {
  name.value = ''
  emit('update:isDialogVisible', false)
}

const submitLabel = () => {
  emit('value', name.value)
  resetForm()
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
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
