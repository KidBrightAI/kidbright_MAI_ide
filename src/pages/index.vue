<script setup>
import Header from '@/components/Header.vue';
import BlocklyComponent from "@/components/Blockly.vue";
import { pythonGenerator } from "blockly/python";
import Footer from "@/components/Footer.vue";
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import { usePluginStore } from "@/store/plugin";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { useRouter } from 'vue-router';

import { randomId } from "@/components/utils";

import { onMounted, ref, shallowRef, nextTick, watch, getCurrentInstance } from "vue";

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { CanvasAddon } from 'xterm-addon-canvas';

import SingletonShell from "@/engine/SingletonShell";
import WebSocketShell from "@/engine/WebSocketShell";
import { sleep } from "@/engine/helper";
import { loadPlugin } from "@/engine/board"

//------- Dialogs --------//
import NewProjectDialog from "@/components/dialog/NewProjectDialog.vue";
import ExampleDialog from "@/components/dialog/ExampleDialog.vue";
import PluginDialog from "@/components/dialog/PluginDialog.vue";
import ConnectWifiDialog from "@/components/dialog/ConnectWifiDialog.vue";
import SavingProjectDialog from "@/components/dialog/SavingProjectDialog.vue";
import SaveProjectDialog from "@/components/dialog/SaveProjectDialog.vue";
import UploadProjectDialog from "@/components/dialog/UploadProjectDialog.vue";
import OpeningProjectDialog from "@/components/dialog/OpeningProjectDialog.vue";
import NewModelDialog from "@/components/dialog/NewModelDialog.vue";
import fileExplorerDialog from "@/components/dialog/FileExplorerDialog.vue";
import SelectBoardDialog from "@/components/dialog/SelectBoardDialog.vue";

//------- Assets --------//
import RobotPoker from "@/assets/images/png/Mask_Group_12.png";

const confirm = useConfirm();
const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();
const pluginStore = usePluginStore();
const router = useRouter();
const vm = getCurrentInstance();

const blocklyComp = ref();
const footer = shallowRef();
const splitpanesRef = ref();
const adb_shell = ref(null);
const ws_shell = ref(null);

// Dialog states
const dialogs = ref({
  newProject: false,
  selectBoard: false,
  example: false,
  plugin: false,
  connectWifi: false,
  newModel: false,
  fileExplorer: false,
  saveProject: false,
});

const isProjectCreating = ref(false);

// UI states
const selectedMenu = ref(workspaceStore.currentBoard ? 4 : 0);
const isSerialPanelOpen = ref(false);
const bottomMinPaneSize = ref(5);
const bottomMaxPaneSize = ref(80);
const bottomPaneSize = ref(5);
const DEFAULT_FOOTER_HEIGHT = 18;

let terminal = null;
let fitAddon = null;

//=====================================================================//
//========================= Business Logic ========================== //
//=====================================================================//

const onBoardSelected = async (board) => {
  if (isProjectCreating.value) return;
  isProjectCreating.value = true;
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
    };
    await createdProject(project);
  } catch (error) {
    console.error("Error creating project from board selection:", error);
    toast.error("เกิดข้อผิดพลาดในการสร้างโปรเจค");
  } finally {
    isProjectCreating.value = false;
  }
};

const openSelectBoardDialog = () => {
  if (workspaceStore.currentBoard) {
    newProjectConfirm();
  } else {
    dialogs.value.selectBoard = true;
  }
};

//=====================================================================//
//========================= Terminal Logic ========================== //
//=====================================================================//

const serialMonitorCallback = (chunk) => {
  if (terminal) {
    terminal.write(typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk));
  }
};

const serialMonitorWrite = (data) => {
  if (workspaceStore.currentBoard.protocol === "web-adb") {
    if (adb_shell.value) {
      adb_shell.value.write(data);
    }
  } else if (workspaceStore.currentBoard.protocol === "websocket") {
    if (ws_shell.value) {
      ws_shell.value.exec(data);
    }
  }
};

const serialMonitorBridge = async () => {
  // --- Add guard to prevent multiple connections ---
  if (workspaceStore.currentBoard.protocol === "web-adb" && adb_shell.value && adb_shell.value.hasWriter()) {
    console.log("ADB shell already connected.");
    return;
  }
  if (workspaceStore.currentBoard.protocol === "websocket" && ws_shell.value && ws_shell.value.isConnected) {
    console.log("WebSocket shell already connected.");
    return;
  }
  // -------------------------------------------------

  if (await boardStore.deviceConnect()) {
    if (workspaceStore.currentBoard.protocol === "web-adb") {
      try {
        const adb = vm.appContext.config.globalProperties.$adb.adb;
        adb_shell.value = SingletonShell.getInstance(adb);
        adb_shell.value.setCallback(serialMonitorCallback);
        await adb_shell.value.waitWriter();
      } catch (err) {
        console.error(err);
        serialMonitorCallback(`\r\nError creating adb shell: ${err.message}\r\n`);
      }
    } else if (workspaceStore.currentBoard.protocol === "websocket") {
      try {
        // You might need to get the URL from the board configuration
        const ws_url = workspaceStore.currentBoard.wsShell || "ws://10.90.153.1:5555";
        ws_shell.value = new WebSocketShell(ws_url, serialMonitorCallback);
        await ws_shell.value.connect();
        serialMonitorCallback(`\r\nWebSocket shell connected to ${ws_url}\r\n`);
      } catch (err) {
        console.error(err);
        serialMonitorCallback(`\r\nError creating websocket shell: ${err.message}\r\n`);
      }
    }
  }
};


//=====================================================================//
//========================= Blockly Actions =========================//
//=====================================================================//

const undo = () => blocklyComp.value.undo();
const redo = () => blocklyComp.value.redo();

const download = async (event) => {
  if (!isSerialPanelOpen.value) {
    await onSerial();
    await sleep(1000);
  }
  terminal.reset();

  const code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace);
  const isWriteStartupScriptNeeded = event?.ctrlKey;
  if (isWriteStartupScriptNeeded) {
    toast.info("Write startup script");
  }

  const res = await boardStore.upload(code, isWriteStartupScriptNeeded);
  toast[res ? 'success' : 'error'](`Upload ${res ? 'success' : 'failed'}`);
};

//=====================================================================//
//=========================== Project Events ==========================
//=====================================================================//

const createdProject = async (projectInfo) => {
  try {
    const res = await workspaceStore.createNewProject(projectInfo);
    if (res) {
      toast.success("สร้างโปรเจคเสร็จเรียบร้อย");
      setTimeout(() => location.reload(), 1000);
    } else {
      toast.error("สร้างโปรเจคไม่สำเร็จ");
    }
  } catch (err) {
    toast.error(`มีข้อผิดพลาด: ${err.message}`);
  } finally {
    dialogs.value.newProject = false;
    dialogs.value.selectBoard = false;
  }
};

const newProjectConfirm = async () => {
  try {
    await confirm({ title: "ยืนยันการสร้างโปรเจค", content: "ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการสร้างโปรเจคใหม่หรือไม่", dialogProps: { width: 'auto' } });
    dialogs.value.selectBoard = true;
  } catch (err) {
    // User cancelled
  }
};

const openProject = async () => {
  try {
    await confirm({ title: "ยืนยันการเปิดโปรเจค", content: "ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการเปิดโปรเจคใหม่หรือไม่", dialogProps: { width: 'auto' } });
    if (await workspaceStore.openProjectFromZip()) {
      selectedMenu.value = 4;
      blocklyComp.value.reload();
      onResized();
    }
  } catch (err) {
    // User cancelled
  }
};

const saveProject = async (filename) => {
  try {
    dialogs.value.saveProject = false;
    await workspaceStore.saveProject("download", filename);
  } catch (err) {
    console.error(err);
  }
};

const deleteProject = async () => {
  try {
    await confirm({ title: "ยืนยันการลบโปรเจค", content: "ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการลบโปรเจคหรือไม่", dialogProps: { width: 'auto' } });
    selectedMenu.value = 0;
    await workspaceStore.deleteProject();
    onResized();
  } catch (err) {
    // User cancelled
  }
};

const selectProjectType = async (selectedType) => {
  dialogs.value.newModel = false;
  if (await workspaceStore.selectProjectType(selectedType)) {
    router.push("/ai");
  } else {
    toast.error("เลือกประเภทโมเดลไม่สำเร็จ");
  }
};

//=====================================================================//
//=========================== Board Events ============================
//=====================================================================//

const onSerial = async () => {
  isSerialPanelOpen.value = !isSerialPanelOpen.value;
  bottomPaneSize.value = isSerialPanelOpen.value ? 30 : bottomMinPaneSize.value;
  if (isSerialPanelOpen.value) {
    await serialMonitorBridge();
  } else {
    if (workspaceStore.currentBoard.protocol === "web-adb") {
      // SingletonShell is managed by its own lifecycle, no need to disconnect here
    } else if (workspaceStore.currentBoard.protocol === "websocket") {
      if (ws_shell.value) {
        ws_shell.value.disconnect();
        ws_shell.value = null;
      }
    }
  }
  onResized();
};

const onExampleOpen = async (mode, example) => {
  try {
    await confirm({ title: "Confirm open example", content: "All code in this project will be deleted, please save first!", dialogProps: { width: 'auto' } });
    dialogs.value.example = false;
    workspaceStore.switchMode(mode);
    if (mode === 'block') {
      workspaceStore.block = example.block;
      blocklyComp.value.reload();
    } else if (mode === 'code') {
      workspaceStore.code = example.code;
    }
    onResized();
  } catch (err) {
    // User cancelled
  }
};

const onAiOpen = async () => {
  if (!workspaceStore.projectType) {
    dialogs.value.newModel = true;
  } else {
    router.push("/ai");
  }
};

//=====================================================================//
//========================== Plugin Events ==========================
//=====================================================================//

const onInstallPlugin = async (plugin) => {
  plugin.installing = true;
  setTimeout(async () => {
    pluginStore.installed.push(plugin);
    await loadPlugin(pluginStore.installed);
    plugin.installing = false;
    toast.success("Install plugin success");
    if (selectedMenu.value === 4) {
      blocklyComp.value.reload();
    }
  }, 1000);
};

const onUninstallPlugin = async (plugin) => {
  plugin.installing = true;
  setTimeout(() => {
    const index = pluginStore.installed.findIndex((item) => item.name === plugin.name);
    if (index > -1) {
      pluginStore.installed.splice(index, 1);
    }
    plugin.installing = false;
    toast.success("Uninstall plugin success");
    if (selectedMenu.value === 4) {
      blocklyComp.value.reload();
    }
  }, 1000);
};

//=====================================================================//
//======================== UI & Layout Events =======================//
//=====================================================================//

const calculateMinBottomPlaneSize = () => {
  if (!splitpanesRef.value || !splitpanesRef.value.$el) return;
  const minBottomPaneSize = DEFAULT_FOOTER_HEIGHT / (splitpanesRef.value.$el.clientHeight / 100);
  bottomMinPaneSize.value = minBottomPaneSize;
  if (bottomPaneSize.value < minBottomPaneSize) {
    bottomPaneSize.value = minBottomPaneSize;
  }

  if (selectedMenu.value === 4) {
    bottomMaxPaneSize.value = isSerialPanelOpen.value ? 80 : minBottomPaneSize;
    if (!isSerialPanelOpen.value) {
        bottomPaneSize.value = minBottomPaneSize;
    }
  } else {
    bottomMaxPaneSize.value = 0;
    bottomPaneSize.value = 0;
  }
};

const onResized = () => {
  calculateMinBottomPlaneSize();
  if (workspaceStore.currentBoard && selectedMenu.value === 4) {
    blocklyComp.value.resizeWorkspace();
    nextTick(() => {
      setTimeout(() => {
        if (!footer.value || !footer.value.$refs.terminalDiv) return;
        const footerHeight = footer.value.$el.clientHeight;
        const serialMonitorHeight = footerHeight - DEFAULT_FOOTER_HEIGHT;
        footer.value.$refs.terminalDiv.style.height = `${serialMonitorHeight}px`;
        fitAddon?.fit();
      }, 500);
    });
  }
};

const mountSerial = () => {
  if (!footer.value || !footer.value.$refs.terminalDiv) return;
  terminal = new Terminal({
    cursorBlink: true,
    scrollback: 1000,
    tabStopWidth: 4,
    theme: { background: '#101214', foreground: '#ffffff' },
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 1,
    scrollOnWrite: true,
  });

  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new CanvasAddon());
  terminal.open(footer.value.$refs.terminalDiv);
  fitAddon.fit();
  terminal.write('\r\n');
  terminal.onData(serialMonitorWrite);
};

const addChangeListener = () => {
  if (blocklyComp.value?.workspace) {
    blocklyComp.value.workspace.addChangeListener(() => {
      if (blocklyComp.value) {
        workspaceStore.block = blocklyComp.value.getSerializedWorkspace();
      }
    });
  }
};

//=====================================================================//
//========================= Lifecycle Hooks =========================//
//=====================================================================//

onMounted(() => {
  if (workspaceStore.currentBoard) {
    setTimeout(mountSerial, 1000);
  }
  if (selectedMenu.value === 4) {
    addChangeListener();
  }
});

watch(selectedMenu, (val) => {
  calculateMinBottomPlaneSize();
  if (val === 4) {
    nextTick(() => {
      onResized();
      addChangeListener();
    });
  }
});

</script>

<template>
  <v-layout class="rounded rounded-md main-bg">
    <v-main class="d-flex align-center justify-center" style="min-height: 310px; height: calc(100vh);">
      <splitpanes ref="splitpanesRef" class="default-theme" horizontal :style="{ height: selectedMenu==4 ? 'calc(100vh - 100px)' : 'calc(100vh)'}" @resized="onResized" @ready="onResized">
        <pane v-if="workspaceStore.currentBoard" :size="100 - bottomPaneSize">
          <div class="w-100 h-100">
            <Header
              @download="download"
              @newProject="newProjectConfirm"
              @openProject="openProject"
              @saveProject="dialogs.saveProject = true"
              @deleteProject="deleteProject"
              @connectBoard="serialMonitorBridge"
              @connectWifi="dialogs.connectWifi = true"
              @fileBrowser="dialogs.fileExplorer = true"
              @terminal="onSerial"
              @restartBoard="boardStore.rebootBoard"
              @newModel="onAiOpen"
              @plugin="dialogs.plugin = true">
            </Header>
            <BlocklyComponent ref="blocklyComp"></BlocklyComponent>
          </div>
        </pane>
        <pane v-else :size="100 - bottomPaneSize">
          <div class="d-flex flex-column align-center justify-center" style="height: calc(100vh);">
            <img style="margin-top: 100px" width="400" :src="RobotPoker"/>
            <v-btn class="mt-10" color="primary" @click="openSelectBoardDialog">สร้างโปรเจคใหม่</v-btn>
          </div>
        </pane>
        <pane :min-size="bottomMinPaneSize" :size="bottomPaneSize" :max-size="bottomMaxPaneSize">
          <Footer ref="footer" @undo="undo" @redo="redo" @download="download" @terminal="onSerial"></Footer>
        </pane>
      </splitpanes>
    </v-main>
  </v-layout>

  <!-- Dialogs -->
  <SavingProjectDialog></SavingProjectDialog>
  <SaveProjectDialog v-model="dialogs.saveProject" @submit="saveProject"></SaveProjectDialog>
  <UploadProjectDialog></UploadProjectDialog>
  <OpeningProjectDialog></OpeningProjectDialog>
  <ConnectWifiDialog v-model="dialogs.connectWifi" />
  <NewProjectDialog v-model="dialogs.newProject" @submit="createdProject" />
  <ExampleDialog v-model="dialogs.example" @loadExample="onExampleOpen" />
  <PluginDialog v-model="dialogs.plugin" @installPlugin="onInstallPlugin" @uninstallPlugin="onUninstallPlugin" />
  <NewModelDialog v-model="dialogs.newModel" @submit="selectProjectType" />
  <fileExplorerDialog v-model="dialogs.fileExplorer" />
  <SelectBoardDialog v-model="dialogs.selectBoard" @board-selected="onBoardSelected" />

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