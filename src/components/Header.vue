<script setup>
import kbbtn from "@/components/buttons/kbbtn.vue";
import connectIcon from "@/assets/images/icons/connectbtn.png";
import wifiIcon from "@/assets/images/icons/wifibtn.png";
import fileIcon from "@/assets/images/icons/filebtn.png";
import aiIcon from "@/assets/images/icons/aibtn.png";
import qrIcon from "@/assets/images/icons/pluginsbtn.png";

import newIcon from "@/assets/images/icons/newbtn.png";
import saveIcon from "@/assets/images/icons/savebtn.png";
import openIcon from "@/assets/images/icons/openbtn.png";
import uploadIcon from "@/assets/images/icons/uploadbtn.png";

import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import {toast} from "vue3-toastify";

const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();
const projectName = ref(workspaceStore.name);
const defineEmits = defineEmits(["serial","example", "help", "firmware", "extraSave","plugin"]);
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
    <span class="text-h3 text-white ms-5 logo-text">Kidbright μAI</span>
    
    <v-spacer></v-spacer>
    <v-tooltip text="Connect Board">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="connectIcon" :disabled="false" v-bind="props" @click="$emit('connectBoard')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="File Browser">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="fileIcon" :disabled="false" v-bind="props" @click="$emit('fileBrowser')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="WiFi Connect">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="wifiIcon" :disabled="false" v-bind="props" @click="$emit('connectWifi')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="AI Model">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="aiIcon" :disabled="false" v-bind="props" @click="$emit('newModel')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="Plugins">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1" :icon="qrIcon" :disabled="false" v-bind="props" @click="$emit('plugin')"/>
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
        <kbbtn class="mx-1" :icon="saveIcon" :disabled="false" v-bind="props" @click="$emit('saveProject')"/>
      </template>
    </v-tooltip>

    <v-tooltip text="Upload Code">
      <template v-slot:activator="{ props }">
        <kbbtn class="mx-1 me-5" :icon="uploadIcon" :disabled="false" v-bind="props" @click="$emit('download')"/>
      </template>
    </v-tooltip>

    <div class="d-flex flex-column align-center">
      <span class="text-h6 text-yellow me-2">EN/TH</span>
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
