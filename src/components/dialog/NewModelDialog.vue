<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue";
import { useBoardStore } from "@/store/board";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "@/store/workspace";
import { onMounted } from "vue";
import { randomId } from "../utils";

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible','submit']);

const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();

const extensions = inject('extensions');
const models = extensions.map((el) => ({title : el.title, value : el.id}))
const modelOptions = Object.fromEntries(extensions.map(el=> el.options? [el.id,el.options] : null).filter(el=>el!=null));
const selectType = ref(extensions[0].id);

const refVForm = ref({});

const resetForm = () => {
  emit('update:isDialogVisible', false);
}

const onFormSubmit = async() => {
  let { valid: isValid } = await refVForm.value?.validate()  
  if (isValid) {
    let selectedExtension = extensions.find(el=>el.id == selectType.value);
    let project = {
      projectType: selectType.value, //id of extension
      projectTypeTitle: selectedExtension.name, //this.models.find(el=>el.value == this.selectType).text,
      lastUpdate: new Date(),
      extension: selectedExtension, 
      model : null,
      dataset: [],
      labels: [],
      board: "kidbright-mai"
    };
    emit('submit', project);
  }
}

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
          เลือกประเภทโมเดลให้กับโปรเจคนี้
        </VCardTitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VForm ref="refVForm" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12">
              <VSelect :items="models" label="ประเภทการเรียนรู้" v-model="selectType">
              </VSelect>
            </VCol>            
          </VRow>
          <VRow>
            <VCol cols="12" class="text-center mt-3">
              <VBtn type="submit" class="me-3" color="primary">
                เลือกโมเดล
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
