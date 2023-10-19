<template>
  <div class="d-flex flex-wrap justify-center">
    <VTooltip text="สร้างโปรเจคใหม่" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('newProject')" v-bind="props">
          <img src="@/assets/images/png/Group_187.png" height="55" />
        </div>
      </template>      
    </VTooltip>
    <VTooltip text="เปิดโปรเจค" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('openProject')" v-bind="props">
          <img src="@/assets/images/png/Group_185.png" height="55" />
        </div>
      </template>      
    </VTooltip>
    <VTooltip text="บันทึกโปรเจค" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('saveProject')" v-bind="props">
          <img src="@/assets/images/png/Group_186.png" height="55" />
        </div>
      </template>      
    </VTooltip>
    <VTooltip text="ลบโปรเจค" location="bottom">
      <template v-slot:activator="{ props }">
        <div class="btn-base op-btn mx-1" @click="$emit('deleteProject')" v-bind="props">
          <img src="@/assets/images/png/Group_188.png" height="55" />
        </div>
      </template>      
    </VTooltip>
  </div>
</template>
