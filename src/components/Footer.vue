<script setup>
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";

import {toast} from "vue3-toastify";

const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();

const terminalDiv = shallowRef();
const defineEmits = defineEmits(["undo","redo","download","terminal"]);
</script>

<template>
  <div class="footer-layout">
    <div class="terminal-floating" @click="$emit('terminal')">        
      <span class="text-h5 text-white px-3">>_ Terminal</span>
    </div>  
    <div class="footer-control-btn-container">
      <v-btn icon density="comfortable" color="primary" variant="tonal" class="mx-1" @click="$emit('undo')">
        <v-icon>mdi-undo</v-icon>
      </v-btn>
      <v-btn icon density="comfortable" color="primary" variant="tonal" class="mx-1" @click="$emit('redo')">
        <v-icon>mdi-redo</v-icon>
      </v-btn>
    </div>
    <v-footer class="footer-panel" style="height: 100% !important;">
      <div class="footer-container">            
        <!-- <div class="d-flex flex-row align-center footer-header">      
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
        </div>       -->
        <VDivider class="mt-2"></VDivider>
        <div class="serial-monitor" ref="terminalDiv"></div>
      </div>    
    </v-footer>
</div>

</template>
<style scoped>
.footer-layout{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.footer-panel{
  background-color: #333333;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: start;
  padding-left: 15px !important;
  padding-right: 15px !important;
  padding-block-end: 15px !important;
  padding-block-start: 15px !important;
}
.footer-container{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;  
  margin: 0;
}
.footer-control-btn-container{
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  padding: 5px;
  position: absolute;
  margin-top: -60px;
  right: 200px;
  z-index: 9999;
  background-color: #E4E4E4;
  border-radius: 8px;
}
.footer-header{
  min-height: 18px; 
}
.terminal-floating{
  position: absolute;
  height: 60px;
  margin-top: -60px;
  border-radius: 10px 10px 0 0;  
  right: 0;
  padding: 15px 5px 5px 5px;
  background-color: #333333;
  z-index: 9999;
  cursor: pointer;
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
