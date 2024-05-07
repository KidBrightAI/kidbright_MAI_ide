<template>  
  <BaklavaEditor :view-model="baklava" />    
  <div style="position: absolute; top: 90px;">
    <VBtn class="me-2 ms-4" @click="resetToDefault" size="small" icon="mdi-refresh"></VBtn>
    <VBtn class="mx-1" @click="downloadGraph" size="small" icon="mdi-download"></VBtn>
    <VBtn class="mx-1" @click="uploadGraph" size="small" icon="mdi-upload"></VBtn>
    <!-- <VBtn class="mx-1" @click="computeGraph" size="small" icon="mdi-graph"></VBtn> -->
  </div>
</template>

<script setup>
import { useWorkspaceStore } from '@/store/workspace';
import { BaklavaEditor, useBaklava } from "@baklavajs/renderer-vue";
import { DependencyEngine } from "@baklavajs/engine";
import "@baklavajs/themes/dist/syrup-dark.css";
import { BaklavaInterfaceTypes, NodeInterfaceType } from "@baklavajs/interface-types";
import { modelInput, modelOutput, modelLayer } from '@/nodes/interfaces/interface-types';

import { InputNode } from "@/nodes/inputs/default-input";
import { OutputNode } from "@/nodes/outputs/default-output";
import { ClassificationOutputNode } from "@/nodes/outputs/classification-output";
import { ObjectDetectionOutputNode } from "@/nodes/outputs/object-detection-output";
import { YoloNode } from "@/nodes/models/yolo";
import { ResnetNode } from "@/nodes/models/resnet";
import { MobileNetNode } from "@/nodes/models/mobilenet";
import { onMounted } from "vue";

const workspaceStore = useWorkspaceStore();
const baklava = useBaklava();
const editor = baklava.editor;
const engine = new DependencyEngine(editor);
const token = Symbol();

baklava.settings.enableMinimap = false;
baklava.settings.toolbar.enabled = false;
baklava.settings.sidebar.enabled = false;
baklava.settings.contextMenu.enabled = true;
baklava.settings.palette.enabled = false;
baklava.settings.nodes.defaultWidth = 280;


//register interface
const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor, { viewPlugin : baklava });
nodeInterfaceTypes.addTypes([modelInput, modelOutput, modelLayer]);

//register custom node
editor.registerNodeType(InputNode, { category: "Input" });
editor.registerNodeType(OutputNode, { category: "Output" });
editor.registerNodeType(ClassificationOutputNode, { category: "Output" });
editor.registerNodeType(ObjectDetectionOutputNode, { category: "Output" });
//editor.registerNodeType(MobileNetNode, { category: "Model" });
editor.registerNodeType(ResnetNode, { category: "Model" });
editor.registerNodeType(YoloNode, { category: "Model" });

//props

const resetToDefault = ()=> {  
  console.log("--- reset graph ---");
  //check props.graph is empty object
  if(Object.keys(workspaceStore.defaultGraph).length !== 0){
    editor.load(workspaceStore.defaultGraph);
  }
};

const computeGraph = async () => {
  let res = await engine.runOnce({ });
  //get last object of Map
  if(res.size === 0){
    return {};
  }
  let modelGraphConfig = Array.from(res.values()).pop();
  return modelGraphConfig.get('result');
}

const downloadGraph = () => {
  const graph = editor.save();
  const data = JSON.stringify(graph);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "model-graph.json";
  a.click();
  URL.revokeObjectURL(url);
};

const uploadGraph = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const graph = JSON.parse(data);
      editor.load(graph);
    };
    reader.readAsText(file);
  };
  input.click();
};
const saveGraph = async() => {
  const graph = editor.save();
  workspaceStore.graph = graph;
  let trainConfig = await computeGraph();
  workspaceStore.trainConfig = trainConfig;
};
onMounted(() => {
  //check if workspaceStore is empty then load default graph or if emty then load graph or do nothing
  if (Object.keys(workspaceStore.graph).length === 0) {
    if(Object.keys(workspaceStore.defaultGraph).length !== 0){
      editor.load(workspaceStore.defaultGraph);
    }
  } else {
    editor.load(workspaceStore.graph);
  }
  //listen to graph change
  editor.nodeEvents.update.subscribe(token, async (data, node) => {
    await saveGraph();
  });
  editor.graphEvents.addConnection.subscribe(token, async(data) => {
    await saveGraph();
  });
  editor.graphEvents.removeConnection.subscribe(token, async(data) => {
    await saveGraph();
  });
  editor.graphEvents.addNode.subscribe(token, async(data) => {
    await saveGraph();
  });
  editor.graphEvents.removeNode.subscribe(token, async(data) => {
    await saveGraph();
  });
});

//watch workspaceStore.defaultGraph
watch(() => workspaceStore.defaultGraph, (newVal, oldVal) => {
  if (Object.keys(newVal).length !== 0) {
    editor.load(newVal);
  }
});

defineExpose({
  downloadGraph,
  uploadGraph,
  computeGraph,
  resetToDefault,
  saveGraph
});
</script>
<style lang="scss">
$primary-color: #007e4e;
:root {
    // Controls
    --baklava-control-color-primary: #007e4e;    
    --baklava-control-color-foreground: #f0f0f0;    
    --baklava-control-color-disabled-foreground: #aaaaaa;
    --baklava-editor-background-pattern-default: #fcfcfc;
    --baklava-editor-background-pattern-line: #e4e4e4;
    --baklava-editor-background-pattern-black: #dbdbdb;
    --baklava-toolbar-background: #007e4e;
    --baklava-toolbar-foreground: #f0f0f0;
    --baklava-node-title-color-background: #007e4e;
}
.baklava-node-interface[data-interface-type="modelInput"] .__port {
    background-color: rgb(255, 136, 0);
}

.baklava-node-interface[data-interface-type="modelOutput"] .__port {
    background-color: rgb(0, 15, 223);
}
.baklava-connection{
  stroke-width: 7px;
  stroke: #007e4e;
}
.baklava-node-interface .__port {    
    width: 16px;
    height: 16px;
    top: calc(50% - 8px);    
}

</style>
