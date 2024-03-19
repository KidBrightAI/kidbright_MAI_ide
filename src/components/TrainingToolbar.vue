<script setup>
import { useServerStore } from "@/store/server";
import { onMounted } from "vue";

const serverStore = useServerStore();

let props = defineProps({
  colabUrl : {
    type: String,
    default: ''
  }
});

let emits = defineEmits(['train', 'test', 'download']);

const serverUrl = ref('');
let currentUrl = '';

const openColab = () => {
  window.open(props.colabUrl, '_blank');
};

//validate the url with port
const validateUrl = (url) => {
  console.log("Validating url: ", url);
  const regex = new RegExp('^(https?|ftp)://(www\\.)?([a-zA-Z0-9]+)\\.[a-zA-Z]{2,3}(\\.[a-zA-Z]{2})?(:[0-9]+)?(/\\S*)?$');
  return regex.test(url);
};

const onColab = async (focused) => {
  if(!focused) {
    if(serverUrl.value && serverUrl.value !== currentUrl) {
      currentUrl = serverUrl.value; 
      await setServerAndConnect(currentUrl);
    }
  }
};
const setServerAndConnect = async (url) => {
  serverStore.serverUrl = url;
  console.log("Set colab url: ", url);
  await serverStore.connectColab();
};
onMounted(() => {
  serverUrl.value = serverStore.serverUrl;
});
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
        class="ms-0 colab-url-input"                 
        color="white"
        label="Put Google Colab URL here ..."
        hide-details
        variant="solo"
        single-line
        @update:focused="onColab"
        :loading="serverStore.isColabConnecting"
        :disabled="serverStore.isColabConnecting"
        v-model="serverUrl"
        @keyup.enter="setServerAndConnect(serverUrl)"
      />
      <VBtn
        rounded
        class="ms-4"
        color="primary"
        variant="flat"
        size="large"
        style="min-width: 140px;"        
        @click="$emit('train')"
        :disabled="!serverStore.isColabConnected"
      >
        Train
      </VBtn>
      <VBtn
        rounded
        class="ms-2"
        color="primary"
        variant="flat"
        size="large"
        style="min-width: 140px;"
        :disabled="!serverStore.isTrainingSuccess"
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
        :disabled="!serverStore.isTrainingSuccess"
        @click="$emit('download')"
      >
        Download
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
