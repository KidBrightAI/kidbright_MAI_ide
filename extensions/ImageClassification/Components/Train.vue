<template>
  <div class="w-100 h-100">
    <splitpanes ref="splitpanesRef" class="default-theme" horizontal :style="{ height: selectedMenu==4 ? 'calc(100vh - 64px)' : 'calc(100vh)'}">
        <pane>
          <TrainingToolbar></TrainingToolbar>
          <ModelDesigner :graph="workspaceStore.graph"></ModelDesigner>
        </pane>        
        <pane :min-size="10" :size="30" :max-size="80">          
          <VTabs v-model="tab">
            <VTab value="Message">Message log</VTab>
            <VTab value="Loss">Loss</VTab>
            <VTab value="Accuracy">Accuracy</VTab>
          </VTabs>
          <div class="h-100">
          <VCard class="h-100">
            <VCardText class="h-100 pa-2">
              <VWindow v-model="tab" class="h-100">
                <VWindowItem value="Message" class="h-100">
                  MessageLog
                </VWindowItem>
                <VWindowItem value="Loss" class="h-100">                
                  <MetrixChart/>
                </VWindowItem>
                <VWindowItem value="Accuracy" class="h-100">
                  <MetrixChart/>
                </VWindowItem>
              </VWindow>
            </VCardText> 
          </VCard>
          </div>
        </pane>
      </splitpanes>    
  </div>
</template>

<script setup>
import { useWorkspaceStore } from '@/store/workspace';
import { toast } from "vue3-toastify";
import ModelDesigner from "@/components/ModelDesigner.vue";
import TrainingToolbar from "@/components/TrainingToolbar.vue";
import MetrixChart from "@/components/charts/MetrixChart.vue";

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onMounted } from 'vue';

const workspaceStore = useWorkspaceStore();

const tab = ref(0);
const selectedMenu = ref(0);
</script>
