<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"
import { useBoardStore } from "@/store/board"
import { toast } from "vue3-toastify"
import { useWorkspaceStore } from "@/store/workspace"
import { onMounted } from "vue"
import { randomId } from "../utils"
import { useI18n } from "vue-i18n"

const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

const emit = defineEmits(['submit'])

const { t } = useI18n()

const boardStore = useBoardStore()
const workspaceStore = useWorkspaceStore()

const extensions = inject('extensions')
const models = extensions.map(el => ({title : el.title, value : el.id}))
const modelOptions = Object.fromEntries(extensions.map(el=> el.options? [el.id,el.options] : null).filter(el=>el!=null))
const selectType = ref(extensions[0].id)
const projectName = ref(t('dialog.newProject.defaultName'))

const refVForm = ref({})

const nameRules = [
  v => !!v || t('dialog.newProject.nameRequired'),
  v => (v && v.length <= 60) || t('dialog.newProject.nameTooLong'),
]

const resetForm = () => {
  isDialogVisible.value = false
}

const onFormSubmit = async() => {
  let { valid: isValid } = await refVForm.value?.validate()  
  if (isValid) {
    let selectedExtension = extensions.find(el=>el.id == selectType.value)
    let project = {
      name: projectName.value,
      id: "kidbright_mai" + "_" + randomId(),
      projectType: null,// selectType.value, //id of extension
      projectTypeTitle: "", //selectedExtension.name, //this.models.find(el=>el.value == this.selectType).text,
      lastUpdate: new Date(),
      extension: selectedExtension, 
      model : null,
      dataset: [],
      labels: [],
      board: "kidbright-mai",
    }
    emit('submit', project)
  }
}
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
          {{ $t('dialog.newProject.title') }}
        </VCardTitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VForm
          ref="refVForm"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!--
              VCol cols="12">
              <VSelect :items="models" label="ประเภทการเรียนรู้" v-model="selectType">
              </VSelect>
              </VCol
            -->
            <VCol cols="12">
              <VTextField
                v-model="projectName"
                :label="$t('dialog.newProject.name')"
                outlined
                dense
                clearable
                :rules="nameRules"
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
                {{ $t('dialog.newProject.create') }}
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
