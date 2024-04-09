<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue";
import GenericInputDialog from "@/components/dialog/GenericInputDialog.vue";
import { useBoardStore } from "@/store/board";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";


const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible']);

const boardStore = useBoardStore();
const confirm = useConfirm();

const resetForm = () => {
  emit('update:isDialogVisible', false);
}
const openNewFolderDialog = ref(false);
const currentPath = ref('/root');
const listData = ref([]);
const headers = [
  //{ title : "Type", align: "start", sortable: true, key: "type", value: (item) => item.type === 4 ? 'Folder' : 'File'},
  { title : "Name", align: "start", sortable: true, key: "name" },
  { title : "Size", align: "end", sortable: true, key: "size", value: (item) => beatifySize(item.size)},  
  { title : "Permission", align: "center", sortable: true, key: "permission" },
  //{ title : "Modify", align: "start", sortable: true, key: "mtime", value: (item) => unixTimestampToDate(item.mtime) }
  // add action column to delete file or folder
  { title : "Action", align: "end", key: "action", width: "110"}
]
const loading = ref(false);
const listDir = async (path) => {
  loading.value = true;
  let res = await boardStore.listDir(path);
  //filter out . and ..
  res = res.filter(item => item.name !== '.' && item.name !== '..');
  listData.value = res;
  loading.value = false;
}
const listParentDir = async () => {
  let path = currentPath.value;
  let arr = path.split('/');
  arr.pop();
  path = arr.join('/');
  if(path === '') path = '/';
  await listDir(path);
  currentPath.value = path;
}
//split current path into array
const directoryStructure = computed(() => {
  let path = currentPath.value;
  let arr = path.split('/');
  let res = [];
  for(let i = 0; i < arr.length; i++) {
    let obj = {
      name: arr[i],
      path: arr.slice(0, i + 1).join('/')
    }
    res.push(obj);
  }
  return res;
});

const unixTimestampToDate = (unixTimestamp) => {
  //convert bigint to number
  let tick = Number(unixTimestamp);
  //tick = tick * 1000;
  //unix timestamp modifed time ago  
  //const tick = new Date().getTime() - timestamp;
  //console.log(tick);
  if(tick < 1000) return 'just now';
  if(tick < 60000) return `${Math.floor(tick / 1000)} seconds ago`;
  if(tick < 3600000) return `${Math.floor(tick / 60000)} minutes ago`;
  if(tick < 86400000) return `${Math.floor(tick / 3600000)} hours ago`;
  if(tick < 604800000) return `${Math.floor(tick / 86400000)} days ago`;
  if(tick < 2592000000) return `${Math.floor(tick / 604800000)} weeks ago`;
  if(tick < 31536000000) return `${Math.floor(tick / 2592000000)} months ago`;
  if(tick < 315360000000) return `${Math.floor(tick / 31536000000)} years ago`;
  return 'long time ago';
  //
}
const beatifySize = (size) => {
  size = Number(size);
  if(size < 1024) return `${size} bytes`;
  if(size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
  if(size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`;
  return `${(size / 1073741824).toFixed(2)} GB`;
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
const itemClickAction = async (item) => {
  if(item.type === 4) {
    await listDir(currentPath.value + '/' + item.name);
    if(currentPath.value === '/') {
      currentPath.value = currentPath.value + item.name;
    } else {
      currentPath.value = currentPath.value + '/' + item.name;
    }    
  }
}
const onPathClick = async (item) => {
  await listDir(item.path);
  currentPath.value = item.path;
}

const deleteFileOrFolder = async (item) => {
  try{
    let message = `คุณต้องการลบ ${item.name} ใช่หรือไม่`;
    await confirm({ title: "ยืนยันการลบไฟล์" , content: message , dialogProps: { width: 'auto' } });
    let res = await boardStore.deleteFileOrFolder(currentPath.value + '/' + item.name);
    if(res) {
      toast.info(`ลบไฟล์ ${item.name} สำเร็จ`);
      await listDir(currentPath.value);
    }
  } catch (err) {
    console.log(err);
  } 
}

const onCreateFolder = async (folderName) => {
  try {
    let res = await boardStore.createNewFolder(currentPath.value + '/' + folderName);
    if(res) {
      toast.info(`สร้างโฟลเดอร์ ${folderName} สำเร็จ`);      
      await listDir(currentPath.value);
    }
  } catch (err) {
    console.log(err);
  }
}

const downloadFile = async (item) => {
  try {
    let res = await boardStore.downloadFile(currentPath.value + '/' + item.name);
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

const uploadFile = async () => {
  try {
    //crate file dialog
    let el = document.createElement('input');
    el.type = 'file';    
    el.onchange = async (e) => {
      let file = e.target.files[0];
      console.log("File: ", file);
      let fullPath = currentPath.value + '/' + file.name;
      let res = await boardStore.uploadFile(fullPath, file);
      if(res) {
        toast.info(`อัปโหลดไฟล์ ${file.name} สำเร็จ`);
        await listDir(currentPath.value);
      }
    }
    el.click();


  } catch (err) {
    console.log(err);
  }
}

const currentDirInfo = computed(() => {
  return listData.value.filter(item => item.type === 4 && item.name !== '.' && item.name !== '..');
});

//watch when dialog is visible
watch(() => props.isDialogVisible, async (value) => {
  if(value) {
    await listDir(currentPath.value);
  }
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
        File System Explorer
      </VCardTitle>      
      <VCardItem>
        <VCard color="grey-lighten-4" rounded="lg" flat>
          <VToolbar density="compact" color="primary">                        
            <!-- reload -->
            <VBtn @click="listDir(currentPath)" density="compact" icon color="white" class="mx-2"><VIcon>mdi-reload</VIcon></VBtn>
            <VBtn @click="listParentDir" density="compact" icon color="white" class="mx-2"><VIcon>mdi-undo-variant</VIcon></VBtn>
            <VToolbarTitle>
              <!-- display path -->
              <template v-for="(item, index) in directoryStructure">
                <span @click="onPathClick(item)" class="cursor-pointer text-decoration-underline">
                  {{ item.name }}
                </span>
                <span v-if="index < directoryStructure.length - 1">/</span>
              </template>
            </VToolbarTitle>
            <VSpacer></VSpacer>
            <VBtn @click="openNewFolderDialog = true" icon="mdi-folder-plus" density="compact" color="white" class="mx-2"></VBtn>
            <VBtn @click="uploadFile" icon="mdi-upload" density="compact" color="white" class="mx-2"></VBtn>            
          </VToolbar>
          <VLayout>
            <!-- <VNavigationDrawer absolute permanent>
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
            </VNavigationDrawer> -->
            <VMain style="min-height: 700px;">
              <VDataTable
                :items="listData"
                :headers="headers"
                height="700"
                :loading="loading"
                :loading-text="'... กำลังโหลดข้อมูล ...'"
                :no-data-text="'ไม่พบข้อมูล'"
                :no-results-text="'ไม่พบข้อมูลที่ค้นหา'"
                fixed-header
                :items-per-page="500"
              >
                <template v-slot:item.name="{ item }">
                  <VIcon v-if="item.type === 4" color="primary">mdi-folder</VIcon>
                  <VIcon v-else-if="item.type === 8" color="yellow-darken-4">mdi-file</VIcon>
                  <!-- link click url -->
                  <span v-if="item.type === 4" 
                    @click="itemClickAction(item)"
                    class="ms-1 cursor-pointer text-decoration-underline"
                  >
                    {{ item.name }}
                  </span>
                  <span v-else class="ms-1">
                    {{ item.name }}
                  </span>
                </template>
                <!-- action column -->
                <template v-slot:item.action="{ item }">
                  <VBtn @click="downloadFile(item)" variant="plain" v-if="item.type === 8" icon="mdi-download" color="green" density="compact" class="mx-1"></VBtn>
                  <VBtn @click="deleteFileOrFolder(item)" variant="plain" icon="mdi-delete" color="red" density="compact" class="mx-1"></VBtn>
                  <!-- download when is file -->                  
                </template>
              </VDataTable>
            </VMain>
          </VLayout>
        </VCard>
      </VCardItem>
      <GenericInputDialog @value="onCreateFolder" v-model:isDialogVisible="openNewFolderDialog" title="Create New Folder" label="Folder Name" buttonName="Create Folder"/>
    </VCard>    
  </VDialog>  
</template>
