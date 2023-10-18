<script setup>
import logo from '@/assets/images/logos/logo.jpg';
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
  <v-app-bar color="primary" height="64">    
    <v-spacer></v-spacer>
    <v-tooltip text="Plugins">
      <template v-slot:activator="{ props }">
        <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('plugin')">
          <v-icon>mdi-puzzle-plus</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- <v-tooltip text="Examples">
      <template v-slot:activator="{ props }">
        <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('example')">
          <v-icon>mdi-book-education</v-icon>
        </v-btn>
      </template>
    </v-tooltip> -->

    <v-tooltip text="Serial Console">
      <template v-slot:activator="{ props }">
        <v-btn icon variant="tonal" color="white" class="mx-1" v-bind="props" @click="$emit('serial')" :disabled="!boardStore.isConnected()">
          <v-icon>mdi-console</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

  </v-app-bar>
</template>
