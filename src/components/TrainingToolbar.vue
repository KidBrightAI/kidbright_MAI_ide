<script setup>
import { useWorkspaceStore } from "@/store/workspace";

const workspaceStore = useWorkspaceStore();

let props = defineProps({
  colabUrl : {
    type: String,
    default: ''
  }
});

let emits = defineEmits(['train', 'test', 'download']);
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
      />
      <VBtn
        rounded
        class="ms-4"
        color="primary"
        variant="flat"
        size="large"
        style="min-width: 140px;"
        @click="$emit('train')"
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
