<script setup>
import { useBoardStore } from "@/store/board"
import SecureConnectImage from "@/assets/images/secure_connect.png"
import { ref } from "vue"

const boardStore = useBoardStore()

const openSecureLink = () => {
  window.open(`https://${boardStore.boardIp}:5050`, "_blank")
}
</script>

<template>
  <VDialog
    v-model="boardStore.showSecureConnectDialog"
    max-width="500"
  >
    <VCard>
      <VCardTitle class="text-h5 bg-primary text-white d-flex align-center">
        <span>การตั้งค่าความปลอดภัย (Secure Connect)</span>
        <VSpacer />
      </VCardTitle>

      <VCardText class="pa-4">
        <div class="text-h6 mb-2">
          ยืนยันความปลอดภัย
        </div>
        <div class="text-body-1 mb-2">
          เนื่องจากเป็นการเชื่อมต่อผ่าน HTTPS บน Local Network<br>
          Browser จะบล็อกการทำงาน ต้องทำการอนุญาตก่อน (ทำครั้งเดียว):
        </div>

        <div
          class="d-flex justify-center mb-4 cursor-pointer"
          @click="openSecureLink"
        >
          <img
            :src="SecureConnectImage"
            style="max-width: 100%; max-height: 500px; border: 1px solid #ddd; border-radius: 8px;"
            alt="Click to open secure link"
          >
        </div>

        <VBtn
          block
          size="large"
          color="primary"
          prepend-icon="mdi-lock-open-check"
          @click="openSecureLink"
          class="mb-2"
        >
          กดปุ่มนี้เพื่อเปิดแท็บยืนยัน
        </VBtn>
        <div class="text-caption text-center">
          (Target: https://{{ boardStore.boardIp }}:5050)
        </div>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          variant="text"
          @click="boardStore.showSecureConnectDialog = false"
        >
          ปิดหน้าต่าง
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
