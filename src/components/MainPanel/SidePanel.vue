<template>
  <div class="left-panel d-flex flex-column">
    <div class="l-title font-weight-bold">KidBright μAI</div>    
    <div class="left-bottom-content d-flex flex-fill position-relative">
      <div class="header-left-bar">
        <!-- <div class="proj-name">
          {{ workspaceStore.name || 'สร้างหรือเลือกโปรเจคใหม่' }}
        </div> -->
        <div class="text-h6 text-yellow font-weight-bold">
          {{ workspaceStore.projectTypeTitle || 'คุณยังไม่ได้เลือกประเภทโปรเจค' }}
        </div>
        <div class="d-flex flex-row mt-2 mb-2 justify-space-between">
          <VBtn 
            class="px-3 font-weight-bold" 
            rounded="xl" 
            color="teal-darken-4"
            @click="$emit('backToCoding')"
          >
            <v-icon class="me-1">mdi-chevron-left</v-icon>
            Back to Coding
          </VBtn>
          <VBtn 
            class="text-red font-weight-bold" 
            rounded="xl" 
            color="teal-darken-4"
            @click="$emit('resetModel')"
          >
            <VIcon class="me-1">mdi-delete</VIcon>
            Reset
          </VBtn>
        </div>
      </div>
      <div class="info-scrollable">
        <div class="d-flex flex-column w-100 px-3">
          <VBtn
            class="border-xl mt-5 font-weight-bold"
            rounded="xl"
            size="x-large"
            color="white"
            height="64"
            block
            :style="{ borderColor: selectedMenu === 1 ? '#007e4e !important' : '#5c5433 !important' }"
            :disabled="workspaceStore.id == null || workspaceStore.projectType == null"
            @click="handleTabChange(1)"
          >
            <VIcon class="me-2">mdi-camera</VIcon>
            Capture
            <div class="step-text" :style="{ backgroundColor: selectedMenu === 1 ? '#007e4e' : '#5c5433' }">1</div>
          </VBtn>

          <VBtn
            class="border-xl mt-4 font-weight-bold"
            rounded="xl" 
            size="x-large" 
            color="white"
            height="64"
            block
            :style="{ borderColor: selectedMenu === 2 ? '#007e4e !important' : '#5c5433 !important' }"
            :disabled="datasetStore.data.length === 0 || workspaceStore.id == null || workspaceStore.projectType == null"
            @click="handleTabChange(2)"
          >
            <VIcon class="me-2">mdi-tag</VIcon>
            Annotate
            <div class="step-text" :style="{ backgroundColor: selectedMenu === 2 ? '#007e4e' : '#5c5433' }">2</div>
          </VBtn>
      
          <VBtn
            class="border-xl mt-4 font-weight-bold"
            rounded="xl" 
            size="x-large" 
            color="white"
            height="64"
            block
            :style="{ borderColor: selectedMenu === 3 ? '#007e4e !important' : '#5c5433 !important' }"
            :disabled="datasetStore.getLabeledLength === 0 || workspaceStore.id == null || workspaceStore.projectType == null"
            @click="handleTabChange(3)"
          >
            <VIcon class="me-2">mdi-robot</VIcon>
            Train
            <div class="step-text" :style="{ backgroundColor: selectedMenu === 3 ? '#007e4e' : '#5c5433' }">3</div>
          </VBtn>

          <VBtn
            v-if="workspaceStore.model"
            class="border-xl mt-4 font-weight-bold"
            rounded="xl" 
            size="x-large" 
            color="yellow-lighten-2"
            height="64"
            block
            style="border-color: #007e4e !important;"
          >
            <img :src="KBRobot" width="42" height="42">
            Model is Ready!
            <div class="step-text" style="background-color: #007e4e;"><v-icon size="25" color="yellow-lighten-2">mdi-star</v-icon></div>
          </VBtn>

        </div>
        <v-spacer></v-spacer>
        <div class="mt-4">
          <div v-if="selectedMenu === 1">
            <InstructionAsyncComponent
              v-if="!workspaceStore?.extension?.instructions?.capture"
              target="CaptureInstruction.vue"
            ></InstructionAsyncComponent>
            <extension-async-component
              v-else
              :target="workspaceStore?.extension?.instructions?.capture"
            ></extension-async-component>
          </div>
          <div v-if="selectedMenu === 2">
            <InstructionAsyncComponent
              v-if="!workspaceStore?.extension?.instructions?.annotate"
              target="AnnatateInstruction.vue"
            ></InstructionAsyncComponent>
            <extension-async-component
              v-else
              :target="workspaceStore?.extension?.instructions?.annotate"
            ></extension-async-component>
          </div>
          <div v-if="selectedMenu === 3">
            <InstructionAsyncComponent
              v-if="!workspaceStore?.extension?.instructions?.train"
              target="TrainInstruction.vue"
            ></InstructionAsyncComponent>
            <extension-async-component
              v-else
              :target="workspaceStore?.extension?.instructions?.train"
            ></extension-async-component>
          </div>
          <div v-if="selectedMenu === 4">
            <InstructionAsyncComponent
              v-if="!workspaceStore?.extension?.instructions?.coding"
              target="CodingInstruction.vue"
            ></InstructionAsyncComponent>
            <extension-async-component
              v-else
              :target="workspaceStore?.extension?.instructions?.coding"
            ></extension-async-component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import MainMenu from "@/components/MainPanel/MainMenu.vue";
import { computed } from "vue";
import InstructionAsyncComponent from "@/components/InstructionAsyncComponent.vue";
import ExtensionAsyncComponent from "@/components/ExtensionAsyncComponent.vue";
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import { useDatasetStore } from "@/store/dataset";

import KBRobot from "@/assets/images/icons/robot.png";

const workspaceStore = useWorkspaceStore();
const datasetStore = useDatasetStore();
const boardStore = useBoardStore();

const props = defineProps({
  selectedMenu : {
    type: Number,
    default: 1,
  },
});


const emit = defineEmits([
  "update:selectedMenu", 
  "backToCoding",
  "resetModel"
  ]);
//const exts = this.$extensions;
const isOnline = computed(() => window.navigator.onLine);

const handleTabChange = (tabIndex) => {
  emit("update:selectedMenu", tabIndex);
};

const isConnected = computed(() => {
  return boardStore.isConnected();
});
</script>
<style scoped>
.step-text{
  position: absolute;
  top: -23px;
  left: -16px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 24px;
  color: white;
}
.info-scrollable{
  overflow-y: auto;
  height: calc(100vh - 187px);
  display: flex;
  flex-direction: column;
}
</style>
