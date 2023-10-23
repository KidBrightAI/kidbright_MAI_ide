<template>
  <div class="w-100 h-100">
    <VCard class="h-100" style="overflow-y: auto;">
      <VCardTitle class="text-center mt-5">ขั้นตอนการสอนโมเดล</VCardTitle>
      <VCardSubtitle class="text-center">ทำตามขั้นตอนต่อไปนี้เพื่อทำการสอนโมเดล</VCardSubtitle>
      <VDivider class="my-3"></VDivider>
      <VCardItem class="text-center">
        <h4>ขั้นตอนที่ 1 บันทึกโปรเจคของคุณ</h4>
        <img class="mt-4" src="@/assets/images/png/train_step1.png" height="200"/>
        <p class="mt-2">
          ทำการบันทึกโปรเจค โดยกดที่ปุ่ม Save จากนั้น Browser จะทำการบันทึกข้้อมูลทั้งหมดเป็น Zip ไฟล์ โดยจะมีไฟล์ชื่อว่า project.zip เพื่อใช้ในการสอนโมเดล
        </p>
      </VCardItem>
      <VCardItem class="text-center">
        <h4>ขั้นตอนที่ 2 สร้าง Instance บน Google Colab และสอนโมเดล</h4>
        <VBtn class="my-3" target="_blank" href="https://colab.research.google.com/drive/12W-GNNJQTYoEga3hHnLIJhEOLvGFCsRh?usp=sharing">สร้าง Instance Google Colab</VBtn><br>
        <img class="mt-4" src="@/assets/images/png/train_step2.png" height="200"/>
        <p class="mt-2">
          กดที่ปุ่ม "สร้าง INSTANCE GOOGLE COLAB" จากนั้นทำตามขั้นตอนทีอธิบายไว้ใน COLAb ทำการสอนโมเดลจนเสร็จ จากนั้นกลับมาที่หน้านี้ใหม่อีกครั้ง
        </p>
      </VCardItem>
      <VCardItem class="text-center">
        <h4>ขั้นตอนที่ 3 นำเข้าโมเดลที่สอนเสร็จเรียบร้อยแล้ว</h4>
        <VBtn class="my-3" @click="importModel">นำเข้าโมเดล</VBtn><br>
        <VBtn class="my-3" @click="uploadLabel">นำเข้า LABEL</VBtn><br>
        <p class="mt-2">
          เมื่อทำการสอนโมเดลเรียบร้อย ให้ทำการนำเข้าโมเดลที่บันทึกจาก Google COLAB เพื่อใช้ในบอร์ดต่อไป
        </p>
      </VCardItem>
    </VCard>
  </div>
</template>

<script setup>
import { useWorkspaceStore } from '@/store/workspace';
import { toast } from "vue3-toastify";
const workspaceStore = useWorkspaceStore();
const importModel = async()=>{
  let res = await workspaceStore.importModelFromZip();
  if(res){
    toast.success("นำเข้าโมเดลเรียบร้อยแล้ว");
  }else if(res === false){
    toast.error("เกิดข้อผิดพลาดในการนำเข้าโมเดล");
  }
}
const uploadLabel = async()=>{
  let res = await workspaceStore.uploadLabel();
  if(res){
    toast.success("อัพโหลด Label เรียบร้อยแล้ว");
  }else if(res === false){
    toast.error("เกิดข้อผิดพลาดในการอัพโหลด Label");
  }
}

</script>
<style lang="scss" scoped>
$primary-color: #007e4e;
.horizontal-panes {
  width: 100%;
  height: calc(100vh - 80px);
  border: 1px solid #ccc;
  overflow: hidden;
}
.multipane.horizontal-panes.layout-h .multipane-resizer {
  margin: 0;
  top: 0; /* reset default styling */
  height: 5px;
  background: #aaa;
}
.train-panel {
  padding: 20px;
  background: #222;
  height: 78px;
  display: flex;
  justify-content: flex-end;
}
.train-btn {
  color: white;
  margin-left: 10px !important;
  border-radius: 15px !important;
  min-width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
.base-btn {
  color: white;
  background-color: $primary-color;
  margin-left: 10px !important;
  border-radius: 15px !important;
  min-width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
</style>
