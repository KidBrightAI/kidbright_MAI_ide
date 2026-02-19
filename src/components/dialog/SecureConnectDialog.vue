<script setup>
import { useBoardStore } from "@/store/board"
import SecureConnectImage from "@/assets/images/secure_connect.png"
import { ref } from "vue"

const boardStore = useBoardStore()
const step = ref(1)

const openSecureLink = () => {
  window.open(`https://${boardStore.boardIp}:5050`, "_blank")
}

const nextStep = () => {
  if (step.value < 3) step.value++
}

const prevStep = () => {
  if (step.value > 1) step.value--
}
</script>

<template>
  <VDialog
    v-model="boardStore.showSecureConnectDialog"
    max-width="700"
  >
    <VCard>
      <VCardTitle class="text-h5 bg-primary text-white d-flex align-center">
        <span>การตั้งค่าและเชื่อมต่อ (Board Setup)</span>
        <VSpacer />
        <span class="text-caption">Step {{ step }} / 3</span>
      </VCardTitle>

      <VCardText class="pa-4">
        <VWindow v-model="step">
          <!-- Step 1: USB Configuration -->
          <VWindowItem :value="1">
            <div class="text-h6 mb-2">
              ขั้นตอนที่ 1: ตั้งค่า USB บนบอร์ด
            </div>
            <div class="text-body-1 mb-4">
              กรุณาทำตามขั้นตอนต่อไปนี้บนหน้าจอของบอร์ด KidBright MAI:
            </div>
            <VList density="compact" bg-color="grey-lighten-4" rounded>
              <VListItem prepend-icon="mdi-numeric-1-circle" title="เข้าเมนู Setting -> USB Setting" />
              <VListItem prepend-icon="mdi-numeric-2-circle" title="เลือก USB Mode เป็น 'Device'" />
              <VListItem prepend-icon="mdi-numeric-3-circle" title="เปิดใช้งาน 'CDC-NCM' และ 'RNDIS'" />
              <VListItem prepend-icon="mdi-numeric-4-circle" title="กด Confirm แล้ว Reboot บอร์ด 1 ครั้ง" />
            </VList>
          </VWindowItem>

          <!-- Step 2: IP Address Input -->
          <VWindowItem :value="2">
            <div class="text-h6 mb-2">
              ขั้นตอนที่ 2: ระบุ IP Address
            </div>
            <div class="text-body-1 mb-4">
              หลังจาก Reboot แล้ว ให้เข้าเมนู <b>Setting -> Device Info</b> บนบอร์ด<br>
              และนำเลข IP Address (ขึ้นต้นด้วย 10.xxx) มากรอกด้านล่าง:
            </div>
            
            <VTextField
              v-model="boardStore.boardIp"
              label="Board IP Address"
              placeholder="e.g. 10.150.36.1"
              variant="outlined"
              prepend-inner-icon="mdi-ip-network"
              class="mt-4"
              hide-details="auto"
            />
            <div class="text-caption text-grey mt-2">
              * หากไม่ทราบ ให้ลองใช้ค่าเริ่มต้น: 10.150.36.1
            </div>
          </VWindowItem>

          <!-- Step 3: Secure Connection (Original) -->
          <VWindowItem :value="3">
            <div class="text-h6 mb-2">
              ขั้นตอนที่ 3: ยืนยันความปลอดภัย
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
                style="max-width: 100%; max-height: 200px; border: 1px solid #ddd; border-radius: 8px;"
                alt="Click to open secure link"
              >
            </div>

            <VBtn
              block
              color="error"
              size="large"
              prepend-icon="mdi-lock-open-check"
              @click="openSecureLink"
              class="mb-2"
            >
              กดปุ่มนี้เพื่อเปิดแท็บยืนยัน
            </VBtn>
            <div class="text-caption text-center">
              (IP เป้าหมาย: https://{{ boardStore.boardIp }}:5050)
            </div>
          </VWindowItem>
        </VWindow>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VBtn
          v-if="step > 1"
          variant="text"
          @click="prevStep"
        >
          ย้อนกลับ
        </VBtn>
        <VSpacer />
        
        <VBtn
          v-if="step < 3"
          color="primary"
          variant="elevated"
          @click="nextStep"
        >
          ถัดไป
        </VBtn>
        <VBtn
          v-else
          color="success"
          variant="elevated"
          @click="boardStore.showSecureConnectDialog = false"
        >
          เสร็จสิ้น
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
