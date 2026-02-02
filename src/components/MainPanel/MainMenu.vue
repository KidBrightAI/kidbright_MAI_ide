<template>
  <div class="d-flex flex-wrap justify-center">
    <VTooltip
      text="สร้างโปรเจคใหม่"
      location="bottom"
    >
      <template #activator="{ props }">
        <div
          class="btn-base op-btn mx-1"
          v-bind="props"
          @click="$emit('newProject')"
        >
          <img
            src="@/assets/images/png/Group_187.png"
            height="55"
          >
        </div>
      </template>      
    </VTooltip>
    <VTooltip
      text="เปิดโปรเจค"
      location="bottom"
    >
      <template #activator="{ props }">
        <div
          class="btn-base op-btn mx-1"
          v-bind="props"
          @click="$emit('openProject')"
        >
          <img
            src="@/assets/images/png/Group_185.png"
            height="55"
          >
        </div>
      </template>      
    </VTooltip>
    <VTooltip
      text="บันทึกโปรเจค"
      location="bottom"
    >
      <template #activator="{ props }">
        <div
          class="btn-base op-btn mx-1"
          v-bind="props"
          @click="$emit('saveProject')"
        >
          <img
            src="@/assets/images/png/Group_186.png"
            height="55"
          >
        </div>
      </template>      
    </VTooltip>
    <VTooltip
      text="ลบโปรเจค"
      location="bottom"
    >
      <template #activator="{ props }">
        <div
          class="btn-base op-btn mx-1"
          v-bind="props"
          @click="$emit('deleteProject')"
        >
          <img
            src="@/assets/images/png/Group_188.png"
            height="55"
          >
        </div>
      </template>      
    </VTooltip>
  </div>
</template>
