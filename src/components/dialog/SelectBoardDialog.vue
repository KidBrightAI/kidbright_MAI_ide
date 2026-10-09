<template>
  <VDialog
    v-model="isDialogVisible"
    persistent
    max-width="800px"
  >
    <VCard>
      <VCardTitle>
        <span class="text-h5">{{ $t('dialog.selectBoard.title') }}</span>
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
                  {{ localized(board.description) }}
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
          @click="isDialogVisible = false"
        >
          {{ $t('common.close') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { localized } from '@/plugins/i18n'
import { computed, getCurrentInstance } from 'vue'
import { writePinToKMV } from '@/store/simulator'

const emit = defineEmits(['board-selected'])
const isDialogVisible = defineModel('isDialogVisible', { type: Boolean, default: false })
const app = getCurrentInstance()
const boards = computed(() => app.appContext.config.globalProperties.$boards || [])

const getImagePath = board => {
  return `${board.path}${board.image}`
}

const selectBoard = board => {
  const boardIndex = boards.value.findIndex(b => b.id === board?.id)
  // บอร์ดด้านซ้าย (index 0) = 1, บอร์ดด้านขวา (index 1) = 2, กรณีอื่น = 1
  const boardVal = (boardIndex === 1 || board?.id === 'kidbright-mai-plus') ? 2 : 1
  try {
    localStorage.setItem('kmv_board_type', String(boardVal))
    sessionStorage.setItem('kmv_board_type', String(boardVal))
  } catch (e) {}

  try {
    writePinToKMV('BOARD', String(boardVal))
  } catch (e) {}

  emit('board-selected', board)
  isDialogVisible.value = false
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
