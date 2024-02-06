<template>
  <div class="w-100 h-100">
    <VCard flat>
      <VCardTitle class="text-center mt-5">ขั้นตอนการสอนโมเดล</VCardTitle>
      <VCardSubtitle class="text-center">ทำตามขั้นตอนต่อไปนี้เพื่อทำการสอนโมเดล</VCardSubtitle>    
    </VCard>
    <VDivider></VDivider>
    <VCard flat>
      <VCardItem class="text-center">        
        <h4>ขั้นตอนที่ 1 สร้าง Instance บน Google Colab และสอนโมเดล</h4>
        <VBtn class="my-3" target="_blank" href="https://colab.research.google.com/drive/1GuQE-CffdKsq4sHIEAzBYdwEUGlpbI1A?usp=sharing">สร้าง Instance Google Colab</VBtn><br>
        <img class="mt-4" src="@/assets/images/png/train_step2.png" height="200"/>
        <p class="mt-2">
          กดที่ปุ่ม "สร้าง INSTANCE GOOGLE COLAB" จากนั้นทำตามขั้นตอนเพื่อนำ URL จาก COLAB สำหรับการเชื่อมต่อกับ KidBright uAI IDE ต่อไป
        </p>
      </VCardItem>
    </VCard>
    <VDivider></VDivider>
    <VCard flat>
      <VCardItem class="text-center">
        <h4>ขั้นตอนที่ 2 วางลิงค์ที่ได้จาก GOOGLE COLAB ในขั้นตอนที่ 1 และทำการเชื่อมต่อ</h4>
        <VTextField class="my-3 mx-auto" style="max-width: 600px;" v-model="colabUrl" label="URL ที่ได้จาก Google Colab" outlined></VTextField>
        <VBtn class="my-3" @click="connectColab">เชื่อมต่อกับ COLAB</VBtn>        
      </VCardItem>
    </VCard>
    <VDivider></VDivider>
    <VCard flat :disabled="!isColabConnected">
      <VCardItem class="text-center">
        <h4>ขั้นตอนที่ 3 ตั่งค่าการสอนโมเดล</h4>
        <VRow class="mx-auto mt-5" style="max-width: 600px;">
          <VCol cols="12" md="6">
            <VTextField v-model.number="trainConfig.epochs" label="จำนวนรอบการสอน" outlined hint="จำนวนรอบการสอนที่ต้องการให้โมเดลทำการสอน" hint-color="red"></VTextField>
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="trainConfig.batchSize" label="จำนวนรูปภาพต่อรอบ" outlined hint="จำนวนรูปภาพที่ต้องการให้โมเดลทำการสอนต่อรอบ" hint-color="red"></VTextField>
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="trainConfig.learningRate" label="Learning Rate" outlined hint="ค่าที่ใช้ในการปรับค่าความสามารถในการเรียนรู้ของโมเดล" hint-color="red"></VTextField>
          </VCol>
          <VCol cols="12" md="6">
            <VSelect v-model="trainConfig.model" :items="['slim_yolo_v2']" label="โมเดล" outlined hint="โมเดลที่ต้องการให้โมเดลทำการสอน" hint-color="red"></VSelect>
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model.number="trainConfig.split" label="Validation Split" outlined hint="ค่าที่ใช้ในการแบ่งข้อมูลสำหรับการทดสอบโมเดล" hint-color="red"></VTextField>
          </VCol>
          <VCol cols="12" md="6">
            <VSwitch v-model="trainConfig.augmentation" label="Augmentation" outlined hint="การทำการปรับข้อมูลเพื่อให้โมเดลสามารถเรียนรู้ได้ดีขึ้น" hint-color="red"></VSwitch>
          </VCol>          
        </VRow>
        <br>        
        <p class="mt-2">
          - ทำการตั้งค่าโมเดล มีรายละเอียดดังนี้ จากนั้น กดปุ่ม "สอนโมเดล" เพื่อทำการสอนโมเดล
          <br>
          <!-- - จำนวนรอบการสอน คือ จำนวนรอบที่ต้องการให้โมเดลทำการสอน
          <br>
          - จำนวนรูปภาพต่อรอบ คือ จำนวนรูปภาพที่ต้องการให้โมเดลทำการสอนต่อรอบ
          <br>
          - Learning Rate คือ ค่าที่ใช้ในการปรับค่าความสามารถในการเรียนรู้ของโมเดล
          <br>
          - โมเดล คือ โมเดลที่ต้องการให้โมเดลทำการสอน
          <br>
          - Validation Split คือ ค่าที่ใช้ในการแบ่งข้อมูลสำหรับการทดสอบโมเดล
          <br>
          - Augmentation คือ การทำการปรับข้อมูลเพื่อให้โมเดลสามารถเรียนรู้ได้ดีขึ้น -->
        </p>
        <VBtn class="my-3" @click="trainModel">สอนโมเดล</VBtn>
      </VCardItem>
    </VCard>
    <VDivider></VDivider>
    <VCard flat class="h-100" :disabled="!isTrainingSuccess">
      <VCardItem class="text-center">
        <h4>ขั้นตอนที่ 4 ดาวน์โหลดโมเดลที่สอนเสร็จเรียบร้อยแล้ว</h4>
        <VBtn class="my-3" @click="importModel">ดาวน์โหลดโมเดล</VBtn><br>        
        <p class="mt-2">
          เมื่อทำการสอนโมเดลเรียบร้อย ให้ทำการนำเข้าโมเดลจาก Google COLAB เพื่อใช้ในบอร์ดต่อไป
        </p>
      </VCardItem>
    </VCard>
  </div>
</template>

<script setup>
import { useWorkspaceStore } from '@/store/workspace';
import { toast } from "vue3-toastify";
const workspaceStore = useWorkspaceStore();

const colabUrl = ref("");
const isColabConnected = ref(false);
const isTraining = ref(false);
const isTrainingSuccess = ref(false);
const trainConfig = ref({
  epochs: 10,
  batchSize: 32,
  learningRate: 0.001,
  model: "slim_yolo_v2",
  metrics: ["accuracy"],
  split : 0.2,
  augmentation: true
});

const importModel = async()=>{
  let res = await workspaceStore.importObjectDetectionModelFromZip();
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

const connectColab = async()=>{
  if(colabUrl.value){
    let res = await workspaceStore.connectColab(colabUrl.value);
    if(res){
      toast.success("เชื่อมต่อกับ Google Colab เรียบร้อยแล้ว");
      isColabConnected.value = true;
    }else if(res === false){
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Colab");
    }
  }else{
    toast.error("กรุณากรอก URL ที่ได้จาก Google Colab");
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
