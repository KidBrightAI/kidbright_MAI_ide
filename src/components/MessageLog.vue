<script setup>
import { useWorkspaceStore } from '@/store/workspace';

const workspaceStore = useWorkspaceStore();
</script>
<template>
  <!-- display log message -->
  <div class="monitor-console">
      <ol ref="monitor" class="monitor-line">
        <li v-for="(line,inx) in workspaceStore.messageLog" :key="inx" class="serial-line" :style="[line.includes('Error') ? {'color':'orangered'} : {}]">
          {{line}}
        </li>
      </ol>
  </div>  
</template>
