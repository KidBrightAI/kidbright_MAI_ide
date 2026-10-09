<script setup>
import { useBoardStore } from "@/store/board"

import { onMounted } from "vue"
import { useConfirm } from "@/components/comfirm-dialog"
import { toast } from "vue3-toastify"
import { useI18n } from "vue-i18n"

const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })



const { t } = useI18n()

const boardStore = useBoardStore()
const confirm = useConfirm()

const refVForm = ref({})
const ssid = ref([])
const selectedSSID = ref('')
const password = ref('')

const resetForm = () => {
  isDialogVisible.value = false
}

const connectWifi = async() => {
  let { valid: isValid } = await refVForm.value?.validate()  
  if (isValid) {
    let res = await boardStore.connectWifi(selectedSSID.value, password.value)
    if(res){
      toast.success(t('dialog.connectWifi.connected'))
      isDialogVisible.value = false
    }else if(res === false){
      toast.error(t('dialog.connectWifi.connectFailed'))
    }
  }
}

//list wifi when dialog is opened
watch(isDialogVisible, async val=>{
  if(val){
    //console.log("... check wifi");
    //let resWifiInfo = await boardStore.checkWifi();
    console.log("... list wifi")
    let res = await boardStore.listWifi()
    if(res){
      ssid.value = res
      if(res.length > 0){
        selectedSSID.value = res[0].ssid
      }
    }
  }
})
</script>

<template>
  <VDialog
    width="450px"
    v-model="isDialogVisible"
  >
    <VCard
      :loading="boardStore.wifiConnecting || boardStore.wifiListing"
      :disabled="boardStore.wifiConnecting || boardStore.wifiListing"
    >
      <VToolbar density="compact">
        <VToolbarTitle>{{ $t('dialog.connectWifi.title') }}</VToolbarTitle>
        <VSpacer /> 
        <VBtn
          icon
          density="compact"
          @click="resetForm"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText>
        <VForm ref="refVForm">
          <VRow>  
            <VCol cols="12">
              <VSelect
                v-model="selectedSSID"
                :items="ssid"
                :label="$t('dialog.connectWifi.network')"
                item-title="ssid"
                item-value="ssid"
                outlined
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="password"
                :label="$t('dialog.connectWifi.password')"
                outlined
                required
              />
            </VCol>
          </VRow>        
        </VForm>      
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          type="submit"
          variant="elevated"
          @click="connectWifi"
        >
          {{ $t('dialog.connectWifi.connect') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
