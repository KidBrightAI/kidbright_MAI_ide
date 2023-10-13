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

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import { getCurrentInstance } from 'vue'
import SingletonShell from "@/engine/SingletonShell";

import FirmwareUpdateDialog from "@/components/dialog/FirmwareUpdateDialog.vue";
import NewProjectDialog from "@/components/dialog/NewProjectDialog.vue";
import ExampleDialog from "@/components/dialog/ExampleDialog.vue";
import PluginDialog from "@/components/dialog/PluginDialog.vue";

</script>
<template>
  <Header
    @serial="onSerial" 
    @help="onHelp" 
    @firmware="onFirmware"
    @example="exampleDialogOpen = true" 
    @plugin="pluginDialogOpen = true"
    @extraSave="extraSave">
  </Header>
  <BlocklyComponent ref="blocklyComp"></BlocklyComponent>    
</template>
