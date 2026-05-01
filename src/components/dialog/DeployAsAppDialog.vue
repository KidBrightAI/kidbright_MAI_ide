<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"
import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"

const isDialogVisible = defineModel("isDialogVisible", { type: Boolean, default: false })

const emit = defineEmits(["submit"])

const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()

const refVForm = ref({})
// Deep clone so cancelling the dialog doesn't mutate the persisted store.
// Refreshed every time the dialog opens (see watch below) so a project
// switch elsewhere shows up here too.
const form = ref(JSON.parse(JSON.stringify(workspaceStore.appConfig)))
const iconFile = ref(null)
// Tracks whether the user has typed a custom App ID. Kept outside `form`
// so it doesn't leak into workspaceStore.appConfig (and from there into
// localStorage on every save).
const idEdited = ref(false)

const slugify = s => (s || "")
  .toLowerCase()
  .replace(/[^a-z0-9_]+/g, "_")
  .replace(/^_+|_+$/g, "")

watch(() => form.value.name, val => {
  // Auto-suggest id from name as long as the user hasn't typed a custom id yet.
  if (!idEdited.value) form.value.id = slugify(val) || "kidbright"
})

watch(isDialogVisible, isOpen => {
  // Re-clone from store on each open so external changes (e.g. user
  // switching projects) are reflected, and a previous cancel doesn't
  // leave stale typing in the form.
  if (isOpen) {
    form.value = JSON.parse(JSON.stringify(workspaceStore.appConfig))
    iconFile.value = null
    idEdited.value = false
  }
})

const onIconPick = async event => {
  const file = event.target?.files?.[0]
  if (!file) return
  iconFile.value = file
  // Preview only — the actual upload reads the file again via FileReader in
  // the deploy handler so we don't double-encode.
  const reader = new FileReader()
  reader.onload = () => { form.value.icon = reader.result }
  reader.readAsDataURL(file)
}

const onIconClear = () => {
  iconFile.value = null
  form.value.icon = null
}

const resetForm = () => {
  // Don't allow closing while a deploy is in flight — the user could
  // reopen the dialog and double-submit, and the in-progress toast
  // would have nothing to attach to.
  if (boardStore.uploading) return
  isDialogVisible.value = false
}

const onSubmit = async () => {
  const { valid } = await refVForm.value?.validate()
  if (!valid) return
  // Persist text fields so reopening the dialog shows the same values
  // (and so the rest of the IDE can read appConfig.id elsewhere). The
  // icon data URL is intentionally NOT persisted — a 1 MB upload would
  // bloat localStorage on every save. User re-picks the icon next
  // session if they want a custom one.
  const persistable = JSON.parse(JSON.stringify(form.value))
  persistable.icon = null
  workspaceStore.appConfig = persistable
  // The parent (pages/index.vue) closes the dialog only when the deploy
  // actually finishes, so a failure leaves the form open for the user
  // to fix and retry instead of disappearing silently.
  emit("submit", { ...form.value, iconFile: iconFile.value })
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '600'"
    v-model="isDialogVisible"
    persistent
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn variant="text" size="small" @click="resetForm" />
      <VCardItem>
        <VCardTitle class="text-h5">ติดตั้งเป็นแอปพลิเคชัน</VCardTitle>
        <VCardSubtitle class="text-wrap">
          ติดตั้งโปรเจคนี้ลงในบอร์ดเป็นแอปพลิเคชัน เพื่อเปิดใช้งานจากเมนูบนหน้าจอบอร์ดได้ทุกครั้ง
        </VCardSubtitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VForm
          ref="refVForm"
          :disabled="boardStore.uploading"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="12" md="7">
              <VTextField
                v-model="form.name"
                label="ชื่อแอปพลิเคชัน"
                :rules="[v => !!v || 'กรุณากรอกชื่อแอปพลิเคชัน']"
                outlined dense clearable
              />
            </VCol>
            <VCol cols="12" md="5">
              <VTextField
                v-model="form.id"
                label="รหัสแอปพลิเคชัน"
                hint="ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมายขีดล่าง"
                :rules="[
                  v => !!v || 'กรุณากรอกรหัสแอปพลิเคชัน',
                  v => /^[a-z0-9_]+$/.test(v) || 'ใช้ a-z, 0-9 และ _ เท่านั้น',
                ]"
                outlined dense
                @input="idEdited = true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField v-model="form.version" label="เวอร์ชัน" outlined dense />
            </VCol>
            <VCol cols="6">
              <VTextField v-model="form.author" label="ผู้สร้าง" outlined dense />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextField v-model="form.desc" label="คำอธิบาย" outlined dense />
            </VCol>
          </VRow>
          <VRow class="align-center">
            <VCol cols="9">
              <VFileInput
                label="ไอคอนแอปพลิเคชัน"
                hint="แนะนำ PNG ขนาด 96×96 px หากไม่เลือก จะใช้ไอคอนเริ่มต้น"
                persistent-hint
                accept="image/png,image/jpeg"
                density="compact"
                prepend-icon=""
                prepend-inner-icon="mdi-image"
                show-size
                @change="onIconPick"
                @click:clear="onIconClear"
              />
            </VCol>
            <VCol cols="3" class="text-center">
              <!-- Show the user's upload if any, else the bundled default
                   icon (monkeyhead) so the preview always reflects what
                   will land on the board. -->
              <VImg
                :src="form.icon || workspaceStore.currentBoard?.appTemplate?.['app.png']"
                width="60" height="60"
                class="rounded mx-auto"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VCheckbox
                v-model="form.autoStart"
                label="ตั้งให้แอปพลิเคชันนี้เริ่มทำงานทันทีเมื่อเปิดเครื่อง"
                density="compact"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" class="text-center mt-2">
              <VBtn
                type="submit"
                color="primary"
                size="large"
                prepend-icon="mdi-rocket-launch"
                :loading="boardStore.uploading"
                :disabled="boardStore.uploading"
              >
                {{ boardStore.uploading ? 'กำลังติดตั้ง...' : 'ติดตั้งแอปพลิเคชัน' }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
