<template>
  <div class="blockly-module">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel">
        <div class="d-flex flex-fill flex-row" style="background-color: white">
          <blockly-code
            ref="blockly"
            :style="{ width: '50%' }"
            :toolbox="toolbox"
            :blocks="block"
            language="javascript"
          ></blockly-code>
          <simulator-input-source-controller
            style="width: 50%"
            ref="simulator"
            :showController="false"
            :captureKey="false"
            v-slot="instance"
          > 
            <image-source-streamer ref="streamer" :source="instance"></image-source-streamer>
          </simulator-input-source-controller>
        </div>
        <div class="bottom-bar">
          <div class="terminal-container" id="terminal" ref="terminal"></div>
          <div class="button-container">
            <div class="button">
              <button pill v-on:click="handleRun" class="btn-run op-btn">
                <span class="ico">
                  <img v-if="!isRunning" src="~/assets/images/UI/svg/Group 80.svg"/>
                  <img v-else src="~/assets/images/UI/svg/Group 82.svg" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import SimulatorInputSourceController from "~/components/InputConnection/SimulatorInputSourceController.vue";
import BlocklyCode from "@/components/BlocklyCode.vue";
import Toolbox from "../Blocks/toolbox";
import Blocks from "../Blocks/blocks";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import axios from "axios";
import ImageSourceStreamer from "~/components/InputConnection/ImageSourceStreamer.vue";
import runner from "../classify.worker.js";

export default {
  name: "BlocklyComponent",
  components: {
    BlocklyCode,
    SimulatorInputSourceController,
    ImageSourceStreamer
  },
  data() {
    return {
      model: null,
      isRunning: false,
      worker: null,
      toolbox: Toolbox,
      block: Blocks
    };
  },
  methods: {
    handleRun: async function() {
      if (!this.isRunning) {
        this.isRunning = true;
        await this.run();
      } else {
        this.isRunning = false;
        this.stop();
      }
    },
    async processCommand(event){
      if(event.data.command == "PRINT"){
        this.term.write(event.data.msg);
      }else if(event.data.command == "MOVE"){
        let lin = event.data.lin;
        let ang = event.data.ang;
        this.$refs.simulator.$refs.gameInstance.contentWindow.VK_MovementDirec(lin,ang);
      }else if(event.data.command == "REQUEST"){
        if(event.data.data == "MODEL"){
          let modelInfo = await this.initModel();
          this.worker.postMessage({ command : "RESPONSE", subcommand : "MODEL", data: modelInfo});
        }
        if(event.data.data == "IMAGE"){
          //////////////////////////////////
          let image = this.$refs.streamer.capture();
          //////////////////////////////////
          this.worker.postMessage({command : "RESPONSE", subcommand : "IMAGE", data: image});
        }
      }else if(event.data.command == "TERMINATED"){
        this.term.write(event.data.msg);
        this.isRunning = false;
        this.stop();
      }
    },
    onWorkerError(err){
      console.log("worker error : ");
      console.log(err);
    },
    async initModel() {
      let url = new URL(this.project.tfjs.replace("filesystem:",""));
      url.host = document.location.host;
      url.protocol = document.location.protocol;
      url.port = document.location.port;
      let tfjsModelJson = "filesystem:"+url.href;
      var modelJson = await axios.get(tfjsModelJson);
      var weights = [];
      let baseModelPath = tfjsModelJson.substring(
        0,
        tfjsModelJson.lastIndexOf("/")
      );
      let downloadPromises = [];
      for (let binFile of modelJson.data.weightsManifest[0].paths) {
        let w = axios.get(baseModelPath + "/" + binFile, {
          responseType: "arraybuffer",
        });
        downloadPromises.push(w);
      }
      let downloadedWeight = await Promise.all(downloadPromises);
      weights = downloadedWeight.map((el) => el.data);
      let weightData = this.$helper.concatenateArrayBuffers(weights);
      return {
        modelJson : modelJson.data,
        weight: weightData
      }
    },
    async getLabels() {
      let url = new URL(this.project.labelFile.replace("filesystem:",""));
      url.host = document.location.host;
      url.protocol = document.location.protocol;
      url.port = document.location.port;
      let modelLabels = "filesystem:"+url.href;
      const __label_res = await axios.get(modelLabels);
      const __labels_text = __label_res.data;
      let labels = __labels_text
        .replaceAll("\r", "")
        .split("\n")
        .map((el) => el.trim())
        .filter((el) => el);
      console.log(labels);
      return labels;
    },
    run : async function() {
      this.term.write("Running ...\r\n");
      //========== start worker ==============//
      this.worker = new runner();
      this.worker.onerror = this.onWorkerError.bind(this);
      this.worker.onmessage = this.processCommand.bind(this);
      
      let labels = this.project.modelLabel;
      if((Array.isArray(labels) && labels.length == 0) || labels == undefined){
        labels = await this.getLabels();
      }
      //========== load tfjs model ===========//
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("1");
      var code = this.project.code;
      var codeAsync = `(async () => {
        ${code}
        postMessage({ command: "TERMINATED", msg: "Terminated\\r\\n" });
      })();`;
      console.log(codeAsync);
      try {
        this.worker.postMessage({ command: "RUN", code: codeAsync, labels : labels });
      } catch (error) {
        console.log(error);
      }
    },
    stop() {
      console.log("stop!!!");
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("0");
      //========== stop web worker ======//
      this.worker.terminate();
    },
  },
  computed: {
    ...mapState("project", ["project"]),
  },
  mounted() {
    this.term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.$refs.terminal);
    fitAddon.fit();
    console.log("model tfjs path : ", this.project.tfjs);
    this.term.write("$ ");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped>
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
}

button {
  color: unset;
  border: unset;
  background-color: unset;
  text-align: left;
  position: relative;

  &::after {
    position: absolute;
    top: 17px;
    right: 15px;
  }
}

.button {
  .btn-run {
    img {
      width: 100px;
    }
  }

  .btn-stop {
    img {
      width: 100px;
    }
  }
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.main-panel {
  width: calc(100% - 300px);
}

.blockly-module {
  display: flex;
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  .blockly {
    height: 100%;
    width: 100%;
  }
}

.bottom-bar {
  height: 200px; 
  display: flex;
}
.terminal-container {
  width: 100%;
  height: 100%;
  padding: 5px;
  background-color: black;
}
.button-container{
  width: 200px;
  height: 100%;
  text-align: center;
  padding-top: 46px;
  background-color: black;
}
</style>