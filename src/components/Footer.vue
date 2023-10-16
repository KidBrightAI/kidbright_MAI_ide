<script setup>
import logo from '@/assets/images/logos/logo.jpg';
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";

import {toast} from "vue3-toastify";

const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();

const terminalDiv = shallowRef();
const defineEmits = defineEmits(["undo","redo","download"]);
</script>

<template>
  <v-footer class="footer-panel" color="primary">
    <div class="footer-container">
      <div class="d-flex flex-row align-center footer-header">                
        <v-spacer></v-spacer>
        <v-tooltip text="Undo">
          <template v-slot:activator="{ props }">
            <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('undo')">
              <v-icon>mdi-undo</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Redo">
          <template v-slot:activator="{ props }">
            <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('redo')">
              <v-icon>mdi-redo</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Download and Run">
          <template v-slot:activator="{ props }">
            <v-btn 
              :loading="boardStore.uploading"
              :disabled="boardStore.uploading || !boardStore.isConnected()"
              prepend-icon="mdi-play" 
              size="large" 
              color="white" 
              class="mx-3 me-5 rounded-pill" 
              variant="outlined" 
              v-bind="props"  
              @click="$emit('download')"
            >            
              RUN
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      <VDivider class="mt-2"></VDivider>
      <div class="serial-monitor" ref="terminalDiv">
      </div>
    </div>
  </v-footer>
</template>
<style scoped>
.footer-panel{
  height: 100%;
  width: 100%;
  display: flex;
  align-items: start;
  padding-left: 15px !important;
  padding-right: 15px !important;
  padding-block-end: 15px !important;
}
.footer-container{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;  
  margin: 0;
}
.footer-header{
  height: 64px; 
}
.serial-monitor {
  background-color: #101214;
  height: 100%;
  width: 100%;
}
</style>
<style>
.xterm{
  padding-left: 10px;
  padding-top: 5px; 
}
</style>
