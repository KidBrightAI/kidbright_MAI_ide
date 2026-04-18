<script setup>
import Header from '@/components/Header.vue'
import BlocklyComponent from "@/components/Blockly.vue"
import { pythonGenerator } from "blockly/python"
import Footer from "@/components/Footer.vue"
import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"
import { usePluginStore } from "@/store/plugin"
import { useConfirm } from "@/components/comfirm-dialog"
import { toast } from "vue3-toastify"
import { useRouter } from 'vue-router'

import { randomId } from "@/components/utils"

import { onMounted, ref, shallowRef, nextTick, watch } from "vue"

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import 'xterm/css/xterm.css'

import { sleep } from "@/engine/helper"
import { loadPlugin } from "@/engine/board"

import { useDialogs } from "@/composables/useDialogs"
import { useBottomPane } from "@/composables/useBottomPane"
import { useProjectActions } from "@/composables/useProjectActions"

//------- Dialogs --------//
import NewProjectDialog from "@/components/dialog/NewProjectDialog.vue"
import ExampleDialog from "@/components/dialog/ExampleDialog.vue"
import PluginDialog from "@/components/dialog/PluginDialog.vue"
import ConnectWifiDialog from "@/components/dialog/ConnectWifiDialog.vue"
import SavingProjectDialog from "@/components/dialog/SavingProjectDialog.vue"
import SaveProjectDialog from "@/components/dialog/SaveProjectDialog.vue"
import UploadProjectDialog from "@/components/dialog/UploadProjectDialog.vue"
import OpeningProjectDialog from "@/components/dialog/OpeningProjectDialog.vue"
import NewModelDialog from "@/components/dialog/NewModelDialog.vue"
import FileExplorerDialog from "@/components/dialog/FileExplorerDialog.vue"
import SelectBoardDialog from "@/components/dialog/SelectBoardDialog.vue"
import SecureConnectDialog from "@/components/dialog/SecureConnectDialog.vue"

//------- Assets --------//
import RobotPoker from "@/assets/images/png/Mask_Group_12.png"

const confirm = useConfirm()
const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()
const pluginStore = usePluginStore()
const router = useRouter()

const blocklyComp = ref()
const footer = shallowRef()
const splitpanesRef = ref()

const selectedMenu = ref(workspaceStore.currentBoard ? 4 : 0)
const isProjectCreating = ref(false)

const { dialogs } = useDialogs()

const {
  bottomPaneSize,
  bottomMinPaneSize,
  bottomMaxPaneSize,
  isSerialPanelOpen,
  serialMonitorBridge,
  onResized,
  onSerial,
  mountSerial,
  resetTerminal,
  calculateMinBottomPlaneSize,
} = useBottomPane({
  workspaceStore,
  boardStore,
  splitpanesRef,
  blocklyComp,
  footer,
  selectedMenu,
})

const {
  createdProject,
  newProjectConfirm,
  openProject,
  saveProject,
  deleteProject,
  selectProjectType,
  onExampleOpen,
  onAiOpen,
} = useProjectActions({
  workspaceStore,
  confirm,
  router,
  blocklyComp,
  dialogs,
  selectedMenu,
  onResized,
})

//=====================================================================//
//========================= Board Selection =========================//
//=====================================================================//

const onBoardSelected = async board => {
  if (isProjectCreating.value) return
  isProjectCreating.value = true
  try {
    const project = {
      name: `${board.name} project`,
      id: `${board.id}_${randomId()}`,
      projectType: null,
      projectTypeTitle: "",
      lastUpdate: new Date(),
      extension: null,
      model: null,
      dataset: [],
      labels: [],
      board: board.id,
    }
    await createdProject(project)
  } catch (error) {
    console.error("Error creating project from board selection:", error)
    toast.error("เกิดข้อผิดพลาดในการสร้างโปรเจค")
  } finally {
    isProjectCreating.value = false
  }
}

const openSelectBoardDialog = () => {
  if (workspaceStore.currentBoard) {
    newProjectConfirm()
  } else {
    dialogs.value.selectBoard = true
  }
}

//=====================================================================//
//========================= Blockly Actions =========================//
//=====================================================================//

const undo = () => blocklyComp.value?.undo()
const redo = () => blocklyComp.value?.redo()

const download = async event => {
  if (!isSerialPanelOpen.value) {
    await onSerial()
    await sleep(1000)
  }
  resetTerminal()

  const code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace)
  console.log(code)
  const isWriteStartupScriptNeeded = event?.ctrlKey
  if (isWriteStartupScriptNeeded) {
    toast.info("Write startup script")
  }

  const res = await boardStore.upload(code, isWriteStartupScriptNeeded)
  toast[res ? 'success' : 'error'](`Upload ${res ? 'success' : 'failed'}`)
}

//=====================================================================//
//========================== Plugin Events ==========================//
//=====================================================================//

const onInstallPlugin = async plugin => {
  plugin.installing = true
  setTimeout(async () => {
    pluginStore.installed.push(plugin)
    await loadPlugin(pluginStore.installed)
    plugin.installing = false
    toast.success("Install plugin success")
    if (selectedMenu.value === 4) {
      blocklyComp.value.reload()
    }
  }, 1000)
}

const onUninstallPlugin = async plugin => {
  plugin.installing = true
  setTimeout(() => {
    const index = pluginStore.installed.findIndex(item => item.name === plugin.name)
    if (index > -1) {
      pluginStore.installed.splice(index, 1)
    }
    plugin.installing = false
    toast.success("Uninstall plugin success")
    if (selectedMenu.value === 4) {
      blocklyComp.value.reload()
    }
  }, 1000)
}

//=====================================================================//
//========================= Lifecycle Hooks =========================//
//=====================================================================//

const addChangeListener = () => {
  if (blocklyComp.value?.workspace) {
    blocklyComp.value.workspace.addChangeListener(() => {
      if (blocklyComp.value) {
        workspaceStore.block = blocklyComp.value.getSerializedWorkspace()
      }
    })
  }
}

onMounted(() => {
  if (workspaceStore.currentBoard) {
    setTimeout(mountSerial, 1000)
  }
  if (selectedMenu.value === 4) {
    addChangeListener()
  }
})

watch(selectedMenu, val => {
  calculateMinBottomPlaneSize()
  if (val === 4) {
    nextTick(() => {
      onResized()
      addChangeListener()
    })
  }
})
</script>

<template>
  <VLayout class="rounded rounded-md main-bg">
    <VMain
      class="d-flex align-center justify-center"
      style="min-height: 310px; height: calc(100vh);"
    >
      <Splitpanes
        ref="splitpanesRef"
        class="default-theme"
        horizontal
        :style="{ height: selectedMenu==4 ? 'calc(100vh - 100px)' : 'calc(100vh)'}"
        @resized="onResized"
        @ready="onResized"
      >
        <Pane
          v-if="workspaceStore.currentBoard"
          :size="100 - bottomPaneSize"
        >
          <div class="w-100 h-100">
            <Header
              @download="download"
              @newProject="newProjectConfirm"
              @openProject="openProject"
              @saveProject="dialogs.saveProject = true"
              @deleteProject="deleteProject"
              @connectBoard="serialMonitorBridge"
              @disconnectBoard="boardStore.deviceDisconnect"
              @connectWifi="dialogs.connectWifi = true"
              @fileBrowser="dialogs.fileExplorer = true"
              @terminal="onSerial"
              @restartBoard="boardStore.rebootBoard"
              @newModel="onAiOpen"
              @plugin="dialogs.plugin = true"
            />
            <BlocklyComponent ref="blocklyComp" />
          </div>
        </Pane>
        <Pane
          v-else
          :size="100 - bottomPaneSize"
        >
          <div
            class="d-flex flex-column align-center justify-center"
            style="height: calc(100vh);"
          >
            <img
              style="margin-top: 100px"
              width="400"
              :src="RobotPoker"
            >
            <VBtn
              class="mt-10"
              color="primary"
              @click="openSelectBoardDialog"
            >
              สร้างโปรเจคใหม่
            </VBtn>
          </div>
        </Pane>
        <Pane
          :min-size="bottomMinPaneSize"
          :size="bottomPaneSize"
          :max-size="bottomMaxPaneSize"
        >
          <Footer
            ref="footer"
            @undo="undo"
            @redo="redo"
            @download="download"
            @terminal="onSerial"
          />
        </Pane>
      </Splitpanes>
    </VMain>
  </VLayout>

  <!-- Dialogs -->
  <SavingProjectDialog />
  <SaveProjectDialog
    v-model:isDialogVisible="dialogs.saveProject"
    @submit="saveProject"
  />
  <UploadProjectDialog />
  <OpeningProjectDialog />
  <ConnectWifiDialog v-model:isDialogVisible="dialogs.connectWifi" />
  <NewProjectDialog
    v-model:isDialogVisible="dialogs.newProject"
    @submit="createdProject"
  />
  <ExampleDialog
    v-model:isDialogVisible="dialogs.example"
    @loadExample="onExampleOpen"
  />
  <PluginDialog
    v-model:isDialogVisible="dialogs.plugin"
    @installPlugin="onInstallPlugin"
    @uninstallPlugin="onUninstallPlugin"
  />
  <NewModelDialog
    v-model:isDialogVisible="dialogs.newModel"
    @submit="selectProjectType"
  />
  <FileExplorerDialog v-model:isDialogVisible="dialogs.fileExplorer" />
  <SelectBoardDialog
    v-model:isDialogVisible="dialogs.selectBoard"
    @board-selected="onBoardSelected"
  />
  <SecureConnectDialog />
</template>

<route lang="yaml">
meta:
  layout: blank
</route>

<style lang="scss">
.main-bg {
  background-color: #eeeeee;
}
.left-panel {
  padding-top: 8px;
  padding-left: 5px;
  padding-right: 5px;
  overflow-y: auto;
  height: 100%;

  .l-title {
    color: #06754b;
    font-size: 35px;
    text-align: center;
  }
  .btn-base {
    width: 55px;
    height: 55px;
    background-position: 50%;
    background-size: cover;
    cursor: pointer;
  }
  .header-left-bar{
    z-index: 1;
    position: relative;
    display: block;
    background: #007e4e;
    width: 100%;
    padding: 10px 15px;
  }
  .left-bottom-content{
    position: relative;
    background-color: #fff7d6;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    margin: 10px 8px;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    height: calc(100% - 145px);
    overflow: hidden;

    .proj-name {
      display: flex;
      align-items: center;
      margin-bottom: 0px;
      color: #eeeeee;
      font-size: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .proj-type {
      color: #ffff78;
      font-size: 14px;
      margin-bottom: 0.5em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .step {
      display: flex;
      flex-wrap: wrap;
      margin: 10px 0;
      padding: 0 20px;
      width: 100%;
      height: 246px;

      li {
        flex: 1 0 50%;
        padding: 5px;
        opacity: 1;
        filter: sepia(1);
        cursor: pointer;
        transition: opacity 0.3s ease-in, filter 0.3s ease-in;

        &.inactive {
          opacity: 0.7;
          filter: sepia(1) !important;
          cursor: unset !important;
        }

        &.current {
          filter: sepia(0) !important;
        }

        &:hover {
          filter: sepia(0.5);
        }

        img {
          width: 100%;
        }
      }
    }
    .hint {
      width: calc(100% - 20px);
      height: 100%;
      margin: 0 10px 10px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      position: relative;
      background: #fff;
      border-radius: 20px;
      overflow-y: auto;

      &::after {
        content: "";
        position: absolute;
        top: 20px;
        left: 40px;
        width: 75px;
        height: 114px;
        background: url("@/assets/images/png/light-bulb.png") center no-repeat;
        background-size: 75px 114px;
        opacity: 0.5;
      }

      .main-hint {
        padding: 1em;
        z-index: 1;
      }

      .btn-desc {
        margin-bottom: 10px;

        li {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          height: 23px;
          margin-left: -7px;
        }

        span {
          width: 32px;
          display: flex;
          justify-content: center;
          margin-right: 5px;
        }
      }

      p {
        font-size: 0.8rem;

        img {
          height: 30px;
        }
      }
    }

    .mascot {
      width: 100%;
      text-align: center;
      img {
        width: 150px;
      }
    }
  }

  .menu-starter {
    display: flex;
    justify-content: center;
    > div {
      margin: 5px;
    }
  }

}

ul {
  list-style: none;
  padding: 0;
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}
</style>
