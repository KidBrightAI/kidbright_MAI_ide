<script setup>
import kbbtn from "@/components/buttons/kbbtn.vue";

import connectIcon from "@/assets/images/icons/btn_connect.png";
import connectedIcon from "@/assets/images/icons/btn_connected.png";

import wifiIcon from "@/assets/images/icons/btn_wifi.png";
import wifiOffIcon from "@/assets/images/icons/btn_wifi_off.png";

import fileIcon from "@/assets/images/icons/btn_file.png";
import fileOffIcon from "@/assets/images/icons/btn_file_dis.png";

import aiIcon from "@/assets/images/icons/btn_ai.png";
import aiOffIcon from "@/assets/images/icons/btn_ai_off.png";

import pluginIcon from "@/assets/images/icons/btn_plugin.png";

import newIcon from "@/assets/images/icons/btn_new.png";
import saveIcon from "@/assets/images/icons/btn_save.png";
import openIcon from "@/assets/images/icons/btn_open.png";

import uploadIcon from "@/assets/images/icons/btn_upload_02.png";
import uploadDisabledIcon from "@/assets/images/icons/btn_upload_02.png";

import kbhead from "@/assets/KidBrightHead.png";
import kblogo from "@/assets/kblogo_white.png";

import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import {toast} from "vue3-toastify";

const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();
const projectName = ref(workspaceStore.name);
const defineEmits = defineEmits(["serial","example", "help", "firmware", "extraSave","plugin","download","newProject","openProject","saveProject","connectBoard","fileBrowser","connectWifi","newModel"]);
const loading = ref(false);

const saveProjetName = () => {
  loading.value = true;
  setTimeout(() => {
    workspaceStore.name = projectName.value;
    loading.value = false;
    toast.success("Project name saved");
  }, 2000);
};

watch(() => workspaceStore.name, (val) => {
  projectName.value = val;
});
</script>

<template>  
  <v-app-bar color="primary" height="100">    
    <div class="d-flex align-center">
      <v-img :src="kbhead" height="90" width="90" class="ms-5" alt="KidBright Micro AI IDE"></v-img>
      <v-img :src="kblogo" height="60" width="340" class="ms-2 mt-3"></v-img>
    </div>
    <v-spacer></v-spacer>
    <v-tooltip text="Connect Board">
      <template v-slot:activator="{ props }">
        <kbbtn 
          class="mx-1" 
          :icon="connectIcon" 
          :disabledIcon="connectedIcon" 
          :statusIcon="connectedIcon" 
          :disabled="false" 
          :status="boardStore.isBoardConnected" 
          v-bind="props" 
          @click="$emit('connectBoard')"
        />
      </template>
    </v-tooltip>

    <v-tooltip text="Upload Code">
      <template v-slot:activator="{ props }">
        <kbbtn 
          class="mx-1" 
          :icon="uploadIcon" 
          :disabledIcon="uploadDisabledIcon" 
          :disabled="!boardStore.isBoardConnected" 
          v-bind="props" 
          @click="(ev)=>$emit('download',ev)"
        />
      </template>
    </v-tooltip>

    <v-tooltip text="File Browser">
      <template v-slot:activator="{ props }">
        <kbbtn 
          class="mx-1" 
          :icon="fileIcon" 
          :disabledIcon="fileOffIcon" 
          :disabled="!boardStore.isBoardConnected" 
          v-bind="props" 
          @click="$emit('fileBrowser')"
        />
      </template>
    </v-tooltip>

    <v-tooltip text="WiFi Connect">
      <template v-slot:activator="{ props }">
        <kbbtn 
          class="mx-1" 
          :icon="wifiIcon" 
          :status="!boardStore.wifiConnected" 
          :statusIcon="wifiOffIcon" 
          :disabledIcon="wifiOffIcon" 
          :disabled="!boardStore.isBoardConnected" 
          v-bind="props" 
          @click="$emit('connectWifi')"
        />
      </template>
    </v-tooltip>

    <v-tooltip text="AI Model">
      <template v-slot:activator="{ props }">
        <kbbtn 
          class="mx-1" 
          :icon="aiIcon" 
          :disabledIcon="aiOffIcon" 
          :disabled="!boardStore.isBoardConnected"
          :status="!workspaceStore.projectType" 
          :statusIcon="aiOffIcon"
          v-bind="props" 
          @click="$emit('newModel')"
        />
      </template>
    </v-tooltip>

    <v-tooltip text="Plugins">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="pluginIcon" :disabled="false" v-bind="props" @click="$emit('plugin')"/>
      </template>
    </v-tooltip>

    <v-divider vertical :thickness="3" class="mx-2"></v-divider>

    <v-tooltip text="New Project">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="newIcon" :disabled="false" v-bind="props" @click="$emit('newProject')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="Open Project">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="openIcon" :disabled="false" v-bind="props" @click="$emit('openProject')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="Save Project">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1 me-5" :icon="saveIcon" :disabled="false" v-bind="props" @click="$emit('saveProject')"/>
      </template>
    </v-tooltip>

    <div class="d-flex flex-column align-center">
      <span class="text-title text-white me-2">Version 1.0.0</span>
    </div>

    <!-- <v-tooltip text="Plugins">
      <template v-slot:activator="{ props }">
        <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('plugin')">
          <v-icon>mdi-puzzle-plus</v-icon>
        </v-btn>
      </template>
    </v-tooltip> -->

    <!-- <v-tooltip text="Examples">
      <template v-slot:activator="{ props }">
        <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('example')">
          <v-icon>mdi-book-education</v-icon>
        </v-btn>
      </template>
    </v-tooltip> -->

    <!-- <v-tooltip text="Serial Console">
      <template v-slot:activator="{ props }">
        <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('serial')" :disabled="!boardStore.isConnected()">
          <v-icon>mdi-console</v-icon>
        </v-btn>
      </template>
    </v-tooltip> -->

  </v-app-bar>
</template>
<style lang="scss" scoped>
.logo-text {
  font-family: "Arial Rounded MT";
  font-weight: 500;
}
</style>
