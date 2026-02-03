<script setup>
import { useBoardStore } from "@/store/board"
import SecureConnectImage from "@/assets/images/secure_connect.png"

const boardStore = useBoardStore()

const openSecureLink = () => {
  window.open("https://10.150.36.1:5050", "_blank")
}
</script>

<template>
  <VDialog
    v-model="boardStore.showSecureConnectDialog"
    max-width="600"
  >
    <VCard>
      <VCardTitle class="text-h5 bg-primary text-white">
        การเชื่อมต่อแบบปลอดภัย (Secure Connection)
      </VCardTitle>

      <VCardText class="pa-4">
        <div class="text-body-1 mb-4">
          เนื่องจาก IDE ทำงานบนระบบ HTTPS และบอร์ด KidBright MAI เชื่อมต่อผ่านเครือข่ายภายใน (Local Network) 
          Web Browser จะบล็อกการเชื่อมต่อนี้เพื่อความปลอดภัย
        </div>

        <div class="text-body-1 mb-4 font-weight-bold text-error">
          กรุณาทำตามขั้นตอนต่อไปนี้เพื่ออนุญาตการเชื่อมต่อ (ทำเพียงครั้งเดียว):
        </div>

        <div
          class="d-flex justify-center mb-4 cursor-pointer"
          @click="openSecureLink"
        >
          <img
            :src="SecureConnectImage"
            style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px;"
            alt="Click to open secure link"
          >
        </div>

        <VBtn
          block
          color="primary"
          size="large"
          prepend-icon="mdi-lock-open-check"
          @click="openSecureLink"
        >
          กดปุ่มนี้เพื่อเปิดแท็บยืนยัน (Proceed to 10.150.36.1)
        </VBtn>
        
        <div class="text-caption text-center mt-2 text-grey">
          เมื่อกดปุ่มแล้ว ให้กดปุ่ม "Advanced" และ "Proceed to 10.150.36.1 (unsafe)" ในหน้าต่างใหม่
        </div>
      </VCardText>

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
