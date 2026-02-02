<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible','submit'])

const refVForm = ref({})
const filename = ref("")

const resetForm = () => {
  emit('update:isDialogVisible', false)
}

const onFormSubmit = async() => {
  let { valid: isValid } = await refVForm.value?.validate()  
  if (isValid) {    
    emit('submit', filename.value)
  }
}

watch(() => props.isDialogVisible, val => {
  if(val){
    filename.value = ""
  }
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '600'"
    :model-value="props.isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn
        variant="text"
        size="small"
        @click="resetForm"
      />
      <VCardItem>
        <VCardTitle class="text-h5">
          ตั้งชื่อไฟล์
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
                label="ชื่อไฟล์"
                outlined
                dense
                clearable
                :rules="[
                  (v) => !!v || 'ต้องการชื่อไฟล์',
                  (v) => (v && v.length <= 128) || 'ชื่อไฟล์ต้องน้อยกว่า 128 ตัวอักษร',
                  //filename validation
                  (v) => {
                    if(v){
                      let regex = /^[ก-๙a-zA-Z0-9_\- ]+$/;
                      return regex.test(v) || 'ชื่อไฟล์ต้องข้อความ ตัวเลข และ _ - หรือว่างเท่านั้น';
                    }
                    return true;
                  }
                ]"
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
                บันทึกโปรเจค
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
