<script setup>
/**
 * Board file picker for image imports. Renders a list/grid file
 * browser over the active protocol's `listDir` + `readFile`, and
 * exposes the current selection as an array of absolute paths via
 * `v-model`. The host dialog is responsible for converting paths
 * to dataset entries on import (see `importBoardImagesToDataset`
 * in `engine/helper.js`).
 *
 * Thumbnails: when the current dir contains a `.thumbnail/` sibling
 * (MaixCAM camera-app convention — 128×128 JPEGs named identically
 * to originals), grid mode lazy-fetches them at 4 concurrent. When
 * absent, grid mode shows icon-only cells; we don't fall back to
 * fetching full images, that's too slow over wss.
 */

import { useBoardStore } from "@/store/board"
import { useWorkspaceStore } from "@/store/workspace"

const props = defineProps({
  modelValue:     { type: Array,   default: () => [] },
  active:         { type: Boolean, default: true },
  defaultPath:    { type: String,  default: "" },
  fileExtensions: {
    type: Array,
    default: () => ["jpg", "jpeg", "png", "bmp", "gif", "webp"],
  },
})
const emit = defineEmits(["update:modelValue"])

const boardStore     = useBoardStore()
const workspaceStore = useWorkspaceStore()

// =========================================================== filters
const extSet = computed(
  () => new Set(props.fileExtensions.map(e => e.toLowerCase())),
)
const isAllowedFile = name => {
  const ext = name.split(".").pop()?.toLowerCase()
  return ext && extSet.value.has(ext)
}

const initialPath = computed(
  () => props.defaultPath || workspaceStore.currentBoard?.pictureDir || "/root",
)

// =========================================================== browser state
const boardPath    = ref(initialPath.value)
const boardEntries = ref([])
const boardLoading = ref(false)
const viewMode     = ref("grid")   // "list" | "grid"

const boardAvailable = computed(
  () => boardStore.connected && boardStore.capabilities.fileExplorer,
)

// `.thumbnail` is the camera-app helper dir — used by us under the
// hood, never shown to the student.
const HIDDEN_DIRS = new Set([".thumbnail"])

const sortedBoardEntries = computed(() => {
  return [...boardEntries.value]
    .filter(e => e.name !== "." && e.name !== "..")
    .filter(e => !(e.type === "dir" && HIDDEN_DIRS.has(e.name)))
    .filter(e => e.type === "dir" || isAllowedFile(e.name))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1
      return a.name.localeCompare(b.name)
    })
})

const boardFilesInDir = computed(
  () => sortedBoardEntries.value.filter(e => e.type === "file"),
)

const hasThumbnailDir = computed(() =>
  boardEntries.value.some(e => e.type === "dir" && e.name === ".thumbnail"),
)

// =========================================================== selection (v-model)
// Set is rebuilt on each change so the watcher round-trips through
// the parent's v-model cleanly — Vue can't deep-track Set internals.
const selectedSet = computed(() => new Set(props.modelValue))

function isSelected(item) {
  return selectedSet.value.has(joinPath(boardPath.value, item.name))
}

function toggleSelect(item) {
  if (item.type !== "file") return
  const abs = joinPath(boardPath.value, item.name)
  const next = new Set(selectedSet.value)
  if (next.has(abs)) next.delete(abs)
  else next.add(abs)
  emit("update:modelValue", [...next])
}

function selectAllInDir() {
  const next = new Set(selectedSet.value)
  for (const item of boardFilesInDir.value) {
    next.add(joinPath(boardPath.value, item.name))
  }
  emit("update:modelValue", [...next])
}

function clearSelection() {
  emit("update:modelValue", [])
}

// =========================================================== navigation
function joinPath(base, name) {
  if (base === "/") return `/${name}`
  return `${base.replace(/\/$/, "")}/${name}`
}

function thumbnailPath(absPath) {
  const i = absPath.lastIndexOf("/")
  return `${absPath.substring(0, i)}/.thumbnail/${absPath.substring(i + 1)}`
}

async function refreshBoard() {
  if (!boardAvailable.value) return
  boardLoading.value = true
  try {
    const list = await boardStore.listDir(boardPath.value)
    boardEntries.value = list || []
  } finally {
    boardLoading.value = false
  }
  if (viewMode.value === "grid") loadThumbsForCurrentDir()
}

async function enterDir(item) {
  if (item.type !== "dir") return
  boardPath.value = joinPath(boardPath.value, item.name)
  await refreshBoard()
}

async function goUp() {
  if (boardPath.value === "/") return
  const parts = boardPath.value.split("/").filter(Boolean)
  parts.pop()
  boardPath.value = parts.length ? "/" + parts.join("/") : "/"
  await refreshBoard()
}

async function jumpTo(path) {
  boardPath.value = path || "/"
  await refreshBoard()
}

const breadcrumb = computed(() => {
  const acc = [{ title: "/", path: "/" }]
  if (boardPath.value === "/") return acc
  let p = ""
  for (const part of boardPath.value.split("/").filter(Boolean)) {
    p += "/" + part
    acc.push({ title: part, path: p })
  }
  return acc
})

// =========================================================== thumbnail loader
const thumbnailCache   = ref(new Map())   // absPath -> blobURL | null
const thumbnailLoading = ref(new Set())   // absPath in flight
let thumbLoadGen = 0

function thumbState(item) {
  const abs = joinPath(boardPath.value, item.name)
  if (thumbnailCache.value.has(abs)) {
    return thumbnailCache.value.get(abs) ? "loaded" : "failed"
  }
  return hasThumbnailDir.value ? "loading" : "none"
}

function thumbUrl(item) {
  return thumbnailCache.value.get(joinPath(boardPath.value, item.name)) || null
}

async function fetchThumbnail(absPath) {
  if (thumbnailCache.value.has(absPath) || thumbnailLoading.value.has(absPath)) return
  const myGen = thumbLoadGen
  thumbnailLoading.value = new Set([...thumbnailLoading.value, absPath])

  const blob = await boardStore.readFile(thumbnailPath(absPath))

  // Drop late results: a navigation or unmount happened while we
  // were fetching. The blob is GC'd; URL.createObjectURL would leak.
  if (myGen !== thumbLoadGen) return

  const url = blob ? URL.createObjectURL(blob) : null
  const cache = new Map(thumbnailCache.value)
  cache.set(absPath, url)
  thumbnailCache.value = cache

  const done = new Set(thumbnailLoading.value)
  done.delete(absPath)
  thumbnailLoading.value = done
}

async function loadThumbsForCurrentDir() {
  if (!hasThumbnailDir.value) return
  const myGen = ++thumbLoadGen
  const targets = boardFilesInDir.value
    .map(it => joinPath(boardPath.value, it.name))
    .filter(p => !thumbnailCache.value.has(p))
  for (let i = 0; i < targets.length; i += 4) {
    if (myGen !== thumbLoadGen) return
    await Promise.all(targets.slice(i, i + 4).map(fetchThumbnail))
  }
}

function clearThumbnailCache() {
  for (const url of thumbnailCache.value.values()) {
    if (url) URL.revokeObjectURL(url)
  }
  thumbnailCache.value = new Map()
  thumbnailLoading.value = new Set()
  thumbLoadGen++
}

// =========================================================== lifecycle
async function tryAutoLoad() {
  if (props.active && boardAvailable.value && !boardEntries.value.length) {
    boardPath.value = initialPath.value
    await refreshBoard()
  }
}

watch(() => props.active, tryAutoLoad, { immediate: true })
watch(boardAvailable, tryAutoLoad)

watch(viewMode, newMode => {
  if (newMode === "grid" && boardEntries.value.length) {
    loadThumbsForCurrentDir()
  }
})

onBeforeUnmount(clearThumbnailCache)

// =========================================================== formatters
function humanSize(bytes) {
  const n = Number(bytes || 0)
  if (n < 1024)        return `${n} B`
  if (n < 1024 ** 2)   return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3)   return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(1)} GB`
}
</script>

<template>
  <div
    v-if="!boardAvailable"
    class="text-center py-10 px-6"
  >
    <VIcon
      size="64"
      color="grey-lighten-1"
    >
      mdi-developer-board
    </VIcon>
    <p class="text-body-2 text-grey-darken-1 mt-3">
      {{ boardStore.connected ? "บอร์ดรุ่นนี้ไม่รองรับการเรียกดูไฟล์" : "กรุณาเชื่อมต่อบอร์ดก่อน" }}
    </p>
  </div>
  <div v-else>
    <VToolbar
      density="compact"
      color="primary"
      flat
    >
      <VBtn
        v-tooltip:bottom="'ขึ้นหนึ่งระดับ'"
        icon="mdi-arrow-up"
        variant="text"
        color="white"
        :disabled="boardPath === '/'"
        @click="goUp"
      />
      <VBtn
        v-tooltip:bottom="'รีเฟรช'"
        icon="mdi-refresh"
        variant="text"
        color="white"
        @click="refreshBoard"
      />
      <div class="d-flex align-center px-2 text-white text-body-2 breadcrumb-row">
        <template
          v-for="(crumb, i) in breadcrumb"
          :key="crumb.path"
        >
          <VIcon
            v-if="i > 0"
            size="small"
            color="white"
          >
            mdi-chevron-right
          </VIcon>
          <span
            class="breadcrumb-segment"
            @click="jumpTo(crumb.path)"
          >{{ crumb.title }}</span>
        </template>
      </div>
      <VSpacer />
      <VBtnToggle
        v-model="viewMode"
        density="compact"
        color="white"
        mandatory
        divided
        variant="text"
        class="me-1"
      >
        <VBtn
          v-tooltip:bottom="'มุมมองรายการ'"
          value="list"
          icon="mdi-view-list"
          size="small"
        />
        <VBtn
          v-tooltip:bottom="'มุมมองภาพย่อ'"
          value="grid"
          icon="mdi-view-grid"
          size="small"
        />
      </VBtnToggle>
    </VToolbar>

    <div class="board-list-wrap">
      <VProgressLinear
        v-if="boardLoading"
        indeterminate
        color="primary"
        height="2"
      />
      <div
        v-if="!boardLoading && !sortedBoardEntries.length"
        class="empty-state"
      >
        <VIcon
          size="48"
          color="grey-lighten-1"
        >
          mdi-image-off-outline
        </VIcon>
        <div class="text-body-2 text-grey-darken-1 mt-2">
          ไม่พบไฟล์ในโฟลเดอร์นี้
        </div>
      </div>

      <VList
        v-else-if="viewMode === 'list'"
        density="compact"
        class="bg-transparent pa-0"
      >
        <VListItem
          v-for="item in sortedBoardEntries"
          :key="item.name"
          class="explorer-row item-clickable"
          @click="item.type === 'dir' ? enterDir(item) : toggleSelect(item)"
        >
          <template #prepend>
            <VCheckbox
              v-if="item.type === 'file'"
              :model-value="isSelected(item)"
              density="compact"
              hide-details
              color="primary"
              class="me-1"
              @click.stop="toggleSelect(item)"
            />
            <VIcon
              v-else
              color="amber-darken-2"
              size="26"
              class="me-3"
            >
              mdi-folder
            </VIcon>
          </template>
          <VListItemTitle class="text-body-2">
            {{ item.name }}
          </VListItemTitle>
          <VListItemSubtitle
            v-if="item.type === 'file'"
            class="text-caption text-grey-darken-1"
          >
            {{ humanSize(item.size) }}
          </VListItemSubtitle>
        </VListItem>
      </VList>

      <div
        v-else
        class="grid-container pa-2"
      >
        <div
          v-for="item in sortedBoardEntries"
          :key="item.name"
          class="grid-cell"
          :class="{ selected: item.type === 'file' && isSelected(item) }"
          @click="item.type === 'dir' ? enterDir(item) : toggleSelect(item)"
        >
          <div class="grid-thumb">
            <template v-if="item.type === 'dir'">
              <VIcon
                size="48"
                color="amber-darken-2"
              >
                mdi-folder
              </VIcon>
            </template>
            <template v-else>
              <img
                v-if="thumbState(item) === 'loaded'"
                :src="thumbUrl(item)"
                alt=""
                loading="lazy"
              >
              <VProgressCircular
                v-else-if="thumbState(item) === 'loading'"
                indeterminate
                size="24"
                width="2"
                color="grey-lighten-1"
              />
              <VIcon
                v-else-if="thumbState(item) === 'failed'"
                size="40"
                color="grey-lighten-1"
              >
                mdi-image-broken-variant
              </VIcon>
              <VIcon
                v-else
                size="40"
                color="grey-lighten-1"
              >
                mdi-image-outline
              </VIcon>
              <div
                class="grid-check-badge"
                :class="{ checked: isSelected(item) }"
              >
                <VIcon size="20">
                  {{ isSelected(item) ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </VIcon>
              </div>
            </template>
          </div>
          <div
            class="grid-name"
            :title="item.name"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex align-center px-3 py-2 board-actions-bar">
      <VBtn
        size="small"
        variant="text"
        color="primary"
        :disabled="!boardFilesInDir.length"
        @click="selectAllInDir"
      >
        เลือกทั้งหมดในโฟลเดอร์
      </VBtn>
      <VSpacer />
      <span class="text-body-2 text-grey-darken-1 me-2">
        เลือกแล้ว {{ selectedSet.size }} รายการ
      </span>
      <VBtn
        v-if="selectedSet.size"
        size="small"
        variant="text"
        color="grey-darken-1"
        @click="clearSelection"
      >
        ล้าง
      </VBtn>
    </div>
  </div>
</template>

<style scoped>
.board-list-wrap {
  min-height: 320px;
  max-height: 50vh;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
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

.board-actions-bar {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}
.grid-cell {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 4px;
  transition: all 0.15s ease;
}
.grid-cell:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.grid-cell.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}
.grid-thumb {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.grid-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.grid-check-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: rgba(0, 0, 0, 0.45);
  transition: color 0.15s ease, background-color 0.15s ease;
  pointer-events: none;
}
.grid-cell:hover .grid-check-badge {
  background: rgba(255, 255, 255, 1);
}
.grid-check-badge.checked {
  color: rgb(var(--v-theme-primary));
}
.grid-name {
  font-size: 0.75rem;
  text-align: center;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
