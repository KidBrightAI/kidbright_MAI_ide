<script setup>
import { useServerStore } from "@/store/server"
import { computed, onMounted } from "vue"

let props = defineProps({
  colabUrl : {
    type: String,
    default: '',
  },
})

let emits = defineEmits(['train', 'terminate', 'test', 'download'])

const serverStore = useServerStore()

const serverUrl = ref('')
let currentUrl = ''

const openColab = () => {
  window.open(props.colabUrl, '_blank')
}

//validate the url with port
const validateUrl = url => {
  console.log("Validating url: ", url)
  const regex = new RegExp('^(https?|ftp)://(www\\.)?([a-zA-Z0-9]+)\\.[a-zA-Z]{2,3}(\\.[a-zA-Z]{2})?(:[0-9]+)?(/\\S*)?$')
  
  return regex.test(url)
}

const onColab = async focused => {
  if(!focused) {
    if(serverUrl.value && serverUrl.value !== currentUrl) {
      currentUrl = serverUrl.value 
      await setServerAndConnect(currentUrl)
    }
  }
}
const resolveDownloadMessage = computed(() => {
  if(serverStore.isConverting){
    return "Converting"
  }else if(serverStore.isDownloading){
    return `Downloading ${serverStore.downloadingFiles}/${serverStore.totalDownloadingFiles}`
  }else{
    return "Download"
  }
})

const setServerAndConnect = async url => {
  serverStore.serverUrl = url
  console.log("Set colab url: ", url)
  await serverStore.connectColab()
}
onMounted(() => {
  serverUrl.value = serverStore.serverUrl
})
</script>

<template>
  <div>
    <VToolbar      
      class="elevation-0 pa-2"
      color="black"
    >
      <VBtn 
        variant="flat"
        color="primary"
        size="large"
        style="height: 49px;"
        class="me-0 rounded-0 rounded-s-lg"       
        @click="openColab" 
      >
        Create
      </VBtn>
      <VTextField 
        v-model="serverUrl"                 
        class="ms-0 colab-url-input"
        color="white"
        label="Put TUNNEL URL here ..."
        hide-details
        variant="solo"
        single-line
        :loading="serverStore.isColabConnecting"
        :disabled="serverStore.isColabConnecting || serverStore.isColabConnected"
        @update:focused="onColab"
        @keyup.enter="setServerAndConnect(serverUrl)"
      />
      <VBtn
        v-if="!serverStore.isTraining"
        rounded
        class="ms-4"
        color="primary"
        variant="flat"
        size="large"
        style="min-width: 140px;"        
        :disabled="!serverStore.isColabConnected"
        @click="$emit('train')"
      >
        Train
      </VBtn>
      <VBtn
        v-if="serverStore.isTraining"
        rounded
        class="ms-2"
        color="error"
        variant="flat"
        size="large"
        style="min-width: 140px;"
        :disabled="!serverStore.isTraining || serverStore.isDownloading || serverStore.isConverting"
        @click="$emit('terminate')"
      >
        Terminate
      </VBtn>
      <VBtn
        rounded
        class="ms-2"
        color="primary"
        variant="flat"
        size="large"
        style="min-width: 140px;"
        :disabled="true"
        @click="$emit('test')"
      >
        Test
      </VBtn>
      <VBtn
        rounded
        class="ms-2"
        color="primary"
        variant="flat"
        size="large"
        style="min-width: 140px;"
        :disabled="!serverStore.isTrainingSuccess || serverStore.isDownloading || serverStore.isConverting"
        @click="$emit('download')"
      >
        <VProgressCircular
          v-if="serverStore.isDownloading || serverStore.isConverting"
          :indeterminate="serverStore.isConverting"
          color="white"
          size="20"
          class="me-2"
          :model-value="serverStore.downloadProgress"
        />
        {{ resolveDownloadMessage }}
      </VBtn>
    </VToolbar>
  </div>  
</template>

<style lang="scss">
.colab-url-input {
  .v-input__control{    
    .v-field{
      border-radius: 0px 7px 7px 0px !important;
    }
  }
}
</style>
