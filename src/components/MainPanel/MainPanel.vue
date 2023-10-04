<template>
  <div class="left-panel d-flex flex-column">
    <div class="l-title font-weight-bold">KidBright AI</div>
    <main-menu></main-menu>
    <div class="left-bottom-content d-flex flex-fill position-relative">
      <div class="header-left-bar">
        <div class="proj-name">
          {{ 'สร้างหรือเลือกโปรเจคใหม่' }}
        </div>
        <div class="proj-type">
          Type : {{ '-' }}
        </div>

        <div class="header-action-button">
          <b-button>
            <VIcon class="mr-1" :icon="'wifi'"></VIcon>
            {{ "ONLINE"}}
          </b-button>

          <b-button :disabled="true">
            <b-icon class="mr-1" icon="laptop"></b-icon>
            Kidbright Mai
          </b-button>
        </div>
      </div>
      <ul class="step">
        <li
          :class="{
            current: selectedMenu === 1,
            inactive: projectStore.project.id == null,
          }"
          @click="projectStore.project.id && handleTabChange(1)"
        >
          <img src="@/assets/images/png/capture.png" alt="" srcset="" />
        </li>
        <li
          v-bind:class="{
            current: selectedMenu === 2,
            inactive: dataLength <= 0,
          }"
          v-on:click="
            if (dataLength > 0) {
              handleTabChange(2);
            }
          "
        >
          <img src="@/assets/images/png/annotate.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 3,
            inactive: getLabeledLength <= 0,
          }"
          @click="
            if (getLabeledLength > 0) {
              handleTabChange(3);
            }
          "
        >
          <img src="@/assets/images/png/train.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 4,
            inactive: currentDevice == 'BROWSER' && !project.tfjs && !project.trained,
          }"
          @click="
              handleTabChange(4);
          "
        >
          <img src="@/assets/images/png/code.png" alt="" srcset="" />
        </li>
      </ul>
      <div v-if="projectStore.project.projectType == null" class="hint">
        <div class="main-hint txt notype">
          <p v-if="projectStore.project.projectType == null">
            เริ่มใช้งานโดยกด
            <img src="@/assets/images/png/Group 105.png" alt="" srcset="" />
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
            v-if="!isRunning"
            src="@/assets/images/png/Mask Group 11.png"
            alt=""
            srcset=""
          />
        </div>
      </div>
      <!--div v-if="selectedMenu === 1" class="d-contents">
        <async-component
          v-if="!projectStore.project.extension.instructions.capture"
          target="./Instructions/CaptureInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.capture"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 2" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.annotate"
          target="./Instructions/AnnatateInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.annotate"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 3" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.train"
          target="./Instructions/TrainInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.train"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 4" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.coding"
          target="./Instructions/CodingInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.coding"
        ></extension-async-component>
      </div-->
    </div>
  </div>
</template>
<script setup>
import MainMenu from "@/components/MainPanel/MainMenu.vue";
import { computed } from "vue";
import AsyncComponent from "@/components/AsyncComponent.vue";
import ExtensionAsyncComponent from "@/components/ExtensionAsyncComponent.vue";

import { useProjectStore } from "@/store/project";

const projectStore = useProjectStore();

const props = defineProps({
  selectedMenu : {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["menuChange"]);
//const exts = this.$extensions;
const isOnline = computed(() => window.navigator.onLine);

const handleTabChange = (tabIndex) => {
  emit("menuChange", tabIndex);
};
</script>
