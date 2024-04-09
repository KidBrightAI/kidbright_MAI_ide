<template>
  <div class="left-panel d-flex flex-column">
    <div class="l-title font-weight-bold">KidBright μAI</div>
    <main-menu @newProject="$emit('newProject')" @openProject="$emit('openProject')" @saveProject="$emit('saveProject')" @deleteProject="$emit('deleteProject')"></main-menu>
    <div class="left-bottom-content d-flex flex-fill position-relative">
      <div class="header-left-bar">
        <div class="proj-name">
          {{ workspaceStore.name || 'สร้างหรือเลือกโปรเจคใหม่' }}
        </div>
        <div class="proj-type">
          Type : {{ workspaceStore.projectTypeTitle || '-' }}
        </div>

        <div v-if="workspaceStore.currentBoard" class="d-flex w-100 align-center justify-center mt-3">
          <v-btn density="comfortable" class="mx-1" color="grey-lighten-3" icon="mdi-brain" @click="$emit('newModel')"></v-btn>
          <v-btn density="comfortable" class="mx-1" color="grey-lighten-3" icon="mdi-usb" @click="$emit('connectBoard')"></v-btn>
          <v-btn density="comfortable" class="mx-1" color="grey-lighten-3" icon="mdi-wifi" @click="$emit('connectWifi')" :disabled="!isConnected"></v-btn> 
          <v-btn density="comfortable" class="mx-1" color="grey-lighten-3" icon="mdi-folder" @click="$emit('fileBrowser')" :disabled="!isConnected"></v-btn>
          <!-- <v-btn density="comfortable" class="mx-1" color="grey-lighten-3" icon="mdi-console" @click="$emit('terminal')" :disabled="!isConnected || selectedMenu != 4"></v-btn> -->
          <v-btn density="comfortable" class="mx-1" color="grey-lighten-3" icon="mdi-restart" @click="$emit('restartBoard')" :disabled="!isConnected"></v-btn>
        </div>
      </div>
      <ul class="step">
        <li
          :class="{
            current: selectedMenu === 1,
            inactive: workspaceStore.id == null || workspaceStore.projectType == null,
          }"
          @click="workspaceStore.id && workspaceStore.projectType && handleTabChange(1)"
        >
          <img src="@/assets/images/png/capture.png" alt="" srcset="" />
        </li>
        <li
          v-bind:class="{
            current: selectedMenu === 2,
            inactive: workspaceStore.id == null || workspaceStore.projectType == null,
          }"
          @click="workspaceStore.id && workspaceStore.projectType && handleTabChange(2)"
        >
          <img src="@/assets/images/png/annotate.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 3,
            inactive: workspaceStore.id == null || workspaceStore.projectType == null,
          }"
          @click="workspaceStore.id && workspaceStore.projectType && handleTabChange(3)"
        >
          <img src="@/assets/images/png/train.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 4,
            inactive: workspaceStore.id == null,
          }"
          @click="workspaceStore.id && workspaceStore.projectType && handleTabChange(4)"
        >
          <img src="@/assets/images/png/code.png" alt="" srcset="" />
        </li>
      </ul>
      <!-- <div v-if="workspaceStore.projectType == null" class="hint">
        <div class="main-hint txt notype">
          <p v-if="workspaceStore.projectType == null">
            เริ่มใช้งานโดยกด
            <img src="@/assets/images/png/Group_105.png" alt="" srcset="" />
            เพื่อสร้างโปรเจคและทำการเลือกประเภทการเรียนรู้
            <span class="p-color">Object Detection</span> หรือ
            <span class="p-color">Image Classification</span
            ><br /><br />ในกรณีที่เลือก
            <span class="p-color">Object Detection</span>
            กระบวนการสร้างโมเดล (Training) ทำบน Colab
            จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตให้เรียบร้อยก่อน<br /><br />ในกรณีที่เลือก
            <span class="p-color">Image Classification</span>
            กระบวนการสร้างโมเดล (Training) ทำบน KidBright AI
          </p>
        </div>
        <div class="mascot">
          <img
            src="@/assets/images/png/Mask_Group_11.png"
            alt=""
            srcset=""
          />
        </div>
      </div> -->
      <div v-if="selectedMenu === 1" class="pt-3 h-100 overflow-hidden">
        <InstructionAsyncComponent
          v-if="!workspaceStore?.extension?.instructions?.capture"
          target="CaptureInstruction.vue"
        ></InstructionAsyncComponent>
        <extension-async-component
          v-else
          :target="workspaceStore?.extension?.instructions?.capture"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 2" class="pt-3 h-100 overflow-hidden">
        <InstructionAsyncComponent
          v-if="!workspaceStore?.extension?.instructions?.annotate"
          target="AnnatateInstruction.vue"
        ></InstructionAsyncComponent>
        <extension-async-component
          v-else
          :target="workspaceStore?.extension?.instructions?.annotate"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 3" class="pt-3 h-100 overflow-hidden">
        <InstructionAsyncComponent
          v-if="!workspaceStore?.extension?.instructions?.train"
          target="TrainInstruction.vue"
        ></InstructionAsyncComponent>
        <extension-async-component
          v-else
          :target="workspaceStore?.extension?.instructions?.train"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 4" class="pt-3 h-100 overflow-hidden">
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
</template>
<script setup>
import MainMenu from "@/components/MainPanel/MainMenu.vue";
import { computed } from "vue";
import InstructionAsyncComponent from "@/components/InstructionAsyncComponent.vue";
import ExtensionAsyncComponent from "@/components/ExtensionAsyncComponent.vue";
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";

const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();

const props = defineProps({
  selectedMenu : {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits([
  "update:selectedMenu", 
  "newProject", "openProject", "saveProject", "deleteProject", "connectBoard", "connectWifi", "fileBrowser", "terminal", "restartBoard", "newModel"]);
//const exts = this.$extensions;
const isOnline = computed(() => window.navigator.onLine);

const handleTabChange = (tabIndex) => {
  emit("update:selectedMenu", tabIndex);
};

const isConnected = computed(() => {
  return boardStore.isConnected();
});
</script>
