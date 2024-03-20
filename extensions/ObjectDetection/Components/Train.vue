<template>
  <div class="w-100 h-100">
    <splitpanes ref="splitpanesRef" class="default-theme" horizontal :style="{ height: selectedMenu==4 ? 'calc(100vh - 64px)' : 'calc(100vh)'}">
        <pane>
          <TrainingToolbar 
            @train="train"
            @test="test"
            @download="download"
            colab-url="https://colab.research.google.com/drive/1Nij-J3C4J5gTZl0x79e4lxCG5EPBwsQM#scrollTo=3HF3WZ4ej4_D"
          ></TrainingToolbar>
          <ModelDesigner ref="modelDesigner"></ModelDesigner>
        </pane>        
        <pane :min-size="10" :size="30" :max-size="80">          
          <VTabs v-model="tab">
            <VTab value="Message">
              Message log {{ serverStore.epoch && serverStore.totalEpoch ? `(${serverStore.epoch}/${serverStore.totalEpoch})` : ''}}              
            </VTab>
            <VTab value="Accuracy">
              Accuracy
            </VTab>
            <VTab value="Loss">
              Loss
            </VTab>
          </VTabs>
          <div class="h-100">
          <VCard class="h-100">
            <VCardText class="h-100 pa-0">
              <VWindow v-model="tab" class="h-100">
                <VWindowItem value="Message" class="h-100">
                  <MessageLog/>
                </VWindowItem>
                <VWindowItem value="Accuracy" class="h-100 pa-2">                
                  <AccuracyMatrixChart></AccuracyMatrixChart>
                </VWindowItem>
                <VWindowItem value="Loss" class="h-100 pa-2">
                  <LossMatrixChart></LossMatrixChart>
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
import { useServerStore } from '@/store/server';
import { toast } from "vue3-toastify";
import ModelDesigner from "@/components/ModelDesigner.vue";
import TrainingToolbar from "@/components/TrainingToolbar.vue";
import AccuracyMatrixChart from "@/components/charts/AccuracyMatrixChart.vue";
import LossMatrixChart from "@/components/charts/LossMatrixChart.vue";
import MessageLog from "@/components/MessageLog.vue";

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onMounted } from 'vue';

const workspaceStore = useWorkspaceStore();
const serverStore = useServerStore();

const tab = ref(0);
const selectedMenu = ref(0);
const modelDesigner = ref(null);
const lossMatrix = ref(null);
const accuracyMatrix = ref(null);

const train = async () => {
  if (serverStore.isColabConnected) {
    if(modelDesigner.value){
      await modelDesigner.value.saveGraph();
    }
    serverStore.trainColab();
  } else {
    toast.error("Please connect to Google Colab first");
  }
};

const test = async () => {
  if (workspaceStore.isColabConnected) {
    workspaceStore.test();
  } else {
    toast.error("Please connect to Google Colab first");
  }
};

const download = async () => {
  await serverStore.convertModel();
};
</script>
