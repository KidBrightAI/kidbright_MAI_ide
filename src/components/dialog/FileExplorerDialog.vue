<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"
import GenericInputDialog from "@/components/dialog/GenericInputDialog.vue"
import { useBoardStore } from "@/store/board"
import { useConfirm } from "@/components/comfirm-dialog"
import { toast } from "vue3-toastify"

const isDialogVisible = defineModel("isDialogVisible", { type: Boolean, default: false })

const ROOT_PATH = "/root"

const boardStore = useBoardStore()
const confirm = useConfirm()

const currentPath = ref(ROOT_PATH)
const entries     = ref([])
const loading     = ref(false)
const newFolderDialog = ref(false)

watch(isDialogVisible, isOpen => {
  if (isOpen) refresh()
})

// =========================================================== navigation

async function refresh() {
  loading.value = true
  try {
    const list = await boardStore.listDir(currentPath.value)
    entries.value = list.filter(e => e.name !== "." && e.name !== "..")
  } finally {
    loading.value = false
  }
}

function joinPath(base, name) {
  return base === "/" ? `/${name}` : `${base}/${name}`
}

async function enter(item) {
  if (item.type !== "dir") return
  currentPath.value = joinPath(currentPath.value, item.name)
  await refresh()
}

async function jumpTo(path) {
  currentPath.value = path || "/"
  await refresh()
}

async function goUp() {
  if (currentPath.value === "/") return
  const parts = currentPath.value.split("/").filter(Boolean)
  parts.pop()
  currentPath.value = parts.length ? "/" + parts.join("/") : "/"
  await refresh()
}

const breadcrumb = computed(() => {
  const acc = [{ title: "/", path: "/" }]
  if (currentPath.value === "/") return acc
  let p = ""
  for (const part of currentPath.value.split("/").filter(Boolean)) {
    p += "/" + part
    acc.push({ title: part, path: p })
  }
  return acc
})

const sortedEntries = computed(() => {
  // Folders first, then files; alphabetical within each.
  return [...entries.value].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1
    return a.name.localeCompare(b.name)
  })
})

// =========================================================== item actions

async function downloadItem(item) {
  await boardStore.downloadFile(joinPath(currentPath.value, item.name))
}

async function deleteItem(item) {
  try {
    await confirm({
      title: "ยืนยันการลบ",
      content: `ลบ "${item.name}" ใช่หรือไม่?`,
      dialogProps: { width: "auto" },
    })
  } catch (_) { return }
  const ok = await boardStore.deleteFileOrFolder(joinPath(currentPath.value, item.name))
  if (ok) {
    toast.info(`ลบ "${item.name}" แล้ว`)
    await refresh()
  }
}

async function createFolder(name) {
  if (!name) return
  const ok = await boardStore.createNewFolder(joinPath(currentPath.value, name))
  if (ok) {
    toast.info(`สร้างโฟลเดอร์ "${name}"`)
    await refresh()
  }
}

function uploadFile() {
  const input = document.createElement("input")
  input.type = "file"
  input.onchange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    const ok = await boardStore.uploadFile(joinPath(currentPath.value, file.name), file)
    if (ok) {
      toast.info(`อัปโหลด "${file.name}" แล้ว`)
      await refresh()
    }
  }
  input.click()
}

// =========================================================== presentation

const FILE_ICONS = {
  py:    "mdi-language-python",
  json:  "mdi-code-json",
  yaml:  "mdi-code-braces",
  yml:   "mdi-code-braces",
  md:    "mdi-language-markdown",
  txt:   "mdi-file-document-outline",
  log:   "mdi-file-document-outline",
  sh:    "mdi-bash",
  png:   "mdi-file-image",
  jpg:   "mdi-file-image",
  jpeg:  "mdi-file-image",
  bmp:   "mdi-file-image",
  wav:   "mdi-file-music",
  mp3:   "mdi-file-music",
  mp4:   "mdi-file-video",
  zip:   "mdi-folder-zip",
  tar:   "mdi-folder-zip",
  gz:    "mdi-folder-zip",
}

function iconFor(item) {
  if (item.type === "dir") return "mdi-folder"
  const ext = item.name.split(".").pop().toLowerCase()
  return FILE_ICONS[ext] || "mdi-file-outline"
}

function iconColor(item) {
  return item.type === "dir" ? "amber-darken-2" : "blue-grey"
}

function humanSize(bytes) {
  const n = Number(bytes || 0)
  if (n < 1024)        return `${n} B`
  if (n < 1024 ** 2)   return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3)   return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(1)} GB`
}

function formatTime(unixSec) {
  const t = Number(unixSec || 0)
  if (!t) return ""
  return new Date(t * 1000).toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 1000"
    persistent
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn variant="text" size="small" @click="isDialogVisible = false" />

      <VCardTitle class="text-h5">
        <VIcon class="me-2">mdi-folder-open</VIcon>
        File Explorer
      </VCardTitle>

      <VToolbar density="compact" color="primary">
        <VBtn
          v-tooltip:bottom="'ขึ้นหนึ่งระดับ'"
          icon="mdi-arrow-up"
          variant="text"
          color="white"
          :disabled="currentPath === '/'"
          @click="goUp"
        />
        <VBtn
          v-tooltip:bottom="'รีเฟรช'"
          icon="mdi-refresh"
          variant="text"
          color="white"
          @click="refresh"
        />

        <div class="d-flex align-center px-3 text-white text-body-2 breadcrumb-row">
          <template v-for="(crumb, i) in breadcrumb" :key="crumb.path">
            <VIcon v-if="i > 0" size="small" color="white">mdi-chevron-right</VIcon>
            <span class="breadcrumb-segment" @click="jumpTo(crumb.path)">
              {{ crumb.title }}
            </span>
          </template>
        </div>

        <VSpacer />

        <VBtn
          v-tooltip:bottom="'สร้างโฟลเดอร์ใหม่'"
          icon="mdi-folder-plus"
          variant="text"
          color="white"
          @click="newFolderDialog = true"
        />
        <VBtn
          v-tooltip:bottom="'อัปโหลดไฟล์'"
          icon="mdi-upload"
          variant="text"
          color="white"
          @click="uploadFile"
        />
      </VToolbar>

      <!-- ============================== body ============================== -->
      <div class="explorer-body">
        <VProgressLinear v-if="loading" indeterminate color="primary" height="2" />

        <div v-if="!loading && !sortedEntries.length" class="empty-state">
          <VIcon size="64" color="grey-lighten-1">mdi-folder-open-outline</VIcon>
          <div class="text-body-1 text-grey-darken-1 mt-3">โฟลเดอร์ว่างเปล่า</div>
        </div>

        <VList v-else density="compact" class="bg-transparent pa-0">
          <VListItem
            v-for="item in sortedEntries"
            :key="item.name"
            :class="{ 'item-clickable': item.type === 'dir' }"
            class="explorer-row"
            @click="enter(item)"
          >
            <template #prepend>
              <VIcon :color="iconColor(item)" size="26" class="me-2">
                {{ iconFor(item) }}
              </VIcon>
            </template>

            <VListItemTitle class="text-body-2">{{ item.name }}</VListItemTitle>
            <VListItemSubtitle class="text-caption text-grey-darken-1">
              <span v-if="item.type === 'file'">{{ humanSize(item.size) }}</span>
              <span v-if="item.type === 'file' && item.mtime" class="ms-2">
                · {{ formatTime(item.mtime) }}
              </span>
              <span v-else-if="item.mtime">{{ formatTime(item.mtime) }}</span>
            </VListItemSubtitle>

            <template #append>
              <VBtn
                v-if="item.type === 'file'"
                icon="mdi-download"
                variant="text"
                density="compact"
                size="small"
                color="primary"
                @click.stop="downloadItem(item)"
              />
              <VBtn
                icon="mdi-delete-outline"
                variant="text"
                density="compact"
                size="small"
                color="red"
                @click.stop="deleteItem(item)"
              />
            </template>
          </VListItem>
        </VList>
      </div>

      <GenericInputDialog
        v-model:isDialogVisible="newFolderDialog"
        title="สร้างโฟลเดอร์ใหม่"
        label="ชื่อโฟลเดอร์"
        button-name="สร้าง"
        @value="createFolder"
      />
    </VCard>
  </VDialog>
</template>

<style scoped>
.explorer-body {
  min-height: 500px;
  max-height: 70vh;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

.explorer-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background-color 0.15s ease;
}
.explorer-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.item-clickable {
  cursor: pointer;
}

.breadcrumb-row {
  overflow-x: auto;
  white-space: nowrap;
}
.breadcrumb-segment {
  cursor: pointer;
  padding: 0 4px;
  border-radius: 3px;
  transition: background-color 0.15s ease;
}
.breadcrumb-segment:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
</style>
