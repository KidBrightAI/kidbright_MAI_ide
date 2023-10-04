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

import VuetifyUseDialog from '@/components/comfirm-dialog'
import Blockly from "blockly"
import "blockly/blocks"
import "blockly/blocks_compressed.js"
import 'blockly/python'
import "blockly/python_compressed.js"

import { pythonGenerator } from 'blockly/python'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { usePluginStore } from './store/plugin'
import { useWorkspaceStore } from './store/workspace'

import { loadBoard, loadPlugin, parseExamples } from './engine/board'
loadFonts()
Blockly.Python = Blockly.Python || {};
const app = createApp(App)
//------ setup global variables ------//
app.config.globalProperties.$adb = {
  transport: null,
  adb: null,
  shell: null,
};

//change blockly default color
Blockly.Msg.BKY_LOGIC_HUE = 10;
app.use(vuetify)
app.use(Vue3Toastify, {
  autoClose: 3000,
});
app.use(VuetifyUseDialog);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
pinia.use(({ store }) => {
  store.$adb = app.config.globalProperties.$adb
});
app.use(pinia);
app.use(router)

// --------- init --------- //
const boardModules = import.meta.glob('boards/*/index.js', { eager: true });
const boardToolbox = import.meta.glob('boards/*/toolbox.js', { eager: true });
const workspaces = import.meta.glob('boards/*/workspace.json', { eager: true });
// load examples folder
const examples = import.meta.glob('boards/*/examples/*/readme.md', { eager: false });
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
  boards.push({ path: path.replace('index.js', ''), ...board  });
}
console.log("===== all boards =====");
console.log(boards);

// ------- load current board from localStorage ------- //
let currentBoard = boards[0];
let currentBoardId = localStorage.getItem('currentBoardId');
if (currentBoardId) {
  console.log("===== current board =====");
  console.log(currentBoardId);
  currentBoard = boards.find(board => board.id == currentBoardId);
} else {
  // set current board to the first board
  localStorage.setItem('currentBoard', currentBoard.id);
  console.log("===== current board =====");
  console.log(boards[0]);
}
//==================================================//
//================= load plugins ===================//
//==================================================//
const pluginModules = import.meta.glob('plugins/*/extension.js', { eager: true });
const pluginBlocks = import.meta.glob('plugins/*/blocks/*.js', { eager: false });
const pluginCodes = import.meta.glob('plugins/*/modules/*.py', { eager: false });
let plugins = [];
for (const path in pluginModules) {
  let plugin = pluginModules[path].default;
  //find corresponding blocks
  let blockFiles = [];
  for (const blockPath in pluginBlocks) {
    if (blockPath.startsWith(path.replace('extension.js', ''))) {
      blockFiles.push(blockPath);
    }
  }
  //find corresponding codes
  let codeFiles = [];
  for (const codePath in pluginCodes) {
    if (codePath.startsWith(path.replace('extension.js', ''))) {
      codeFiles.push(codePath);
    }
  }
  plugins.push({ path: path.replace('extension.js', ''), codeFiles: codeFiles,  blockFiles: blockFiles, ...plugin });
}
console.log("===== all plugins =====");
console.log(plugins);
const pluginStore = usePluginStore();
pluginStore.plugins = plugins;
// load block installed plugins 

//==================================================//

const workspaceStore = useWorkspaceStore();
workspaceStore.currentBoard = currentBoard;
workspaceStore.boards = boards;
//--------- init default blocks ----------//!SECTION
let defaultBlocks = import.meta.glob('@/blocks/*.js', { eager: false });
for (const path in defaultBlocks) {
  fetch(path).then(
    response => response.text()
  ).then(text => {
    eval(text,pythonGenerator);
  }).catch(
    err => console.error(err)
  );
}
//---------init board ----------//!SECTION
await loadBoard(currentBoard);
await loadPlugin(pluginStore.installed);

app.config.globalProperties.$boards = boards;
app.config.globalProperties.$plugins = plugins;

//---- setup monaco editor ----//
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'python') {
      //return new pythonWorker();
    }
    return new editorWorker();
  },
};

app.mount('#app')
