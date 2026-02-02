<script setup>
import { randomId } from "@/components/utils"
import { sleep } from "@/engine/helper"
import { useDatasetStore } from "@/store/dataset"
import { useWorkspaceStore } from "@/store/workspace"
import { toast } from "vue3-toastify"

const props = defineProps({
  isDialogVisible: Boolean,
})
const emit = defineEmits(['update:isDialogVisible'])
const datasetStore = useDatasetStore()
const workspaceStore = useWorkspaceStore()

const files = ref([])
const importWithLabel = ref(false)
const step = ref(1) //1= select file , 2 = importing, 3 = import success
const progress = ref(0)
const percentage = ref(0)

const importImages = async e=>{
  if(step.value == 1){ //selecting file
    e.preventDefault()
    step.value = 2
    let dataset = []
    progress.value = 0
    let labels = []
    for(let file of files.value){
      let label = null
      if(importWithLabel.value){ //check parent dirs
        let path = file.$path || file.webkitRelativePath
        if(path && path.includes("/")){
          let dirs = path.split("/")
          if(dirs[0]){
            label = dirs[0]
          }
        }
        if(!labels.includes(label)){
          labels.push(label)
          workspaceStore.addLabel({label : label})
        }
      }
      let data = {
        id : randomId(16),

        //thumbnail : thumbnail,
        image: file,
        annotate : [],
        class: importWithLabel.value ? label : null,
        ext : file.name.split(".").pop(),
      }
      await datasetStore.addDataToFs(data)
      delete data.image
      dataset.push(data)
      progress.value+=1
      percentage.value= Math.round(progress.value/files.value.length*100)

      //await this.delay(100);
    }
    step.value = 3
    toast.success("นำเข้าข้อมูลสำเร็จ")
    datasetStore.addDatasetItems(dataset)
  }else if(step.value == 3){
    //import success 
  }
}
const resetAndClose = e=>{
  files.value = []
  importWithLabel.value = false
  step.value = 1
  progress.value = 0
  emit('update:isDialogVisible', false)
  
  return
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    width="auto"
    persistent
  >
    <VCard width="480">
      <VCardTitle class="bg-primary d-flex flex-row">
        นำเข้ารูปภาพ
        <VSpacer />
        <VBtn
          density="compact"
          icon="mdi-close"
          @click="resetAndClose"
        />
      </VCardTitle>
      <VCardItem v-if="step == 1">
        <VRow>
          <VCol
            cols="12"
            class="d-flex justify-center my-2"
          >
            <img
              src="@/assets/images/png/khanomchan-import.png"
              height="200"
            >
          </VCol>  
          <VCol
            cols="12"
            class="pb-0"
          >
            <VFileInput
              v-model="files"
              color="primary"
              label="เลือก Folder รูปภาพ"
              multiple
              density="compact"
              counter
              webkitdirectory
              directory
              :show-size="1024"
            >
              <template #selection="{ fileNames }">
                <template
                  v-for="(fileName, index) in fileNames"
                  :key="fileName"
                >
                  <VChip
                    v-if="index < 3"
                    color="primary"
                    label
                    size="small"
                    class="me-2"
                  >
                    {{ fileName }}
                  </VChip>
                  <span
                    v-else-if="index === 3"
                    class="text-overline text-grey-darken-3 mx-2"
                  >
                    +{{ files.length - 3 }} File(s)
                  </span>
                </template>
              </template>
            </VFileInput>
          </VCol>
          <VCol
            cols="12"
            class="pt-0 py-3 ps-5"
          >
            <VSwitch
              v-model="importWithLabel"
              label="นำเข้าพร้อมกับชื่อโฟลเดอร์"
              dense
            />
          </VCol>
          <VExpandTransition>
            <VCol
              v-show="importWithLabel"
              cols="12"
            >
              <VDivider class="mb-3" />
              <span>ภาพทั้งหมดจะตั้งชื่อตามโฟลเดอร์หลักที่เลือก</span>
              <img
                class="ps-5"
                src="@/assets/images/png/import_note_anno.png"
                height="100"
              >
            </VCol>
          </VExpandTransition>
        </VRow>
      </VCardItem>
      <VCardItem
        v-if="step >= 2"
        class="d-flex align-center justify-center"
      >
        <VProgressCircular
          :rotate="360"
          :size="200"
          :width="30"
          :model-value="percentage"
          color="primary"
        >
          <h4
            v-if="step == 2"
            class="my-3 text-center"
            text-black
          >
            กำลังนำเข้า ...<br> {{ progress }} / {{ files.length || "" }}
          </h4>
          <h4
            v-else-if="step == 3"
            class="my-3"
            text-black
          >
            นำเข้าสำเร็จ
          </h4>
        </VProgressCircular>
      </VCardItem>
      <VCardActions>
        <VSpacer />
        <VBtn
          v-if="step == 1"
          color="secondary"
          variant="flat"
          @click="resetAndClose"
        >
          ยกเลิก
        </VBtn>
        <VBtn
          v-if="step == 1"
          color="primary"
          variant="flat"
          @click="importImages"
        >
          นำเข้า
        </VBtn>
        <VBtn
          v-if="step == 3"
          color="primary"
          variant="flat"
          @click="resetAndClose"
        >
          ปิด
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
