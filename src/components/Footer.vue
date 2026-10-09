<script setup>
import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"

import {toast} from "vue3-toastify"

const defineEmits = defineEmits(["undo","redo","download","terminal"])
const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()

const terminalDiv = shallowRef()
</script>


<template>
  <div class="footer-layout">
    <!--
      Everything that floats above the footer edge sits in one group
      anchored bottom-right: undo/redo, the active board name, then
      the terminal toggle. The board name used to float bottom-left,
      where it covered the last toolbox category.
    -->
    <div
      v-if="workspaceStore.currentBoard"
      class="footer-floating-group"
    >
      <div class="footer-control-btn-container">
        <VBtn
          icon
          density="comfortable"
          color="primary"
          variant="tonal"
          class="mx-1"
          @click="$emit('undo')"
        >
          <VIcon>mdi-undo</VIcon>
        </VBtn>
        <VBtn
          icon
          density="comfortable"
          color="primary"
          variant="tonal"
          class="mx-1"
          @click="$emit('redo')"
        >
          <VIcon>mdi-redo</VIcon>
        </VBtn>
      </div>

      <div class="board-info-floating">
        <VIcon
          color="white"
          size="24"
          class="me-2"
        >
          mdi-chip
        </VIcon>
        <span class="text-h6 text-white">{{ workspaceStore.currentBoard.name }}</span>
      </div>

      <div
        class="terminal-floating"
        :class="{ disabled: !boardStore.isBoardConnected }"
        :title="boardStore.isBoardConnected ? $t('footer.openTerminal') : $t('footer.connectBoardFirst')"
        @click="boardStore.isBoardConnected && $emit('terminal')"
      >
        <span class="text-h5 text-white px-3">>_ {{ $t('footer.terminal') }}</span>
      </div>
    </div>
    <VFooter
      class="footer-panel"
      style="height: 100% !important;"
    >
      <div class="footer-container">            
        <!--
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
        -->
        <VDivider class="mt-2" />
        <div
          ref="terminalDiv"
          class="serial-monitor"
        />
      </div>    
    </VFooter>
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
.footer-floating-group{
  position: absolute;
  right: 0;
  margin-top: -60px;
  height: 60px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  z-index: 9999;
  pointer-events: none;
}
.footer-floating-group > *{
  pointer-events: auto;
}
.footer-control-btn-container{
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  padding: 5px;
  background-color: #E4E4E4;
  border-radius: 8px;
}
.footer-header{
  min-height: 18px; 
}
.terminal-floating{
  height: 60px;
  border-radius: 10px 10px 0 0;
  padding: 15px 5px 5px 5px;
  background-color: #333333;
  cursor: pointer;
  transition: opacity 0.2s;
}
.terminal-floating.disabled{
  opacity: 0.45;
  cursor: not-allowed;
}
.board-info-floating {
  height: 60px;
  border-radius: 10px 10px 0 0;
  padding: 15px 15px 5px 15px;
  background-color: #007E4E;
  display: flex;
  align-items: center;
  pointer-events: none; /* display only, let clicks pass through */
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
