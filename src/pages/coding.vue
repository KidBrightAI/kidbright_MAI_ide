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

import NewProjectDialog from "@/components/dialog/NewProjectDialog.vue";
import ExampleDialog from "@/components/dialog/ExampleDialog.vue";
import PluginDialog from "@/components/dialog/PluginDialog.vue";
import ConnectWifiDialog from "@/components/dialog/ConnectWifiDialog.vue";
import SavingProjectDialog from "@/components/dialog/SavingProjectDialog.vue";
import UploadProjectDialog from "@/components/dialog/UploadProjectDialog.vue";
import OpeningProjectDialog from "@/components/dialog/OpeningProjectDialog.vue";
import NewModelDialog from "@/components/dialog/NewModelDialog.vue";
import fileExplorerDialog from "@/components/dialog/FileExplorerDialog.vue";

import {sleep } from "@/engine/helper";
import { loadPlugin } from "@/engine/board"
//-------import image --------//
import RobotPoker from "@/assets/images/png/Mask_Group_12.png";

import ExtensionAsyncComponent from "@/components/ExtensionAsyncComponent.vue";


const confirm = useConfirm();
const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();
const pluginStore = usePluginStore();

const blocklyComp = ref();
//dialog state
const newProjectDialogOpen = ref(false);
const exampleDialogOpen = ref(false);
const pluginDialogOpen = ref(false);
const connectWifiDialogOpen = ref(false);
const newModelDialogOpen = ref(false);
const fileExplorerDialogOpen = ref(false);

const footer = shallowRef();
const isSerialPanelOpen = ref(false);
const splitpanesRef = ref();
const DEFAULT_FOOTER_HEIGHT = 68;
const bottomMinPaneSize = ref(5);
const bottomMaxPaneSize = ref(80);
const bottomPaneSize = ref(5);
let terminal = null;
let fitAddon = null;
let writer = null;
// terminal read write stream
const vm = getCurrentInstance();

const calculateMinBottomPlaneSize = () => {
  const minBottomPaneSize = DEFAULT_FOOTER_HEIGHT / (splitpanesRef.value.$el.clientHeight / 100);
  bottomMinPaneSize.value = minBottomPaneSize;
  if(bottomPaneSize.value < minBottomPaneSize) {
    bottomPaneSize.value = minBottomPaneSize;
  }
  if(selectedMenu.value == 4){
    //lock bottom pane size if serial panel is closed
    if(!isSerialPanelOpen.value){
      bottomPaneSize.value = bottomMinPaneSize.value;
      bottomMaxPaneSize.value = bottomMinPaneSize.value;
    }else{
      bottomMaxPaneSize.value = 80;
    }
  }else{
    bottomMaxPaneSize.value = 0;
    bottomPaneSize.value = 0;
  }
};

const serialMonitorCallback = (chank) => {  
  let readableText = new TextDecoder().decode(chank);
  if(terminal){
    terminal.write(readableText);
  }  
}
const serialMonitorWrite = async (data) => {
 SingletonShell.write(data);
}
const serialMonitorBridge = async () =>{
  console.log("serial monitor bridge");
  let res = await boardStore.deviceConnect();
  if(res){
    try{
      const adb = vm.appContext.config.globalProperties.$adb.adb;      
      const shell = SingletonShell.getInstance(adb);
      shell.setCallback(serialMonitorCallback);
      await SingletonShell.waitWriter();
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

const download = async () => {
  console.log("download");
  
  // check is serial monitor open, if not open it
  if(!isSerialPanelOpen.value){
    await onSerial();
  }
  await sleep(1000);
  //clear terminal screen
  terminal.reset();
  
  //check mode
  let res = null;
  //blockly generate python code
  let code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace);
  //console.log(code);
  res = await boardStore.upload(code);
  
  if (res === true) {
    toast.success("Upload success");
  } else {
    toast.error("Upload failed");
  }
};

//=====================================================================//
//=========================== event project ===========================//
//=====================================================================//

const createdProject = async (projectInfo) => {
  try{
    let res = await workspaceStore.createNewProject(projectInfo);
    if(selectedMenu.value == 4){
      console.log("reload workspace");
      blocklyComp.value.reload();
      mountSerial();
    }
    if (res) {
      toast.success("สร้างโปรเจคเสร็จเรียบร้อย");
      selectedMenu.value = 4;
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      toast.error("สร้างโปรเจคไม่สำเร็จ");
    }  
  }catch(err){
    toast.error("มีอย่างไม่ถูกต้อง : " + err.message);
  } finally {
    newProjectDialogOpen.value = false;
  }
};

const openProject = async () => {
  try {
    let message = "ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการเปิดโปรเจคใหม่หรือไม่";
    await confirm({ title: "ยืนยันการเปิดโปรเจค" , content: message , dialogProps: { width: 'auto' } });
    let res = await workspaceStore.openProjectFromZip();
    if(res){
      selectedMenu.value = 4;
      blocklyComp.value.reload();
      onResized();

    }
  } catch (err) {
    console.log(err);
  }
};

const saveProject = async ($event) => {
  try {    
    await workspaceStore.saveProject();
  } catch (err) {
    console.log(err);
  }
};

const deleteProject = async () => {
  try {
    let message = "ข้อมูลโปรเจคปัจจุบันจะถูกลบทั้งหมด คุณต้องการลบโปรเจคหรือไม่";
    await confirm({ title: "ยืนยันการลบโปรเจค", content: message , dialogProps: { width: 'auto' } });
    selectedMenu.value = 0;
    let res = await workspaceStore.deleteProject();
    // blocklyComp.value.reload();
    onResized();
  } catch (err) {
    console.log(err);
  }
};

const selectProjectType = async(selectedType) => {
  newModelDialogOpen.value = false;
  console.log("select project type");
  console.log(selectedType);
  let res = await workspaceStore.selectProjectType(selectedType);
  if(res){
    selectedMenu.value = 1;
    blocklyComp.value.reload();
    toast.success("เลือกประเภทโมเดลเสร็จเรียบร้อย");
  }else{
    toast.error("เลือกประเภทโมเดลไม่สำเร็จ");    
  }
};

//=====================================================================//
//=========================== event boards ============================//
//=====================================================================//

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
  
  setTimeout(async() => {
    // install plugin    
    pluginStore.installed.push(plugin);
    // execute plugin blocks and generators
    await loadPlugin(pluginStore.installed);
    plugin.installing = false;        
    toast.success("Install plugin success");
    if(selectedMenu.value == 4){
      console.log("reload workspace");
      blocklyComp.value.reload();
    }
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
    if(selectedMenu.value == 4){
      console.log("reload workspace");
      blocklyComp.value.reload();
    }
  }, 1000);
};

const onHelp = () => {
  console.log("onHelp");
};

const onResized = () => {
  calculateMinBottomPlaneSize();
  if(workspaceStore.currentBoard && selectedMenu.value == 4){
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
  }
};

const mountSerial = () => {
  console.log("mount serial monitor");
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
};

const addChangeListener = () => {    
  blocklyComp.value.workspace.addChangeListener(() => {    
    workspaceStore.block = blocklyComp.value.getSerializedWorkspace();
  });
};

onMounted(() => {
  if(workspaceStore.currentBoard){
    setTimeout(() => {
      console.log("mount serial monitor when have board");
      mountSerial();
    }, 1000);
  }
  if(selectedMenu.value == 4){
    console.log("add change listener");
    addChangeListener();
  }
});
//--------- menu ----------//
const selectedMenu = ref(workspaceStore.currentBoard ? 4 : 0);
//============= event from board ==============//

watch(selectedMenu, (val) => {
  console.log("selectedMenu: " + val);
  calculateMinBottomPlaneSize();
  if(val == 4){
    
    //mount serial monitor
    //mountSerial();
    //listen block change and save to store

    nextTick(()=>{
      onResized();
      console.log("add change listener from watcher");
      addChangeListener();
    });    

  }
});
</script>

<template>
  <v-layout class="rounded rounded-md main-bg">
    <v-navigation-drawer permanent width="320" class="main-bg">
      <MainPanel v-model:selectedMenu="selectedMenu" 
        @newProject="newProjectDialogOpen = true" 
        @openProject="openProject"
        @saveProject="saveProject"
        @deleteProject="deleteProject"
        @connectBoard="serialMonitorBridge"
        @connectWifi="connectWifiDialogOpen = true"
        @fileBrowser="fileExplorerDialogOpen = true"
        @terminal="onSerial"
        @restartBoard="boardStore.rebootBoard"
        @newModel="newModelDialogOpen = true"
      >
      </MainPanel>
    </v-navigation-drawer>
    <v-main class="d-flex align-center justify-center" style="min-height: 310px; height: calc(100vh);">
      <splitpanes ref="splitpanesRef" class="default-theme" horizontal :style="{ height: selectedMenu==4 ? 'calc(100vh - 64px)' : 'calc(100vh)'}" @resized="onResized" @ready="onResized">
        <pane v-if="workspaceStore.currentBoard" :size="100 - bottomPaneSize">
          <extension-async-component v-if="selectedMenu === 1 && workspaceStore.extension" :target="workspaceStore.extension.components.Capture"></extension-async-component>
          <extension-async-component v-else-if="selectedMenu === 2 && workspaceStore.extension" :target="workspaceStore.extension.components.Annotate"></extension-async-component>
          <extension-async-component v-else-if="selectedMenu === 3 && workspaceStore.extension" :target="workspaceStore.extension.components.Train"></extension-async-component>
          <div v-if="selectedMenu == 4" class="w-100 h-100">
            <Header
              @serial="onSerial" 
              @help="onHelp" 
              @example="exampleDialogOpen = true" 
              @plugin="pluginDialogOpen = true">
            </Header>
            <BlocklyComponent ref="blocklyComp"></BlocklyComponent> 
          </div>
        </pane>
        <pane v-else :size="100 - bottomPaneSize">
          <div class="d-flex flex-column align-center justify-center" style="height: calc(100vh);">
            <img style="margin-top: 100px" width="400" :src="RobotPoker"/>
            <span style="margin-top: 50px; display: block;text-align: center;font-size: 25px;"> สร้างโปรเจคใหม่ หรือ เลือกกดเมนูด้านซ้ายมือ</span>
          </div>
        </pane>
        <pane :min-size="bottomMinPaneSize" :size="bottomPaneSize" :max-size="bottomMaxPaneSize">
          <Footer ref="footer" @undo="undo" @redo="redo" @download="download"></Footer>
        </pane>
      </splitpanes>
    </v-main>
  </v-layout>
  <SavingProjectDialog></SavingProjectDialog>
  <UploadProjectDialog></UploadProjectDialog>
  <OpeningProjectDialog></OpeningProjectDialog>
  <ConnectWifiDialog v-model:isDialogVisible="connectWifiDialogOpen" />
  <NewProjectDialog v-model:isDialogVisible="newProjectDialogOpen" @submit="createdProject" />
  <ExampleDialog v-model:isDialogVisible="exampleDialogOpen" @loadExample="onExampleOpen" />
  <PluginDialog v-model:isDialogVisible="pluginDialogOpen" @installPlugin="onInstallPlugin" @uninstallPlugin="onUninstallPlugin" />
  <NewModelDialog v-model:isDialogVisible="newModelDialogOpen" @submit="selectProjectType" />
  <fileExplorerDialog v-model:isDialogVisible="fileExplorerDialogOpen" />
  
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
