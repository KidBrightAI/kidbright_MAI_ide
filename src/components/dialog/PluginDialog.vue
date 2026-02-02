<script setup>
import DialogCloseBtn from "@/components/dialog/DialogCloseBtn.vue"

import { useBoardStore } from "@/store/board"
import { useWorkspaceStore } from "@/store/workspace"
import { usePluginStore } from "@/store/plugin"

import { onMounted } from "vue"
import { useConfirm } from "@/components/comfirm-dialog"
import { toast } from "vue3-toastify"

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible','installPlugin', 'uninstallPlugin'])

const boardStore = useBoardStore()
const workspaceStore = useWorkspaceStore()
const pluginStore = usePluginStore()
const confirm = useConfirm()

const refVForm = ref({})
const tab = ref("all")
const categories = ref([
  {title:"All Plugins", icon:"mdi-puzzle", value:"all"},
  {title:"Communication", icon:"mdi-serial-port", value:"Communication"},
  {title:"Data Processing", icon:"mdi-code-braces", value:"Data Processing"},
  {title:"Data Storage", icon:"mdi-database", value:"Data Storage"},
  {title:"Display", icon:"mdi-monitor", value:"Display"},
  {title:"Sensors", icon:"mdi-thermometer", value:"Sensors"},
  {title:"Signal Input/Output", icon:"mdi-swap-horizontal", value:"Signal Input/Output"},
  {title:"Timing", icon:"mdi-clock", value:"Timing"},
  {title:"Other", icon:"mdi-dots-horizontal", value:"Other"},
])

const resetForm = () => {
  emit('update:isDialogVisible', false)
}

const isInstalled = plugin => {
  return pluginStore.installed.find(p => {
    return p.name === plugin.name
  })
}

const installedPlugins = computed(() => {
  return pluginStore.plugins.filter(plugin => {
    return isInstalled(plugin)
  })
})

const listPluginByCategory = category => {
  if(category === "all"){
    return pluginStore.plugins
  }
  
  return pluginStore.plugins.filter(plugin => {
    return plugin.category === category
  })
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : '70%'"
    :model-value="props.isDialogVisible"
  >
    <VCard class="pa-sm-3 pa-3 bg-background">
      <DialogCloseBtn
        variant="text"
        size="small"
        @click="resetForm"
      />
      <VCardTitle class="text-h5 text-center">
        Manage Plugin
      </VCardTitle>
      <VCardSubtitle class="text-center mb-2">
        Select plugin to install
      </VCardSubtitle>
      <VCardItem>        
        <div class="d-flex flex-row">
          <VTabs
            v-model="tab"
            direction="vertical"
            color="primary"
          >
            <VTab value="Installed">
              <VIcon class="mr-2">
                mdi-download-box
              </VIcon>
              Installed Plugins
            </VTab>
            <VDivider class="my-1" />
            <VTab
              v-for="cat in categories"
              :key="cat.value"
              :value="cat.value"
            >
              <VIcon class="mr-2">
                {{ cat.icon }}
              </VIcon>
              {{ cat.title }}
            </VTab>
          </VTabs>
          <VWindow
            v-model="tab"
            class="window-tab"
          >
            <VWindowItem value="Installed">
              <VRow class="px-2">
                <VCol
                  v-for="plugin in installedPlugins"
                  cols="12"
                  md="4"
                >
                  <VCard color="grey-lighten-4">
                    <VToolbar
                      dark
                      density="compact"
                    >
                      <VIcon class="mx-2">
                        mdi-puzzle
                      </VIcon>
                      <div>{{ plugin.name }}</div>
                      <VSpacer />  
                      <div class="me-3">
                        Version : {{ plugin.version }}
                      </div>
                    </VToolbar>
                    <VCardText class="d-flex align-center">
                      <VImg
                        :src="plugin.path +'/'+plugin.icon"
                        width="100"
                        height="100"
                        class="mx-2"
                      />
                    </VCardText>
                    <VCardText>
                      <div class="d-flex flex-row">
                        <div class="d-flex flex-column">                 
                          <span class="text-caption">{{ plugin.description }}</span>
                        </div>
                        <VSpacer />
                        <VBtn
                          v-if="!isInstalled(plugin)"
                          icon
                          color="primary"
                          @click="emit('installPlugin',plugin)"
                        >
                          <VProgressCircular
                            v-if="plugin.installing"
                            indeterminate
                            color="white"
                            width="3"
                            size="32"
                          />
                          <VIcon v-else>
                            mdi-download
                          </VIcon>
                        </VBtn>
                        <VBtn
                          v-else
                          icon
                          color="error"
                          @click="emit('uninstallPlugin',plugin)"
                        >
                          <VProgressCircular
                            v-if="plugin.installing"
                            indeterminate
                            color="white"
                            width="3"
                            size="32"
                          />
                          <VIcon v-else>
                            mdi-trash-can
                          </VIcon>
                        </VBtn>
                      </div>  
                    </VCardText>      
                  </VCard>
                </VCol>              
              </VRow>
            </VWindowItem>
            <VWindowItem
              v-for="cat in categories"
              :key="cat.value"
              :value="cat.value"
            >
              <VRow class="px-2">
                <VCol
                  v-for="plugin in listPluginByCategory(cat.value)"
                  cols="12"
                  md="4"
                >
                  <VCard color="grey-lighten-4">
                    <VToolbar
                      dark
                      density="compact"
                    >
                      <VIcon class="mx-2">
                        mdi-puzzle
                      </VIcon>
                      <div>{{ plugin.name }}</div>
                      <VSpacer />  
                      <div class="me-3">
                        Version : {{ plugin.version }}
                      </div>
                    </VToolbar>
                    <VCardText class="d-flex align-center">
                      <VImg
                        :src="plugin.path +'/'+plugin.icon"
                        width="100"
                        height="100"
                        class="mx-2"
                      />
                    </VCardText>
                    <VCardText>
                      <div class="d-flex flex-row">
                        <div class="d-flex flex-column">                 
                          <span class="text-caption">{{ plugin.description }}</span>
                        </div>
                        <VSpacer />
                        <VBtn
                          v-if="!isInstalled(plugin)"
                          icon
                          color="primary"
                          @click="emit('installPlugin',plugin)"
                        >
                          <VProgressCircular
                            v-if="plugin.installing"
                            indeterminate
                            color="white"
                            width="3"
                            size="32"
                          />
                          <VIcon v-else>
                            mdi-download
                          </VIcon>
                        </VBtn>
                        <VBtn
                          v-else
                          icon
                          color="error"
                          @click="emit('uninstallPlugin',plugin)"
                        >
                          <VProgressCircular
                            v-if="plugin.installing"
                            indeterminate
                            color="white"
                            width="3"
                            size="32"
                          />
                          <VIcon v-else>
                            mdi-trash-can
                          </VIcon>
                        </VBtn>
                      </div>  
                    </VCardText>      
                  </VCard>
                </VCol>              
              </VRow>
            </VWindowItem>
          </VWindow>
        </div>
      </VCardItem>
    </VCard>
  </VDialog>
</template>

<style scoped>
.window-tab{
  width: 100%;
  max-height: 800px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
