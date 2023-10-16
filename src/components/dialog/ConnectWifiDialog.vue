<script setup>
import { useBoardStore } from "@/store/board";

import { onMounted } from "vue";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible']);

const boardStore = useBoardStore();
const confirm = useConfirm();

const refVForm = ref({});
const ssid = ref('');
const password = ref('');

const resetForm = () => {
  emit('update:isDialogVisible', false);
}

</script>

<template>
  <VDialog
    width="450px"
    :model-value="props.isDialogVisible"
  >
  <VCard>
    <VToolbar density="compact">
      <VToolbarTitle>เชื่อมต่อ WiFi</VToolbarTitle>
      <VSpacer/> 
      <VBtn icon @click="resetForm" density="compact">
        <VIcon>mdi-close</VIcon>
      </VBtn>
    </VToolbar>
    <VCardText>
      <VForm ref="refVForm">
        <VRow>  
          <VCol cols="12">
            <VTextField
              v-model="ssid"
              label="ชื่อ WiFi"
              outlined
              required
            ></VTextField>
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="password"
              label="รหัสผ่าน WiFi"
              outlined
              required
            ></VTextField>
          </VCol>
        </VRow>        
      </VForm>      
    </VCardText>
    <VCardActions>
      <VSpacer/>
      <VBtn color="primary" type="submit" variant="elevated" >เชื่อมต่อ WiFi</VBtn>
    </VCardActions>
    </VCard>
  </VDialog>
</template>
