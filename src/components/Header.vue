<script setup>
import Kbbtn from "@/components/buttons/kbbtn.vue"

import connectIcon from "@/assets/images/icons/btn_connect.png"
import connectedIcon from "@/assets/images/icons/btn_connected.png"

import wifiIcon from "@/assets/images/icons/btn_wifi.png"
import wifiOffIcon from "@/assets/images/icons/btn_wifi_off.png"

import fileIcon from "@/assets/images/icons/btn_file.png"
import fileOffIcon from "@/assets/images/icons/btn_file_dis.png"

import aiIcon from "@/assets/images/icons/btn_ai.png"
import aiOffIcon from "@/assets/images/icons/btn_ai_off.png"

import pluginIcon from "@/assets/images/icons/btn_plugin.png"

import newIcon from "@/assets/images/icons/btn_new.png"
import saveIcon from "@/assets/images/icons/btn_save.png"
import openIcon from "@/assets/images/icons/btn_open.png"

import uploadIcon from "@/assets/images/icons/btn_upload_02.png"
const uploadDisabledIcon = uploadIcon

import kbhead from "@/assets/KidBrightHead.png"
import kblogo from "@/assets/kblogo_white.png"

import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"
import {toast} from "vue3-toastify"

const emit = defineEmits(["serial","example", "help", "firmware", "extraSave","plugin","download","newProject","openProject","saveProject","connectBoard","fileBrowser","connectWifi","newModel"])
console.log("Header setup running")
const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()
const projectName = ref(workspaceStore.name)
const loading = ref(false)

const saveProjetName = () => {
  loading.value = true
  setTimeout(() => {
    workspaceStore.name = projectName.value
    loading.value = false
    toast.success("Project name saved")
  }, 2000)
}

watch(() => workspaceStore.name, val => {
  projectName.value = val
})
</script>

<template>  
  <VAppBar
    color="primary"
    height="100"
  >    
    <div class="d-flex align-center">
      <VImg
        :src="kbhead"
        height="90"
        width="90"
        class="ms-5"
        alt="KidBright Micro AI IDE"
      />
      <VImg
        :src="kblogo"
        height="60"
        width="340"
        class="ms-2 mt-3"
      />
    </div>
    <VSpacer />
    <VTooltip text="Connect Board">
      <template #activator="{ props }">
        <Kbbtn 
          class="mx-1" 
          :icon="connectIcon" 
          :disabled-icon="connectedIcon" 
          :status-icon="connectedIcon" 
          :disabled="false" 
          :status="boardStore.isBoardConnected" 
          v-bind="props" 
          @click="$emit('connectBoard')"
        />
      </template>
    </VTooltip>

    <VTooltip text="Upload Code">
      <template #activator="{ props }">
        <Kbbtn 
          class="mx-1" 
          :icon="uploadIcon" 
          :disabled-icon="uploadDisabledIcon" 
          :disabled="!boardStore.isBoardConnected" 
          v-bind="props" 
          @click="(ev)=>$emit('download',ev)"
        />
      </template>
    </VTooltip>

    <VTooltip text="File Browser">
      <template #activator="{ props }">
        <Kbbtn 
          class="mx-1" 
          :icon="fileIcon" 
          :disabled-icon="fileOffIcon" 
          :disabled="!boardStore.isBoardConnected" 
          v-bind="props" 
          @click="$emit('fileBrowser')"
        />
      </template>
    </VTooltip>

    <VTooltip text="WiFi Connect">
      <template #activator="{ props }">
        <Kbbtn 
          class="mx-1" 
          :icon="wifiIcon" 
          :status="!boardStore.wifiConnected" 
          :status-icon="wifiOffIcon" 
          :disabled-icon="wifiOffIcon" 
          :disabled="!boardStore.isBoardConnected" 
          v-bind="props" 
          @click="$emit('connectWifi')"
        />
      </template>
    </VTooltip>

    <VTooltip text="AI Model">
      <template #activator="{ props }">
        <Kbbtn 
          class="mx-1" 
          :icon="aiIcon" 
          :disabled-icon="aiOffIcon" 
          :disabled="false"
          :status="!workspaceStore.projectType" 
          :status-icon="aiOffIcon"
          v-bind="props" 
          @click="$emit('newModel')"
        />
      </template>
    </VTooltip>

    <VTooltip text="Plugins">
      <template #activator="{ props }">
        <Kbbtn
          class="mx-1"
          :icon="pluginIcon"
          :disabled="false"
          v-bind="props"
          @click="$emit('plugin')"
        />
      </template>
    </VTooltip>

    <VDivider
      vertical
      :thickness="3"
      class="mx-2"
    />

    <VTooltip text="New Project">
      <template #activator="{ props }">
        <Kbbtn
          class="mx-1"
          :icon="newIcon"
          :disabled="false"
          v-bind="props"
          @click="$emit('newProject')"
        />
      </template>
    </VTooltip>

    <VTooltip text="Open Project">
      <template #activator="{ props }">
        <Kbbtn
          class="mx-1"
          :icon="openIcon"
          :disabled="false"
          v-bind="props"
          @click="$emit('openProject')"
        />
      </template>
    </VTooltip>

    <VTooltip text="Save Project">
      <template #activator="{ props }">
        <Kbbtn
          class="mx-1 me-5"
          :icon="saveIcon"
          :disabled="false"
          v-bind="props"
          @click="$emit('saveProject')"
        />
      </template>
    </VTooltip>

    <div class="d-flex flex-column align-center">
      <span class="text-title text-white me-2">Version 1.0.0</span>
    </div>

    <!--
      <v-tooltip text="Plugins">
      <template v-slot:activator="{ props }">
      <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('plugin')">
      <v-icon>mdi-puzzle-plus</v-icon>
      </v-btn>
      </template>
      </v-tooltip> 
    -->

    <!--
      <v-tooltip text="Examples">
      <template v-slot:activator="{ props }">
      <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('example')">
      <v-icon>mdi-book-education</v-icon>
      </v-btn>
      </template>
      </v-tooltip> 
    -->

    <!--
      <v-tooltip text="Serial Console">
      <template v-slot:activator="{ props }">
      <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('serial')" :disabled="!boardStore.isConnected()">
      <v-icon>mdi-console</v-icon>
      </v-btn>
      </template>
      </v-tooltip> 
    -->
  </VAppBar>
</template>

<style lang="scss" scoped>
.logo-text {
  font-family: "Arial Rounded MT";
  font-weight: 500;
}
</style>
