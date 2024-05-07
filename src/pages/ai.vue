<script setup>
import Header from '@/components/Header.vue';
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import { usePluginStore } from "@/store/plugin";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { onMounted, ref, shallowRef, nextTick } from "vue";
import { useRoute, useRouter } from 'vue-router'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import MainPanel from "@/components/MainPanel/MainPanel.vue";
import SidePanel from "@/components/MainPanel/SidePanel.vue";

import SavingProjectDialog from "@/components/dialog/SavingProjectDialog.vue";
import UploadProjectDialog from "@/components/dialog/UploadProjectDialog.vue";

import { getCurrentInstance } from 'vue'

import {sleep } from "@/engine/helper";
import ExtensionAsyncComponent from "@/components/ExtensionAsyncComponent.vue";

import RobotPoker from "@/assets/images/png/Mask_Group_12.png";
import { dialog } from 'blockly';

const confirm = useConfirm();
const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();
const pluginStore = usePluginStore();

const route = useRoute();
const router = useRouter();

const selectedMenu = ref(1);
const bottomPaneSize = ref(50);

const onBackToCoding = async () => {
  router.push("/");
};

const onResetModel = async () => {
  try{
    let message = "ข้อมูลโมเดลปัจจุบันจะถูกลบทั้งหมด คุณต้องการจะเริ่มต้นโมเดลใหม่หรือไม่ ?";
    await confirm({
      title: "ยืนยันการรีเซ็ตโมเดล",
      content : message,
      dialogProps: { width: 'auto' }
    });
    workspaceStore.resetProjectType();
    router.push("/");
  }catch(e){
    return;
  }
};
</script>
<template>
  <v-layout class="rounded rounded-md main-bg">
    <v-navigation-drawer permanent width="350" class="main-bg">
      <SidePanel v-model:selectedMenu="selectedMenu" @backToCoding="onBackToCoding" @resetModel="onResetModel">
      </SidePanel>
    </v-navigation-drawer>
    <v-main class="d-flex align-center justify-center" style="min-height: 310px; height: calc(100vh);">
      <splitpanes ref="splitpanesRef" class="default-theme" horizontal :style="{ height: selectedMenu==4 ? 'calc(100vh - 64px)' : 'calc(100vh)'}">
        <pane v-if="workspaceStore.currentBoard" :size="100 - bottomPaneSize">
          <extension-async-component v-if="selectedMenu === 1 && workspaceStore.extension" :target="workspaceStore.extension.components.Capture"></extension-async-component>
          <extension-async-component v-else-if="selectedMenu === 2 && workspaceStore.extension" :target="workspaceStore.extension.components.Annotate"></extension-async-component>
          <extension-async-component v-else-if="selectedMenu === 3 && workspaceStore.extension" :target="workspaceStore.extension.components.Train"></extension-async-component>          
        </pane>
        <pane v-else :size="100 - bottomPaneSize">
          <div class="d-flex flex-column align-center justify-center" style="height: calc(100vh);">
            <img style="margin-top: 100px" width="400" :src="RobotPoker"/>
            <span style="margin-top: 50px; display: block;text-align: center;font-size: 25px;"> สร้างโปรเจคใหม่ หรือ เลือกกดเมนูด้านซ้ายมือ</span>
          </div>
        </pane>
      </splitpanes>
    </v-main>
    <SavingProjectDialog></SavingProjectDialog>
    <UploadProjectDialog></UploadProjectDialog>
  </v-layout>
</template>

<route lang="yaml">
meta:
  layout: blank
</route>
