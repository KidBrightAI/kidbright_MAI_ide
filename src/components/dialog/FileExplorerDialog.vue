<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue";
import { useBoardStore } from "@/store/board";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "@/store/workspace";
import { onMounted } from "vue";

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible']);

const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();
const confirm = useConfirm();

const refVForm = ref({});

const resetForm = () => {
  emit('update:isDialogVisible', false);
}
const open = ref(['User']);
const currentPath = ref('/root');
const listData = ref([]);

const listDir = async (path) => {
  const res = await boardStore.listDir(path);
  listData.value = res;
}
/* array of dir info 
{
  mode: 16877
  mtime: 1693568606n
  name: "System Volume Information"
  permission: 493
  size: 16384n
  type: 4
},
{
  mode: 33261
  mtime: 315532800n
  name: "main.py"
  permission: 493
  size: 616n
  type: 8
}
*/
const currentDirInfo = computed(() => {
  return listData.value.filter(item => item.type === 4 && item.name !== '.' && item.name !== '..');
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '1000'"
    :model-value="props.isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn variant="text" size="small" @click="resetForm"/>
      <VCardTitle class="text-h5 text-center">
        File Explorer
      </VCardTitle>      
      <VCardItem>
        <VCard color="grey-lighten-4" rounded="lg" flat>
          <VToolbar density="compact" color="primary">            
            <VBtn density="compact" icon color="white" @click="listDir('/root')"><VIcon>mdi-reload</VIcon></VBtn>
            <VBtn density="compact" icon color="white"><VIcon>mdi-undo-variant</VIcon></VBtn>
            <VToolbarTitle>>root/</VToolbarTitle>
            <VSpacer></VSpacer>
            <VBtn icon density="compact" color="white" class="mx-2"><VIcon>mdi-folder-plus</VIcon></VBtn>
            <VBtn icon density="compact" color="white" class="mx-2"><VIcon>mdi-upload</VIcon></VBtn>
            <VBtn icon density="compact" color="white" class="mx-2 me-4"><VIcon>mdi-download</VIcon></VBtn>
          </VToolbar>
          <VLayout>
            <VNavigationDrawer absolute permanent>
              <VDivider></VDivider>
              <VList v-model:opened="open" :lines="false" density="compact" nav>
                <VListGroup v-for="item in currentDirInfo" :value="item.name" :key="item.name">
                  <template v-slot:activator="{props, isOpen}">
                    <VListItem 
                      :title="item.name"
                      v-bind="props" 
                      :prepend-icon="!isOpen? 'mdi-folder': 'mdi-folder-open'"
                    >         
                    </VListItem>
                  </template>                  
                </VListGroup>
              </VList>
            </VNavigationDrawer>
            <VMain style="min-height: 500px;">
              <VDataTable
                :items="listData"
                :headers="['Name', 'Size', 'Type', 'Permission', 'Mtime']"
                :items-per-page="10"
                :search="true"
                :loading="false"
                :loading-text="''"
                :no-data-text="''"
                :no-results-text="''"
                :footer-props="{
                  'items-per-page-options': [10, 20, 30, 40, 50]
                }"
              >
                <template v-slot:item.name="{ item }">
                  <VListItemTitle>
                    <VIcon v-if="item.type === 4">mdi-folder</VIcon>
                    <VIcon v-else>mdi-file</VIcon>
                    {{ item.name }}
                  </VListItemTitle>
                </template>
                <template v-slot:item.size="{ item }">
                  {{ item.size }}
                </template>
                <template v-slot:item.type="{ item }">
                  {{ item.type }}
                </template>
                <template v-slot:item.permission="{ item }">
                  {{ item.permission }}
                </template>
                <template v-slot:item.mtime="{ item }">
                  {{ item.mtime }}
                </template>
              </VDataTable>
            </VMain>
          </VLayout>
        </VCard>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
