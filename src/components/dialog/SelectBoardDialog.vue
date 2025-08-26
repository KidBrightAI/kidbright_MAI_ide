<template>
  <v-dialog v-model="dialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Select a Board</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col v-for="board in boards" :key="board.id" cols="12" sm="6">
              <v-card @click="selectBoard(board)" class="board-card">
                <v-img :src="getImagePath(board)" height="150px" contain></v-img>
                <v-card-title class="d-flex justify-space-between">
                  <span>{{ board.name }}</span>
                  <v-chip v-if="board.version" size="small" color="primary">v{{ board.version }}</v-chip>
                </v-card-title>
                <v-card-text class="flex-grow-1">
                  {{ board.description }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

const dialog = defineModel();
const emit = defineEmits(['board-selected']);

const app = getCurrentInstance();
const boards = computed(() => app.appContext.config.globalProperties.$boards || []);

const getImagePath = (board) => {
  return `${board.path}${board.image}`;
};

const selectBoard = (board) => {
  emit('board-selected', board);
  dialog.value = false;
};

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
