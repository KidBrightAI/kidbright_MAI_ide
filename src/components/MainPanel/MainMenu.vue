<template>
  <div class="d-flex flex-wrap justify-center">
    <VTooltip text="สร้างโปรเจคใหม่" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('newProject')" v-bind="props">
          <img src="@/assets/images/png/Group 187.png" height="55" />
        </div>
      </template>      
    </VTooltip>
    <VTooltip text="เปิดโปรเจค" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('openProject')" v-bind="props">
          <img src="@/assets/images/png/Group 185.png" height="55" />
        </div>
      </template>      
    </VTooltip>
    <VTooltip text="บันทึกโปรเจค" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('saveProject')" v-bind="props">
          <img src="@/assets/images/png/Group 186.png" height="55" />
        </div>
      </template>      
    </VTooltip>
    <VTooltip text="ลบโปรเจค" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('deleteProject')" v-bind="props">
          <img src="@/assets/images/png/Group 188.png" height="55" />
        </div>
      </template>      
    </VTooltip>
  </div>
</template>
