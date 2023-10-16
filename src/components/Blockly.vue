<script setup>
import { onMounted, ref, shallowRef, nextTick } from "vue";
import Blockly from "blockly";
import { pythonGenerator } from "blockly/python";
import CustomCategory from "./CustomCategory";
import { ZoomToFitControl } from "./ZoomToFit";
import BlocklyLogo from "@/assets/images/blockly.png";
import PythonLogo from "@/assets/images/python.png";

import { useWorkspaceStore } from "@/store/workspace";
import { usePluginStore } from "@/store/plugin";

import { updateBlockCategory } from "./utils";

import Theme from "./BlocklyTheme";

const workspaceStore = useWorkspaceStore();
const pluginStore = usePluginStore();

const props = defineProps(["options"]);
const blocklyToolbox = ref();
const blocklyDiv = ref();
const workspace = shallowRef();
const pythonCode = ref('');

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
  CustomCategory, true);

onMounted(() => {
  reload();
});

const reload = (initBlock) => {  
  const options = {
    theme: Theme,
    media: "media/",
    grid: {
      spacing: 20,
      length: 2,
      colour: '#CCC',
      snap: true
    },
    move: {
      scrollbars: {
        horizontal: true,
        vertical: true
      },
      drag: true,
      wheel: false
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
      pinch: true
    },
    trashcan: true,
    //renderer: 'zelos',
  };
  //-------- clear workspace ----------//
  if (workspace.value) {
    workspace.value.dispose();
  }
  //-------- load toolbox from currentboard ----------//  
  let targetBoard = workspaceStore.currentBoard;
  let toolboxXml = `<xml xmlns="https://developers.google.com/blockly/xml">`
  if (targetBoard) {
    let toolbox = targetBoard.toolbox;
    toolboxXml += updateBlockCategory(toolbox, targetBoard.path);    
  }
  //-------- load toolbox from installed plugin ----------//
  let installedPlugins = pluginStore.installed;
  // add blockly toolbox separator and note as plugin
  toolboxXml += `<sep css-container="blocklySeperatorToolbox">test</sep>
<label text="Plugins" web-class="blocklyToolboxCategory"></label>`;
  if (installedPlugins) {
    toolboxXml += updateBlockCategory(installedPlugins);         
  }
  toolboxXml += `</xml>`;  
  options.toolbox = toolboxXml;

  workspace.value = Blockly.inject(blocklyDiv.value, options);
  workspace.value.scrollCenter();
  //-------- load default block code ----------//
  if (initBlock) {
    Blockly.serialization.workspaces.load(initBlock, workspace.value);
  } else if(workspaceStore.block){
    let blockObject = JSON.parse(workspaceStore.block);
    Blockly.serialization.workspaces.load(blockObject, workspace.value);
  }  else if(targetBoard && targetBoard.defaultWorkspace){
    // check empty object
    let defaultCode = targetBoard.defaultWorkspace;
    if (Object.keys(defaultCode).length !== 0) {
      Blockly.serialization.workspaces.load(defaultCode, workspace.value);
    }
  }
}

const getSerializedWorkspace = () => {
  const state = Blockly.serialization.workspaces.save(workspace.value);
  return JSON.stringify(state, null, 2);
}

const resizeWorkspace = () => {
  setTimeout(() => {
    nextTick(() => {
      console.log("resizeWorkspace");
      Blockly.svgResize(workspace.value);
      workspace.value.scrollCenter();
    });  
  }, 500);  
}
const switchTo = (mode) => {
  workspaceStore.switchMode(mode);
  if (mode == 'block') {
    resizeWorkspace();
  }else if(mode == 'code'){
    //blockly generate python code
    //let code = Blockly.Python.workspaceToCode(workspace.value);
    //let code = pythonGenerator.workspaceToCode(workspace.value);
  }
};

const undo = () => {
  console.log("undo");
  workspace.value.undo();
}
const redo = () => {
  console.log("redo");
  workspace.value.undo(true);
}
defineExpose({ workspace,resizeWorkspace,undo,redo, reload, getSerializedWorkspace });
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <div class="blocklyDiv" ref="blocklyDiv"></div>  
  </div>
</template>



<style scoped>

.switch-code {
  position: absolute;
  top: 75px;
  right: 10px;
  margin: 10px;
}
.overlay-top-btn {
  position:fixed;
  right: 55px;
}
.overlay-bottom-btn {
  position: fixed;
  top: 150px;
  right: 15px;
}
.blocklyDiv {
  height: 100%;
  width: 100%;
  text-align: left;
}
.blocklyFlyout
{
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
<style>

.blocklyToolboxDiv{
  background-color:#fafafa;
}
.blocklyToolboxCategory{
  border-bottom: 1px black solid;
  margin-bottom: 3px;
}
.blocklyTreeLabel {
  font-size: 20px;
  font-weight: bold;
  font-family: sans-serif;
  color: rgb(0, 0, 0);
  padding-left: 15px;
}
/* Adds padding around the group of categories and separators. */
.blocklyToolboxContents {
  padding: 0.5em;
}
/* Adds space between the categories, rounds the corners and adds space around the label. */
.blocklyTreeRow {
  height: 55px;
  line-height: 45px;
  padding: 3px;
  margin-bottom: 5px;
  border-radius: 4px;
}
.blocklyTreeRowContentContainer{
  display: flex;
  flex-direction: row;
  align-items: center;
}

</style>

<style>
.blocklySeperatorToolbox{
  margin-top: -5px;
  margin-bottom: 5px;
  padding-bottom: 10px;
  background: #cdcdcd;
}
</style>
