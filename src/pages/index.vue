<script setup>
import Header from '@/components/Header.vue';
import BlocklyComponent from "@/components/Blockly.vue";
import Blockly from "blockly";
import { pythonGenerator } from "blockly/python";
import Footer from "@/components/Footer.vue";
import { useWorkspaceStore } from "@/store/workspace";
import { useBoardStore } from "@/store/board";
import { usePluginStore } from "@/store/plugin";
import { useConfirm } from "@/components/comfirm-dialog";
import { toast } from "vue3-toastify";
import { onMounted, ref, shallowRef, nextTick } from "vue";

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { CanvasAddon } from 'xterm-addon-canvas';

import MainPanel from "@/components/MainPanel/MainPanel.vue";


import { getCurrentInstance } from 'vue'
import SingletonShell from "@/engine/SingletonShell";

import FirmwareUpdateDialog from "@/components/dialog/FirmwareUpdateDialog.vue";
import NewProjectDialog from "@/components/dialog/NewProjectDialog.vue";
import ExampleDialog from "@/components/dialog/ExampleDialog.vue";
import PluginDialog from "@/components/dialog/PluginDialog.vue";

const confirm = useConfirm();
const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();
const pluginStore = usePluginStore();

const blocklyComp = ref();
//dialog state
const firmwareUpdateDialogOpen = ref(false);
const newProjectDialogOpen = ref(false);
const exampleDialogOpen = ref(false);
const pluginDialogOpen = ref(false);

const footer = shallowRef();
const isSerialPanelOpen = ref(false);
const splitpanesRef = ref();
const DEFAULT_FOOTER_HEIGHT = 68;
const bottomMinPaneSize = ref(5);
const bottomMaxPaneSize = ref(80);
const bottomPaneSize = ref(5);
let terminal = null;
let fitAddon = null;
// terminal read write stream
const vm = getCurrentInstance();

const calculateMinBottomPlaneSize = () => {
  const minBottomPaneSize = DEFAULT_FOOTER_HEIGHT / (splitpanesRef.value.$el.clientHeight / 100);
  bottomMinPaneSize.value = minBottomPaneSize;
  if(bottomPaneSize.value < minBottomPaneSize) {
    bottomPaneSize.value = minBottomPaneSize;
  }
  //lock bottom pane size if serial panel is closed
  if(!isSerialPanelOpen.value){
    bottomPaneSize.value = bottomMinPaneSize.value;
    bottomMaxPaneSize.value = bottomMinPaneSize.value;
  }else{
    bottomMaxPaneSize.value = 80;
  }
};

const serialMonitorCallback = (chank) => {  
  let readableText = new TextDecoder().decode(chank);
  terminal.write(readableText);
}
const serialMonitorWrite = async (data) => {
 SingletonShell.write(data);
}
const serialMonitorBridge = async () =>{
  let res = await boardStore.deviceConnect();
  if(res){
    try{
      const adb = vm.appContext.config.globalProperties.$adb.adb;      
      const shell = SingletonShell.getInstance(adb);
      shell.setCallback(serialMonitorCallback);
      writer = shell.getWriter();
    }catch(err){
      console.log(err);
    }
  }
}

const undo = () => {
  blocklyComp.value.undo();
};

const redo = () => {
  blocklyComp.value.redo();
};

const selectPort = async () => {
  console.log("selectPort");
  //toast.warning("ํYou must allow serial port permission to use this feature.");
  await boardStore.connectStreaming();
};

const download = async () => {
  console.log("download");
  
  // check is serial monitor open, if not open it
  if(!isSerialPanelOpen.value){
    await onSerial();
  }
  //clear terminal screen
  terminal.reset();
  //check mode
  let res = null;
  if (workspaceStore.mode == 'block') {
    //blockly generate python code
    let code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace);
    console.log(code);
    res = await boardStore.upload(code);
  }else if(workspaceStore.mode == 'code'){
    //check code is empty
    if(workspaceStore.code == ''){
      toast.warning("Code is empty");
      return;
    }
    // upload source code to board
    res = await boardStore.upload(workspaceStore.code);
  }  

  if (res == "FIRMWARE_UPGRADE") {
    toast.warning("We found your board firmware is outdated or not Micropython.");
    firmwareUpdateDialogOpen.value = true;
  } else if (res === true) {
    toast.success("Upload success");
  } else {
    toast.error("Upload failed");
  }
};


const newProject = async () => {
  try {
    await confirm({ title: "Confirm create project", content: "All code in this project will be delete, please save first!", dialogProps: { width: 'auto' } })
    newProjectDialogOpen.value = true;
  } catch (err) {
    console.log("User cancelled")
  }
};

const createdProject = async (projectInfo) => {
  let res = await workspaceStore.createNewProject(projectInfo);  
  blocklyComp.value.reload();
  if (res) {
    toast.success("Create new project success");
  } else {
    toast.error("Create new project failed");
  }
  newProjectDialogOpen.value = false;
};

const openProject = async () => {
  try {
    await confirm({ title: "Confirm open project", content: "All code in this project will be delete, please save first!", dialogProps: { width: 'auto' } });
    let res = await workspaceStore.openProjectFromZip();
    blocklyComp.value.reload();
    onResized();
  } catch (err) {
    console.log(err);
  }
};

const saveProject = async ($event) => {
  try {
    let workspaceState = Blockly.serialization.workspaces.save(blocklyComp.value.workspace);
    let res = await workspaceStore.saveProjectToZip(JSON.stringify(workspaceState, null, 2));
  } catch (err) {
    console.log(err);
  }
};

const extraSave = async ($event) => {
  try {
    let workspaceState = blocklyComp.value.getSerializedWorkspace();
    const blob = new Blob([workspaceState], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = "workspace.json"
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (err) {
    console.log(err);
  }
};

const onSerial = async () => {
  console.log(`======= ${ isSerialPanelOpen.value? 'Close':'Open' } serial console =========`);
  if(isSerialPanelOpen.value){
    // close serial panel
    isSerialPanelOpen.value = false;
    bottomPaneSize.value = bottomMinPaneSize.value;    
  }else{
    // open serial panel
    isSerialPanelOpen.value = true;
    bottomPaneSize.value = 30;
    await serialMonitorBridge();
  }
  onResized();
};

const onExampleOpen = async(mode, example) => {
  try{
    await confirm({ title: "Confirm open example", content: "All code in this project will be delete, please save first!", dialogProps: { width: 'auto' } });
    workspaceStore.switchMode(mode);
    exampleDialogOpen.value = false;
    if (mode == 'block') {
      workspaceStore.block = example.block;
      blocklyComp.value.reload();
    }else if(mode == 'code'){
      workspaceStore.code = example.code;
    }
    onResized();
  }catch(err){
    console.log(err);
    return;
  }
};

const onInstallPlugin = async( plugin )=>{
  console.log("====== install plugin ======");
  // change status of plugin to installing
  plugin.installing = true;  
  // execute plugin block script
  setTimeout(() => {
    // install plugin
    pluginStore.installed.push(plugin);
    plugin.installing = false;        
    toast.success("Install plugin success");
  }, 1000);
};

const onUninstallPlugin = async( plugin )=>{
  console.log("====== uninstall plugin ======");
  // change status of plugin to uninstalling
  plugin.installing = true;
  // execute plugin block script
  setTimeout(() => {
    // uninstall plugin
    let index = pluginStore.installed.findIndex((item) => item.name == plugin.name);
    if(index > -1){
      pluginStore.installed.splice(index, 1);
    }
    plugin.installing = false;        
    toast.success("Uninstall plugin success");
  }, 1000);
};

const onHelp = () => {
  console.log("onHelp");
};

const onFirmware = async () => {
  console.log("onFirmware");
  await boardStore.serialConnect();
  firmwareUpdateDialogOpen.value = true;
};

const onResized = () => {
  calculateMinBottomPlaneSize();
  blocklyComp.value.resizeWorkspace();
  nextTick(() => {
      setTimeout(() => {
        let footerHeight = footer.value.$el.clientHeight;
        console.log(`footerHeight: ${footerHeight}`);
        let serialMonitorHeight = footerHeight - 68
        footer.value.$refs.terminalDiv.style.height = `${serialMonitorHeight}px`;
        if(fitAddon){      
          fitAddon.fit();
        }
      }, 500);      
  });
  
};

onMounted(() => {
  window.addEventListener('resize', onResized);
  // mount serial monitor
  terminal = new Terminal(
    {
      cursorBlink: true,
      scrollback: 1000,
      tabStopWidth: 4,
      theme: {
        background: '#101214',
        foreground: '#ffffff',
      },
      fontFamily: 'monospace',
      fontSize: 14,
      fontWeight: 'normal',
      fontWeightBold: 'bold',
      lineHeight: 1,
      scrollOnWrite: true,
    }
  );

  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(footer.value.$refs.terminalDiv);  
  fitAddon.fit();
  terminal.loadAddon(new CanvasAddon());    
  terminal.write('\r\n')
  //termimal listen typing
  terminal.onData(serialMonitorWrite);
  //listen block change and save to store
  blocklyComp.value.workspace.addChangeListener(() => {    
    workspaceStore.block = blocklyComp.value.getSerializedWorkspace();
  });
});

</script>

<template>
  <v-layout class="rounded rounded-md main-bg">
    <v-navigation-drawer permanent width="320" class="main-bg">      
      <MainPanel></MainPanel>
    </v-navigation-drawer>
    <Header
      @new="newProject" 
      @open="openProject" 
      @save="saveProject" 
      @serial="onSerial" 
      @help="onHelp" 
      @firmware="onFirmware"
      @example="exampleDialogOpen = true" 
      @plugin="pluginDialogOpen = true"
      @extraSave="extraSave">
    </Header>
    <v-main class="d-flex align-center justify-center" style="min-height: 310px;">
      <splitpanes ref="splitpanesRef" class="default-theme" horizontal style="height: calc(100vh - 64px)" @resized="onResized" @ready="onResized">
        <pane :size="100 - bottomPaneSize">
          <BlocklyComponent ref="blocklyComp"></BlocklyComponent>    
        </pane>
        <pane :min-size="bottomMinPaneSize" :size="bottomPaneSize" :max-size="bottomMaxPaneSize">
          <Footer ref="footer" @undo="undo" @redo="redo" @selectPort="selectPort" @download="download"></Footer>
        </pane>
      </splitpanes>
    </v-main>
  </v-layout>

  <FirmwareUpdateDialog v-model:isDialogVisible="firmwareUpdateDialogOpen" />
  <NewProjectDialog v-model:isDialogVisible="newProjectDialogOpen" @submit="createdProject" />
  <ExampleDialog v-model:isDialogVisible="exampleDialogOpen" @loadExample="onExampleOpen" />
  <PluginDialog v-model:isDialogVisible="pluginDialogOpen" @installPlugin="onInstallPlugin" @uninstallPlugin="onUninstallPlugin" />
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
  max-width: 320px;
  width: 320px;
  min-width: 320px;
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
    height: 102px;
    .header-action-button {
      display: flex;
      button {
        background: #003722;
        border: none;
        font-size: 10px;
        border-radius: 15px;
        text-transform: capitalize;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        &:nth-of-type(1) {
          margin-right: 5px;
        }
        // svg {
        //   width: 12px;
        //   height: 12px;
        //   margin-right: 3px;
        // }
      }
      .connection-robot {
        background-color: #1a3700;
        color: #f7ff00;
        svg {
          fill: #f7ff00;
        }
      }
      .connection-computer {
        background-color: #003137;
        color: #00fff6;
        svg {
          fill: #00fff6;
        }
      }
      .text-green {
        color: #00ff77;
        svg {
          fill: #00ff77;
        }
      }
      .inactive {
        color: #517a52;
        svg {
          fill: #517a52;
        }
      }
      .img-icon {
        // width: 1em;
        height: 1em;
      }
    }
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
        background: url("~/assets/images/UI/svg/light-bulb.svg") center no-repeat;
        background-size: 75px 114px;
        opacity: 0.5;
      }

      // overflow-y: scroll;
      .main-hint {
        padding: 1em;
        z-index: 1;

        // &.notype {
        //   //height: 100%;
        //   //margin-top: 20px;
        // }
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
