<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"
import { useWorkspaceStore } from "@/store/workspace"

const isDialogVisible = defineModel("isDialogVisible", { type: Boolean, default: false })

const emit = defineEmits(["submit"])

const workspaceStore = useWorkspaceStore()

const refVForm = ref({})
// Deep clone so cancelling the dialog doesn't mutate the persisted store.
const form = ref(JSON.parse(JSON.stringify(workspaceStore.appConfig)))
const iconFile = ref(null)

const slugify = s => (s || "")
  .toLowerCase()
  .replace(/[^a-z0-9_]+/g, "_")
  .replace(/^_+|_+$/g, "")

watch(() => form.value.name, val => {
  // Auto-suggest id from name as long as the user hasn't typed a custom id yet.
  if (!form.value._idEdited) form.value.id = slugify(val) || "kidbright"
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
  isDialogVisible.value = false
}

const onSubmit = async () => {
  const { valid } = await refVForm.value?.validate()
  if (!valid) return
  // Persist back to workspaceStore so reopening the dialog shows the same
  // values (and so the rest of the IDE can read appConfig.id elsewhere).
  workspaceStore.appConfig = JSON.parse(JSON.stringify(form.value))
  emit("submit", { ...form.value, iconFile: iconFile.value })
  isDialogVisible.value = false
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
        <VCardTitle class="text-h5">Deploy as App</VCardTitle>
        <VCardSubtitle>
          ส่งโค้ดไปลงเป็นแอปบนบอร์ด — เปิดได้จาก launcher และตั้งให้รันตอนเปิดเครื่องได้
        </VCardSubtitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VForm ref="refVForm" @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="12" md="7">
              <VTextField
                v-model="form.name"
                label="ชื่อแอป (App name)"
                :rules="[v => !!v || 'ต้องการชื่อแอป']"
                outlined dense clearable
              />
            </VCol>
            <VCol cols="12" md="5">
              <VTextField
                v-model="form.id"
                label="App ID"
                hint="ใช้กับ folder บนบอร์ด /maixapp/apps/<id>/"
                :rules="[
                  v => !!v || 'ต้องการ id',
                  v => /^[a-z0-9_]+$/.test(v) || 'ใช้ a-z, 0-9, _ เท่านั้น',
                ]"
                outlined dense
                @input="form._idEdited = true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VTextField v-model="form.version" label="Version" outlined dense />
            </VCol>
            <VCol cols="6">
              <VTextField v-model="form.author" label="Author" outlined dense />
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
                label="Icon (PNG/JPG, จะใช้ default ถ้าไม่เลือก)"
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
              <VImg
                v-if="form.icon"
                :src="form.icon"
                width="60" height="60"
                class="rounded mx-auto"
              />
              <VIcon v-else size="40" color="grey-lighten-1">mdi-image-outline</VIcon>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VCheckbox
                v-model="form.autoStart"
                label="Auto-run ตอนเปิดเครื่อง (จะเขียน /maixapp/auto_start.txt)"
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
              >
                Deploy
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
