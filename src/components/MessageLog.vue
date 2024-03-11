<script setup>
import { useServerStore } from '@/store/server';

const serverStore = useServerStore();

//watch message and scroll to bottom
watch(serverStore.messagesLog, () => {
  console.log("Scrolling to bottom");
  const monitor = document.querySelector('.monitor-console');
  if(monitor) {
    monitor.scrollTop = monitor.scrollHeight - monitor.clientHeight;
  }
});
</script>
<template>
  <!-- display log message -->
  <div class="monitor-console">
      <ol ref="monitor" class="monitor-line">
        <li v-for="(line,inx) in serverStore.messagesLog" :key="inx" class="serial-line" :style="[line.includes('Error') ? {'color':'orangered'} : {}]">
          {{line}}
        </li>
      </ol>
  </div>  
</template>
<style scoped>  
  ol{
    list-style-type: none;
    counter-reset: elementcounter;
    padding-left: 0;
  }
  li:before{
    content: "  ";
    /* content: counter(elementcounter) " |"; */
    /* counter-increment:elementcounter; */
    font-weight: bold;
  }
  .monitor-line{
    padding-left: 10px;
  }
  .monitor-console {
    padding: 8px;
    width: 100%;
    height: 100%;
    background-color: #363636;
    color: white;
    position: absolute;
    overflow-y: auto;
  }
</style>
