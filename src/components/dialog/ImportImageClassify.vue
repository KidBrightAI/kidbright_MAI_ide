<script setup>
import { randomId } from "@/components/utils"
import { importBoardImagesToDataset } from "@/engine/helper"
import BoardImagePicker from "@/components/BoardImagePicker.vue"
import { useDatasetStore } from "@/store/dataset"
import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"
import { toast } from "vue3-toastify"

const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })

const datasetStore   = useDatasetStore()
const workspaceStore = useWorkspaceStore()
const boardStore     = useBoardStore()

const source             = ref("pc")          // "pc" | "board"
const files              = ref([])            // PC mode: File[]
const boardSelectedPaths = ref([])            // Board mode: absolute paths
const importWithLabel    = ref(false)
const step               = ref(1)             // 1=select, 2=importing, 3=done
const progress           = ref(0)
const percentage         = ref(0)
const totalCount         = ref(0)
const failures           = ref(0)

const canImport = computed(() => {
  if (source.value === "pc") return files.value.length > 0
  return boardSelectedPaths.value.length > 0
})

const importImages = async e => {
  if (step.value !== 1) return
  e.preventDefault()
  step.value = 2
  progress.value = 0
  percentage.value = 0
  failures.value = 0

  if (source.value === "pc") {
    await importFromPc(files.value)
  } else {
    totalCount.value = boardSelectedPaths.value.length
    const result = await importBoardImagesToDataset({
      paths: boardSelectedPaths.value,
      boardStore,
      datasetStore,
      onProgress: (done, total) => {
        progress.value = done
        percentage.value = Math.round((done / total) * 100)
      },
    })
    failures.value = result.failures
  }
  step.value = 3
  if (failures.value > 0) {
    toast.warning(`นำเข้าข้อมูลสำเร็จเพียงบางส่วน ดาวน์โหลดไม่สำเร็จจำนวน ${failures.value} ไฟล์`)
  } else {
    toast.success("นำเข้าข้อมูลสำเร็จ")
  }
}

async function importFromPc(fileList) {
  totalCount.value = fileList.length
  const dataset = []
  const labels = []
  for (const file of fileList) {
    let label = null
    if (importWithLabel.value) {
      const path = file.$path || file.webkitRelativePath
      if (path && path.includes("/")) {
        const dirs = path.split("/")
        if (dirs[0]) label = dirs[0]
      }
      if (label && !labels.includes(label)) {
        labels.push(label)
        workspaceStore.addLabel({ label })
      }
    }
    const data = {
      id: randomId(16),
      image: file,
      annotate: [],
      class: importWithLabel.value ? label : null,
      ext: file.name.split(".").pop(),
    }
    await datasetStore.addDataToFs(data)
    delete data.image
    dataset.push(data)
    progress.value += 1
    percentage.value = Math.round((progress.value / totalCount.value) * 100)
  }
  datasetStore.addDatasetItems(dataset)
}

const resetAndClose = () => {
  files.value = []
  boardSelectedPaths.value = []
  importWithLabel.value = false
  source.value = "pc"
  step.value = 1
  progress.value = 0
  percentage.value = 0
  totalCount.value = 0
  failures.value = 0
  isDialogVisible.value = false
}
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 640"
    persistent
  >
    <VCard>
      <VCardTitle class="bg-primary d-flex flex-row">
        นำเข้ารูปภาพ
        <VSpacer />
        <VBtn
          density="compact"
          icon="mdi-close"
          @click="resetAndClose"
        />
      </VCardTitle>

      <VTabs
        v-if="step === 1"
        v-model="source"
        color="primary"
        align-tabs="center"
        grow
      >
        <VTab value="pc">
          <VIcon start>
            mdi-folder
          </VIcon>
          เครื่อง PC
        </VTab>
        <VTab value="board">
          <VIcon start>
            mdi-developer-board
          </VIcon>
          บอร์ด
        </VTab>
      </VTabs>

      <VWindow
        v-if="step === 1"
        v-model="source"
      >
        <!-- ========================================== PC tab -->
        <VWindowItem value="pc">
          <VCardItem>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-center my-2"
              >
                <img
                  src="@/assets/images/png/khanomchan-import.png"
                  height="160"
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
        </VWindowItem>

        <!-- ========================================== Board tab -->
        <VWindowItem value="board">
          <BoardImagePicker
            v-model="boardSelectedPaths"
            :active="source === 'board'"
          />
        </VWindowItem>
      </VWindow>

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
            กำลังนำเข้า ...<br> {{ progress }} / {{ totalCount || "" }}
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
          :disabled="!canImport"
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
