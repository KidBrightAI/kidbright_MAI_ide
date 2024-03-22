/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import '@/styles/styles.scss'
import '@core/scss/index.scss'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import VuetifyUseDialog from '@/components/comfirm-dialog'
import Blockly from "blockly"
import "blockly/blocks"
import "blockly/blocks_compressed.js"
import 'blockly/python'
import "blockly/python_compressed.js"

import { pythonGenerator } from 'blockly/python'
import { usePluginStore } from './store/plugin'
import { useWorkspaceStore } from './store/workspace'

import { loadBoard, loadPlugin, parseExamples } from './engine/board'
import Storage from './engine/storage';
import { randomId } from './engine/helper'

loadFonts()
Blockly.Python = Blockly.Python || {};
const app = createApp(App)
//------ setup global variables ------//
app.config.globalProperties.$adb = {
  transport: null,
  adb: null,
  shell: null,
};
app.config.globalProperties.$fs = await Storage.newStorage();;

//change blockly default color
Blockly.Msg.BKY_LOGIC_HUE = 10;
app.use(vuetify)
app.use(Vue3Toastify, {
  autoClose: 3000,
});
app.use(VuetifyUseDialog);
app.component('RecycleScroller', RecycleScroller);
app.component('DynamicScroller', DynamicScroller);
app.component('DynamicScrollerItem', DynamicScrollerItem);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
pinia.use(({ store }) => {
  store.$adb = app.config.globalProperties.$adb
  store.$fs = app.config.globalProperties.$fs;
});
app.use(pinia);
app.use(router)

//==================== Load Extensions ====================//
const extensions = import.meta.glob('extensions/*/config.js', { eager: true });
const defaultGraphs = import.meta.glob('extensions/*/model-graph.json', { eager: true });
const extensionComponents = import.meta.glob('extensions/*/Components/*.vue', { eager: false });
let extensionList = [];
for (const path in extensions) {
  let extension = extensions[path].default;
  extension.components = {};
  //find corresponding components
  for (const componentPath in extensionComponents) {
    if (componentPath.startsWith(path.replace('config.js', ''))) {
      // get file name from path
      let fileName = componentPath.split('/').pop().split('.')[0];
      extension.components[fileName] = componentPath.replace("/extensions/", "");
    }
  }
  //find corresponding model graph
  for (const graphPath in defaultGraphs) {
    if (graphPath.startsWith(path.replace('config.js', ''))) {
      extension.graph = defaultGraphs[graphPath].default;
    }
  }
  extensionList.push({ path: path.replace('config.js', ''), ...extension });
}
// load extension's components
console.log("===== all extensions =====");
console.log(extensionList);
app.config.globalProperties.$extensions = extensionList;
app.provide('extensions', extensionList);
//=========================================================//

// --------- init --------- //
const boardModules = import.meta.glob('boards/*/index.js', { eager: true });
const boardToolbox = import.meta.glob('boards/*/toolbox.js', { eager: true });
const workspaces = import.meta.glob('boards/*/workspace.json', { eager: true });
const boardPythonModules = import.meta.glob('boards/*/libs/*.py', { eager: false, as : 'raw'});
// load examples folder
const examples = import.meta.glob('boards/*/examples/*/readme.md', { eager: false, as : "raw" });
const parsedExamples = await parseExamples(examples);
let boards = [];
for (const path in boardModules) {
  let board = boardModules[path].default;
  let pathToolbox = path.replace('index.js', 'toolbox.js');
  let pathWorkspace = path.replace('index.js', 'workspace.json');
  let toolbox = boardToolbox[pathToolbox].default;
  let workspace = workspaces[pathWorkspace].default;
  board.toolbox = toolbox;
  board.defaultWorkspace = workspace;
  board.examples = parsedExamples;
  
  //find corresponding python modules
  let pythonModules = [];
  for (const pythonPath in boardPythonModules) {
    if (pythonPath.startsWith(path.replace('index.js', ''))) {
      pythonModules.push(pythonPath);
    }
  }
  board.pythonModules = pythonModules;

  boards.push({ path: path.replace('index.js', ''), ...board  });
}
console.log("===== all boards =====");
console.log(boards);

//==================================================//
//================= load plugins ===================//
//==================================================//
const pluginModules = import.meta.glob('plugins/*/index.js', { eager: true });
const pluginBlocks = import.meta.glob('plugins/*/blocks/*.js', { eager: false });
const pluginCodes = import.meta.glob('plugins/*/libs/*.py', { eager: false, as : 'raw' });
let plugins = [];
for (const path in pluginModules) {
  let plugin = pluginModules[path].default;
  //find corresponding blocks
  let blockFiles = [];
  for (const blockPath in pluginBlocks) {
    if (blockPath.startsWith(path.replace('index.js', ''))) {
      blockFiles.push(blockPath);
    }
  }
  //find corresponding codes
  let codeFiles = [];
  for (const codePath in pluginCodes) {
    if (codePath.startsWith(path.replace('index.js', ''))) {
      codeFiles.push(codePath);
    }
  }
  plugins.push({ path: path.replace('index.js', ''), codeFiles: codeFiles,  blockFiles: blockFiles, ...plugin });
}
console.log("===== all plugins =====");
console.log(plugins);
const pluginStore = usePluginStore();
pluginStore.plugins = plugins;
// load block installed plugins 
// reload installed plugin
let installed = pluginStore.installed;
for (const plugin of installed) {
  let pluginInfo = plugins.find(el=>el.id == plugin.id);
  installed[plugin.id] = pluginInfo;
}
//==================================================//

const workspaceStore = useWorkspaceStore();
workspaceStore.boards = boards;
const currentBoard = workspaceStore.currentBoard;

if(!currentBoard){
  // create new project
  console.log("create new project with default board");
  await workspaceStore.createNewProject({
    name: "KidBright Micro AI Project",
    id: "kbmai_project_" + randomId(),
    //projectType: selectType.value, //id of extension
    //projectTypeTitle: selectedExtension.name, //this.models.find(el=>el.value == this.selectType).text,    
    //extension: selectedExtension, 
    projectType: null,
    projectTypeTitle: "",
    extension: null,    
    model : null,
    dataset: [],
    labels: [],
    board: "kidbright-mai",
    lastUpdate: new Date(),
  });
  workspaceStore.currentBoard = boards.find(el=>el.id == "kidbright-mai");
}else{
  // reinit current board 
  console.log("reinit current board");
  workspaceStore.currentBoard = boards.find(el=>el.id == currentBoard.id);
  // assign extension to workspace
  console.log("assing extension to workspace");
  console.log(extensionList.find(el=>el.id == workspaceStore.projectType));
  workspaceStore.extension = extensionList.find(el=>el.id == workspaceStore.projectType);
}
console.log("current board ");
console.log(currentBoard);
//--------- init default blocks ----------//
let defaultBlocks = import.meta.glob('@/blocks/*.js', { eager: true, as : 'raw' });
import python from "blockly/python";
for (const path in defaultBlocks) {
  let blockText = defaultBlocks[path];
  eval(blockText,python);  
}

//---------init board ----------//
if(currentBoard){
  await loadBoard(currentBoard);
  await loadPlugin(pluginStore.installed);
}

app.config.globalProperties.$boards = boards;
app.config.globalProperties.$plugins = plugins;


app.mount('#app')
