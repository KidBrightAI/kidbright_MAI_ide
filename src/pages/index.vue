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

import { onMounted, ref, shallowRef, nextTick, watch, onBeforeUnmount, onBeforeMount } from "vue"; //Simulator Add {onBeforeUnmount, onBeforeMoun}

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
import DeployAsAppDialog from "@/components/dialog/DeployAsAppDialog.vue"

//------- Assets --------//
import RobotPoker from "@/assets/images/png/Mask_Group_12.png"

import SimulatorController from "@/components/SimulatorController.vue"; //Simulator Add
import { aev } from '../../AE/AEsession.js'; //Simulator Add
import { runSimulatorPython, stopSimulatorPython } from '@/store/simulator' //Simulator Add

//import { logkmv } from "@/components/SimulatorController.vue"; //Simulator Add

const showSimulator = ref(false)//Simulator Add
const isSimDocked = ref(false)//Simulator Add

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

//simulator add (start)
let updateImpactTimer;
function generateRandomSessionID(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
setInterval(() => { aev.duration++ }, 1000);
onBeforeMount(() => {
  aev.sessionid = generateRandomSessionID(15);
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => { aev.ip = data.ip })
    .catch(() => { aev.ip = 'none' })

    console.log("Init KMV:" + aev.email + ", " + aev.sessionid);
})

const generateSimCode = () => {
  if (!blocklyComp.value?.workspace) return ""
  try {
    pythonGenerator.STATEMENT_PREFIX = '_kmv_step(%1)\n'
    const code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace)
    pythonGenerator.STATEMENT_PREFIX = ''
    return code
  } catch (e) {
    pythonGenerator.STATEMENT_PREFIX = ''
    console.warn("[Simulator] Error generating sim code with prefix:", e)
    return pythonGenerator.workspaceToCode(blocklyComp.value.workspace)
  }
}

const openSimulator = async () => {
  if (showSimulator.value === false) {
    showSimulator.value = true
    await sleep(600)
  }
  const code = generateSimCode()
  if (code) {
    toast.info("กำลังอัปโหลดโค้ดสู่ Simulator...")
    await boardStore.upload_kmv(code)
    toast.success("อัปโหลดโค้ดสู่ Simulator สำเร็จ")
  }
}

const closeSimulator = () => {
  showSimulator.value = false
  stopSimulatorPython()
}

const toggleSimDock = () => {
  isSimDocked.value = !isSimDocked.value
}
//simulator add (end)

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
  // On boards that support packaged Maix apps (MaixCAM), Ctrl+click on
  // the upload button opens the Deploy-as-App dialog instead of the
  // ad-hoc /root/app/run.py upload. V831 keeps Ctrl+click as
  // "writeStartup" — its init.d-based auto-start is the only thing
  // that modifier was ever meaningful for.
  if (event?.ctrlKey && workspaceStore.currentBoard?.appTemplate) {
    dialogs.value.deployAsApp = true
    return
  }

  if (!isSerialPanelOpen.value) {
    await onSerial()
    await sleep(1000)
  }
  resetTerminal()

  const code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace)
  const isWriteStartupScriptNeeded = event?.ctrlKey
  if (isWriteStartupScriptNeeded) {
    toast.info("กำลังเขียนสคริปต์เริ่มต้นด้วย")
  }

  const res = await boardStore.upload(code, isWriteStartupScriptNeeded)
  toast[res ? 'success' : 'error'](res ? "อัปโหลดสำเร็จ" : "อัปโหลดไม่สำเร็จ")
}

const onStop = async () => {
  try {
    await boardStore.stopProgram()
    toast.info("หยุดโปรแกรมแล้ว")
  } catch (e) {
    console.error("stopProgram failed", e)
    toast.error(`หยุดโปรแกรมไม่สำเร็จ: ${e?.message || e}`)
  }
}

//=====================================================================//
//===================== Deploy as App (V2 only) ======================//
//=====================================================================//

/**
 * Renders the user's project into a Maix App folder under
 * /maixapp/apps/<id>/ on the board. Uses the static template that
 * ships under boards/kidbright-mai-plus/app_template/ (loaded into
 * `currentBoard.appTemplate` by main.js) and the live Blockly code as
 * run.py. The template's main.py spawns run.py and watches the
 * touchscreen for an exit-zone tap.
 */
const onDeployAsApp = async submitted => {
  const board = workspaceStore.currentBoard
  const tpl = board?.appTemplate
  if (!tpl) {
    toast.error("บอร์ดนี้ไม่รองรับการติดตั้งเป็นแอปพลิเคชัน")
    return
  }

  const code = pythonGenerator.workspaceToCode(blocklyComp.value.workspace)
  // Deploy uses a different wrapper than Run: board.codeTemplate calls
  // kill_system_app() which would tear down the launcher (our parent
  // process) — fine for Run, fatal for Deploy. The board ships a
  // run_template.py with just signal handlers + ##{main}## hole.
  const runTemplate = tpl["run_template.py"] || board.codeTemplate || "##{main}##"
  const wrapped = runTemplate.replace("##{main}##", code)

  // Render app.yaml from the template by string-substituting {{key}}.
  const yamlTpl = tpl["app.yaml.tpl"] || ""
  const yamlText = yamlTpl
    .replaceAll("{{id}}",      submitted.id)
    .replaceAll("{{name}}",    submitted.name)
    .replaceAll("{{version}}", submitted.version || "1.0.0")
    .replaceAll("{{author}}",  submitted.author || "kidbright")
    .replaceAll("{{desc}}",    submitted.desc || "")

  // Resolve the icon: user upload wins, else the bundled default PNG.
  let iconBytes
  if (submitted.iconFile) {
    iconBytes = await submitted.iconFile.arrayBuffer()
  } else {
    const url = tpl["app.png"]
    iconBytes = await (await fetch(url)).arrayBuffer()
  }

  const files = [
    { name: "app.yaml", content: yamlText },
    { name: "main.py",  content: tpl["main.py"] || "" },
    { name: "run.py",   content: wrapped },
    { name: "app.png",  content: iconBytes },
  ]

  // The submit button's spinner + label "กำลังติดตั้ง..." already tells
  // the user we got the click. uploadModelIfNeeded / writeFile emit
  // their own progress toasts, so a top-level info toast here just
  // adds noise — let the final success/error toast be the only banner.
  try {
    const ok = await boardStore.deployAsApp({
      appId: submitted.id,
      autoStart: !!submitted.autoStart,
      files,
    })
    if (ok) {
      toast.success(`ติดตั้งแอปพลิเคชัน “${submitted.name || submitted.id}” สำเร็จ`)
      dialogs.value.deployAsApp = false
    } else {
      toast.error("ติดตั้งไม่สำเร็จ — กรุณาตรวจสอบการเชื่อมต่อบอร์ดแล้วลองอีกครั้ง")
    }
  } catch (e) {
    console.error("deployAsApp failed", e)
    toast.error(`ติดตั้งแอปพลิเคชันไม่สำเร็จ: ${e?.message || e}`)
  }
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

  //simulator add (start)
  // ฟังก์ชันที่ปุ่มใน Unity KMV เรียกมายัง Vue IDE
  window.runBlocklyFromSim = async () => {
    const code = generateSimCode()
    if (!code) return
    await boardStore.upload_kmv(code)
  }
  window.stopBlocklyFromSim = () => {
    stopSimulatorPython()
  }

  // รองรับการส่งข้อความผ่าน postMessage จาก Iframe KMV
  const onSimMessage = event => {
    if (event.data?.action === 'KMV_RUN_CODE') {
      if (typeof window.runBlocklyFromSim === 'function') {
        window.runBlocklyFromSim()
      }
    } else if (event.data?.action === 'KMV_STOP_CODE') {
      if (typeof window.stopBlocklyFromSim === 'function') {
        window.stopBlocklyFromSim()
      }
    }
  }
  window.addEventListener('message', onSimMessage)
  window._kmv_onSimMessage = onSimMessage

})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    if (window._kmv_onSimMessage) {
      window.removeEventListener('message', window._kmv_onSimMessage)
      delete window._kmv_onSimMessage
    }
    delete window.runBlocklyFromSim
    delete window.stopBlocklyFromSim
    stopSimulatorPython()
  }
})
// Simulator Add (end)

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
              @stop="onStop"
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
              @openKMV="openSimulator"
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
      <!-- Simulator Add (start)-->
      <div
        v-if="showSimulator"
        :style="isSimDocked ? {
          position: 'fixed',
          right: '24px',
          top: '115px',
          width: '540px',
          height: '460px',
          zIndex: 9999,
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          border: '2px solid #00b0ff',
          borderRadius: '12px',
          background: '#1a1d24',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        } : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '82%',
          height: '82%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
          border: '2px solid #3f4450',
          borderRadius: '14px',
          background: '#1a1d24',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }"
      >
        <!-- Titlebar with Dock/Undock and Close -->
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            background: #252830;
            color: #ffffff;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 1px solid rgba(255,255,255,0.12);
            user-select: none;
          "
        >
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>🤖 KMV Virtual Board</span>
            <span
              style="
                font-size: 11px;
                color: #00e5ff;
                background: rgba(0,229,255,0.12);
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: 500;
              "
            >
              {{ isSimDocked ? 'โหมดแบ่งหน้าจอ (มองเห็นบล็อก)' : 'โหมดขยายเต็มหน้าจอ' }}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button
              style="
                background: rgba(255,255,255,0.12);
                border: 1px solid rgba(255,255,255,0.15);
                color: #ffffff;
                padding: 4px 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: background 0.15s;
              "
              :title="isSimDocked ? 'สลับเป็นโหมดขยายเต็มหน้าจอ' : 'ย่อไว้ข้างจอ (ให้มองเห็นบล็อกไปพร้อมกัน)'"
              @click="toggleSimDock"
            >
              <span>{{ isSimDocked ? '🗖 ขยายเต็ม' : '📌 แบ่งหน้าจอ' }}</span>
            </button>
            <button
              style="
                background: #dc3545;
                border: none;
                color: #ffffff;
                padding: 4px 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: background 0.15s;
              "
              title="ปิดหน้าต่าง Simulator"
              @click="closeSimulator"
            >
              ✕
            </button>
          </div>
        </div>
        <simulator-controller
          style="width: 100%; height: 100%; background-color: black"
          ref="simulator"
          :showController="false"
          :captureKey="false"
          v-slot="instance"
          >

        </simulator-controller>
      </div>
      <!-- Simulator Add (end)-->
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
  <DeployAsAppDialog
    v-model:isDialogVisible="dialogs.deployAsApp"
    @submit="onDeployAsApp"
  />
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
