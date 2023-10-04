<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue";
import { useBoardStore } from "@/store/board";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "@/store/workspace";
import { onMounted } from "vue";

import BlockProgramming from "@/assets/images/icons/jigsaw.png";
import PythonProgramming from "@/assets/images/icons/python.png";

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible','submit']);

const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();
const confirm = useConfirm();

//TODO : edit this default assigned board
const projectInfo = ref({  
  name: 'EasyKids-IDE Project Demo',
  board: 'easy-kids-robot-kit', //board id
  mode: 'block',
});

const refVForm = ref({});

const resetForm = () => {
  emit('update:isDialogVisible', false);
}

const onFormSubmit = async() => {
  let { valid: isValid } = await refVForm.value?.validate()  
  if (isValid) {
    emit('submit', projectInfo.value);
  }
}

</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '1000'"
    :model-value="props.isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn
        variant="text"
        size="small"
        @click="resetForm"
      />
      <VCardItem>
        <VCardTitle class="text-h5 text-center">
          Create New Project
        </VCardTitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VCardSubtitle class="text-center mb-8">
          Please select your board to create new project.
        </VCardSubtitle>
        <VForm ref="refVForm" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="projectInfo.name"
                label="Project Name"
                outlined
                dense
                clearable
                :rules="[
                  (v) => !!v || 'Project name is required',
                  (v) => (v && v.length <= 60) || 'Project name must be less than 60 characters',
                ]"
              />
            </VCol>
          </VRow>
          <VItemGroup mandatory class="mt-2" selected-class="bg-primary" v-model="projectInfo.mode">
            <VRow>
              <VCol cols="12" md="6">
                <VItem value="block" v-slot="{ isSelected, selectedClass, toggle }">
                  <VCard :class="[selectedClass]" @click="toggle">
                    <VCardTitle class="text-h6 text-center">
                      Block Programming
                    </VCardTitle>
                    <VCardItem class="d-flex justify-center">
                      <img :src="BlockProgramming" width="60" height="60"/>
                    </VCardItem>
                    <VCardSubtitle class="text-center mb-3">
                      Programming with block for beginner
                    </VCardSubtitle>
                  </VCard>
                </VItem>
              </VCol>
              <VCol cols="12" md="6">
                <VItem value="code" v-slot="{ isSelected, selectedClass, toggle }">
                  <VCard :class="[selectedClass]" dark @click="toggle">
                    <VCardTitle class="text-h6 text-center">
                      Python Programming
                    </VCardTitle>
                    <VCardItem class="d-flex justify-center">
                      <img :src="PythonProgramming" width="60" height="60"/>
                    </VCardItem>
                    <VCardSubtitle class="text-center mb-3">
                      Programming with python for advanced user
                    </VCardSubtitle>                    
                  </VCard>
                </VItem>
              </VCol>
            </VRow>
          </VItemGroup>
          <!--div class="text-h6 mt-3 mb-3">
            Select your board
          </div>
          <VItemGroup mandatory selected-class="bg-primary">
            <VRow>
              <VCol v-for="(board,index) in workspaceStore.boards" cols="12" md="6">
                <VItem :value="board.id" v-slot="{ isSelected, selectedClass, toggle }">
                  <VCard class="pa-1" :class="[selectedClass]" dark @click="toggle">
                    <VCardTitle class="text-h6">
                      {{ board.name }}
                    </VCardTitle>
                    <VCardSubtitle class="">
                      Version : {{ board.version }}
                    </VCardSubtitle>
                    <VCardItem class="d-flex justify-center">
                      <img :src="`${board.path}/${board.image}`" height="200"/>
                    </VCardItem>                                    
                  </VCard>
                </VItem>
              </VCol>
            </VRow>
          </VItemGroup-->
          <VRow>
            <VCol cols="12" class="text-center mt-3">
              <VBtn type="submit" class="me-3" color="primary">
                CREATE NEW PROJECT
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
