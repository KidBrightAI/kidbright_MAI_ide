<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"
import { useI18n } from "vue-i18n"

const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

const emit = defineEmits(['submit'])

const { t } = useI18n()

const refVForm = ref({})
const filename = ref("")

const filenameRules = [
  v => !!v || t('dialog.saveProject.filenameRequired'),
  v => (v && v.length <= 128) || t('dialog.saveProject.filenameTooLong'),

  // filename validation
  v => {
    if (v) {
      let regex = /^[ก-๙a-zA-Z0-9_\- ]+$/ // i18n-ignore: Thai character range, not UI text

      return regex.test(v) || t('dialog.saveProject.filenameInvalid')
    }

    return true
  },
]

const resetForm = () => {
  isDialogVisible.value = false
}

const onFormSubmit = async() => {
  let { valid: isValid } = await refVForm.value?.validate()  
  if (isValid) {    
    emit('submit', filename.value)
  }
}

watch(isDialogVisible, val => {
  if(val){
    filename.value = ""
  }
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '600'"
    v-model="isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn
        variant="text"
        size="small"
        @click="resetForm"
      />
      <VCardItem>
        <VCardTitle class="text-h5">
          {{ $t('dialog.saveProject.title') }}
        </VCardTitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VForm
          ref="refVForm"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="filename"
                :label="$t('dialog.saveProject.filename')"
                outlined
                dense
                clearable
                :rules="filenameRules"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              class="text-center mt-3"
            >
              <VBtn
                type="submit"
                class="me-3"
                color="primary"
              >
                {{ $t('dialog.saveProject.save') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>  
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.selected-block{
  background-color: #3e3481 !important;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}
</style>
