<template>
  <VDialog
    v-model="dialog"
    persistent
    max-width="800px"
  >
    <VCard>
      <VCardTitle>
        <span class="text-h5">Select a Board</span>
      </VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol
              v-for="board in boards"
              :key="board.id"
              cols="12"
              sm="6"
            >
              <VCard
                class="board-card"
                @click="selectBoard(board)"
              >
                <VImg
                  :src="getImagePath(board)"
                  height="150px"
                  contain
                />
                <VCardTitle class="d-flex justify-space-between">
                  <span>{{ board.name }}</span>
                  <VChip
                    v-if="board.version"
                    size="small"
                    color="primary"
                  >
                    v{{ board.version }}
                  </VChip>
                </VCardTitle>
                <VCardText class="flex-grow-1">
                  {{ board.description }}
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="blue-darken-1"
          variant="text"
          @click="dialog = false"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const emit = defineEmits(['board-selected'])
const dialog = defineModel()
const app = getCurrentInstance()
const boards = computed(() => app.appContext.config.globalProperties.$boards || [])

const getImagePath = board => {
  return `${board.path}${board.image}`
}

const selectBoard = board => {
  emit('board-selected', board)
  dialog.value = false
}
</script>

<style scoped>
.board-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;
}

.board-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
</style>
