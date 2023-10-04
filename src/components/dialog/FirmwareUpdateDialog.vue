<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue";
import { useBoardStore } from "@/store/board";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { useWorkspaceStore } from "@/store/workspace";
import { onMounted } from "vue";
import MicropythonLogo from "@/assets/images/micropython-logo.png";

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible','flashed'])

const resetForm = () => {
  emit('update:isDialogVisible', false);
}

const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();
const confirm = useConfirm();

const selectedFirmware = ref([]);
const firmwareList = ref([]);
const chipInfo = ref({});

const loading = ref(false);
const flashing = ref(false);
const flashed = ref(false);

const selectedBoard = ref({});
const progress = ref(-1);
const uploadStatus = ref("Ready");


onMounted(async () => {
  let currentBoard = workspaceStore.currentBoard;
  if (currentBoard) {
    selectedFirmware.value = [currentBoard.firmware[0].name];
    firmwareList.value = currentBoard.firmware;
    selectedBoard.value = currentBoard;
  }
})

//when dialog open
watch(() => props.isDialogVisible, async (val) => {
  if (val) {
    loading.value = true;
    flashed.value = false;
    flashing.value = false;
    progress.value = -1;
    uploadStatus.value = "Ready";
    // get board info 
    console.log("get board info");
    let chip = await boardStore.getBoardInfo();
    chipInfo.value = chip;
    loading.value = false;
  }
})

const onFlashFirmware = async () => {
  if(flashed.value) {
    emit('update:isDialogVisible', false);
    return;
  }
  try {
    flashed.value = false;
    flashing.value = true;
    progress.value = 0;
    uploadStatus.value = "Connecting to board...";
    const terminal = {
      clean() {
        console.log("clean");
      },
      writeLine(data) {
        if (data.startsWith("Writing at 0x")) {
          let percent = data.split(" ")[3];
          percent = percent.substring(1, percent.length - 1);
          console.log(percent);
          progress.value = parseInt(percent);
        }
        uploadStatus.value = data;
      },
      write(data) {
        console.log(data);
      }
    };
    let res = await boardStore.firmwareUpgrade(terminal);
    uploadStatus.value = "Firmware upgrade success.";
    toast.success("Firmware upgrade success.");
    flashed.value = true;
  } catch (err) {
    console.log(err);
    toast.error("Firmware upgrade failed.");
  } finally {
    flashing.value = false;
    emit('flashed');
  }
};

</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="props.isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn
        :disabled="flashing"
        variant="text"
        size="small"
        @click="resetForm"
      />
      <VCardItem>
        <VCardTitle class="text-h5 text-center">
          Update Firmware
        </VCardTitle>
      </VCardItem>
      <VCardText class="pt-0">
        <VCardSubtitle class="text-center mb-8">
          It look like your board don't have any python firmware or it outdated. Please update new one.
        </VCardSubtitle>
          <VRow>
            <VCol cols="12" md="12">
              <VList lines="two" select-strategy="single-leaf" v-model:selected="selectedFirmware" :disabled="flashing">
                <VListSubheader>Select firmware</VListSubheader>
                <VListItem v-for="(item,i) in firmwareList" :key="i" :value="item.name">
                  <template v-slot:prepend="{ isActive }">
                    <v-list-item-action start>
                      <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
                    </v-list-item-action>
                  </template>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                   Board {{ item.board }}, Version : {{ item.version }}, date: {{ item.date }}
                  </v-list-item-subtitle>
                </VListItem>
              </VList>
            </VCol>
            <VCol cols="12">
              <VCard class="pa-3" :loading="loading">
                <VRow>
                  <VCol cols="4" class="d-flex flex-column align-center justify-center">
                    <VImg :src="MicropythonLogo" width="100px" height="100px" />
                    <div class="text-center mt-2">
                      <div class="text-subtitle-2">{{selectedFirmware[0]}}</div>
                      <div class="text-caption">Version : {{ selectedBoard.firmware ? selectedBoard.firmware.find(el=>el.name == selectedFirmware[0]).version : "" }}</div>
                      <div class="text-caption">
                         Date : {{ selectedBoard.firmware ? selectedBoard.firmware.find(el=>el.name == selectedFirmware[0]).date : "" }}
                      </div>
                    </div>
                  </VCol>
                  <VCol cols="4" class="d-flex flex-column align-center justify-center">
                    <div class="text-center mb-2">
                      <div class="text-subtitle-2">Upload Progress</div>
                    </div>
                    <VProgressLinear
                      :model-value="progress"
                      color="light-blue"
                      height="10"
                      striped
                      :indeterminate="progress === 0"
                    ></VProgressLinear>
                    <div class="text-center mt-2">
                      <div class="text-subtitle-2">{{uploadStatus}}</div>
                    </div>
                  </VCol>
                  <VCol cols="4" class="d-flex flex-column align-center justify-center">
                    <VTooltip :text="'Crystal: ' + chipInfo.crystal +' , Features: '+ chipInfo.features">
                      <template v-slot:activator="{ props }">
                        <VImg v-bind="props" :src="`${selectedBoard.path}/${selectedBoard.image}`" width="100px" height="100px" />
                      </template>
                    </VTooltip>
                    
                    <div class="text-center mt-2">
                      <div class="text-subtitle-2">{{selectedBoard.name}}</div>
                      <div class="text-caption">
                        {{chipInfo.chip}}
                      </div>
                      <div class="text-caption">
                        MAC: {{chipInfo.mac}}
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCard>
            </VCol>
            <VCol cols="12" class="text-center">
              <VBtn :loading="loading || flashing" type="submit" class="me-3" :disabled="loading || flashing" color="primary" @click="onFlashFirmware">
                {{ flashed? 'Close' : 'UPDATE ROM' }}
              </VBtn>
            </VCol>
          </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>
