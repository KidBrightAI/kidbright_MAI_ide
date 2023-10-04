<script setup>
import VueMarkdown from 'vue-markdown-render'

import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue";
import { useBoardStore } from "@/store/board";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "@/store/workspace";
import { onMounted } from "vue";

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible','loadExample']);

const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();
const confirm = useConfirm();

const refVForm = ref({});

const resetForm = () => {
  emit('update:isDialogVisible', false);
}

</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '1000'"
    :model-value="props.isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn variant="text" size="small" @click="resetForm"/>
      <VCardTitle class="text-h5 text-center">
        Board Example
        </VCardTitle>
      <VCardSubtitle class="text-center mb-8">
        Select example to load
      </VCardSubtitle>
      <VCardItem>        
        <div class="text-subtitle-2 mb-3 ml-2">{{workspaceStore.currentBoard.name}}</div>
        <VExpansionPanels>
          <VExpansionPanel
            v-for="example of workspaceStore.currentBoard.examples"
            :key="example.name"
            :title="example.name"
          >
            <VExpansionPanelText>
              <VueMarkdown :source="example.content" /> 
              <div class="text-center">
                <VBtn class="mx-2 my-3" color="primary" @click="emit('loadExample','block', example)">
                  Open Block
                </VBtn>
                <VBtn class="mx-2 my-3" color="primary" @click="emit('loadExample','code', example)">
                  Open Code
                </VBtn>
              </div>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
