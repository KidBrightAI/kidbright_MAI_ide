<script setup>
import Header from '@/components/Header.vue'
import { useWorkspaceStore } from "@/store/workspace"
import { useBoardStore } from "@/store/board"
import { usePluginStore } from "@/store/plugin"
import { useConfirm } from "@/components/comfirm-dialog"
import { toast } from "vue3-toastify"
import { useI18n } from "vue-i18n"
import { onMounted, ref, shallowRef, nextTick , getCurrentInstance } from "vue"
import { useRoute, useRouter } from 'vue-router'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import SidePanel from "@/components/MainPanel/SidePanel.vue"

import SavingProjectDialog from "@/components/dialog/SavingProjectDialog.vue"
import UploadProjectDialog from "@/components/dialog/UploadProjectDialog.vue"



import {sleep } from "@/engine/helper"
import ExtensionAsyncComponent from "@/components/ExtensionAsyncComponent.vue"

import RobotPoker from "@/assets/images/png/Mask_Group_12.png"
import { dialog } from 'blockly'

const confirm = useConfirm()
const { t } = useI18n()
const workspaceStore = useWorkspaceStore()
const boardStore = useBoardStore()
const pluginStore = usePluginStore()

const route = useRoute()
const router = useRouter()

const selectedMenu = ref(1)
const bottomPaneSize = ref(50)

const onBackToCoding = async () => {
  router.push("/")
}

const onResetModel = async () => {
  try{
    let message = t("page.ai.resetModelContent")
    await confirm({
      title: t("page.ai.resetModelTitle"),
      content : message,
      confirmationText: t("common.ok"),
      cancellationText: t("common.cancel"),
      dialogProps: { width: 'auto' },
    })
    workspaceStore.resetProjectType()
    router.push("/")
  }catch(e){
    return
  }
}
</script>

<template>
  <VLayout class="rounded rounded-md main-bg">
    <VNavigationDrawer
      permanent
      width="350"
      class="main-bg"
    >
      <SidePanel
        v-model:selectedMenu="selectedMenu"
        @backToCoding="onBackToCoding"
        @resetModel="onResetModel"
      />
    </VNavigationDrawer>
    <VMain
      class="d-flex align-center justify-center"
      style="min-height: 310px; height: calc(100vh);"
    >
      <Splitpanes
        ref="splitpanesRef"
        class="default-theme"
        horizontal
        :style="{ height: selectedMenu==4 ? 'calc(100vh - 64px)' : 'calc(100vh)'}"
      >
        <Pane
          v-if="workspaceStore.currentBoard"
          :size="100 - bottomPaneSize"
        >
          <ExtensionAsyncComponent
            v-if="selectedMenu === 1 && workspaceStore.extension"
            :target="workspaceStore.extension.components.Capture"
          />
          <ExtensionAsyncComponent
            v-else-if="selectedMenu === 2 && workspaceStore.extension"
            :target="workspaceStore.extension.components.Annotate"
          />
          <ExtensionAsyncComponent
            v-else-if="selectedMenu === 3 && workspaceStore.extension"
            :target="workspaceStore.extension.components.Train"
          />          
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
            <span style="margin-top: 50px; display: block;text-align: center;font-size: 25px;">{{ $t('page.ai.emptyHint') }}</span>
          </div>
        </Pane>
      </Splitpanes>
    </VMain>
    <SavingProjectDialog />
    <UploadProjectDialog />
  </VLayout>
</template>

<route lang="yaml">
meta:
  layout: blank
</route>
