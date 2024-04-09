<script setup>

const props = defineProps({
  isDialogVisible: Boolean,
  title : {
    type : String,
    default : 'Dialog Title'
  },
  label : {
    type : String,
    default : 'Label'
  },
  buttonName : {
    type : String,
    default : 'Submit'
  }
})

const name = ref('');

const emit = defineEmits(['update:isDialogVisible','value']);

const resetForm = () => {
  name.value = '';
  emit('update:isDialogVisible', false);
}

const submitLabel = () => {
  emit('value', name.value);
  resetForm();
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
        <VSpacer/> 
        <VBtn icon @click="resetForm" density="compact">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText>
        <VTextField
          v-model="name"
          :label="props.label"
          outlined
        ></VTextField>
      </VCardText>
      <VCardActions>
        <VSpacer/>
        <VBtn color="primary" @click="submitLabel" variant="elevated" :disabled="!name.length">{{buttonName}}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
