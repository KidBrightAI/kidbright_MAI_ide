<template>
  <b-modal
    id="inference"
    centered
    size="md"
    title="TEST"
    modal-class="my-modal-class"
    :hide-footer="true"
    @close="onClose"
    @hide="onClose"
  >
    <div class="display-screen">
      <image-capture
        :width="435"
        source=""
        ref="camera"
        :simulator="false"
        @started="(_) => (cameraReady = true)"
        @stoped="(_) => (cameraReady = false)"
      ></image-capture>
    </div>
    <div class="infer-class">
      <img
        class="tag"
        src="~/assets/images/UI/svg/Group 177_green.svg"
        height="24"
      />
      <span>{{ result }} [{{ (this.prob * 100).toFixed(2) }}%]</span>
    </div>
    <div class="infer_control">
      <b-avatar
        button
        @click="onInfer"
        :disabled="!cameraReady"
        variant="primary"
        :icon="terminated ? 'play-fill' : 'stop-fill'"
        class="align-baseline"
      ></b-avatar>
    </div>
  </b-modal>
</template>
<script>
import axios from "axios";
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import ImageCapture from "~/components/InputConnection/ImageCapture.vue";
export default {
  name: "InferenceModal",
  components: {
    ImageCapture,
  },
  data() {
    return {
      terminated: true,
      cameraReady: false,
      result: "-",
      prob: 0,
      model: null,
      labels: [],
    };
  },
  computed: {
    ...mapState("server", [
      "url",
      "isConnected",
      "isTraining",
      "isTerminating",
      "isTrained",
    ]),
    ...mapState("project", ["project"]),
  },
  methods: {
    getSource: async function () {
      return this.$refs.camera.$refs.video.el;
    },
    classify: async function (image) {
      let inputShape = this.model.layers[0].inputSpec[0].shape;
      const batched = tf.tidy(() => {
        let normalized = tf.add(
          tf.mul(tf.cast(image, "float32"), 2 / 255.0),
          -1
        ); //min -1 to max 1
        let resized = tf.image.resizeBilinear(
          normalized,
          [inputShape[1], inputShape[2]],
          true
        ); //alignCorners = true;
        let batched = tf.reshape(resized, [
          -1,
          inputShape[1],
          inputShape[2],
          inputShape[3],
        ]); //return tf.expandDims(img);
        return batched;
      });
      let res = await model.predict(batched);
      return res;
    },
    doTensorflowJsInference: async function (first = true) {
      if (this.terminated) {
        return;
      }
      if (!this.cameraReady) {
        await this.sleep(500);
        return await this.doInference();
      }
      if (first) {
        this.result = "Loading model";
        let workpath = `${this.url}/projects/${this.project.project.id}`;
        console.log(workpath);
        this.model = await tf.loadLayersModel(`${workpath}/tfjs/model.json`);
        this.result = "Model loaded";
        let label_res = await fetch(`${workpath}/labels.txt`);
        let labels_text = await label_res.text();
        this.labels = labels_text.replaceAll("\\r", "").split("\\n");
        this.result = "LABELS : " + this.labels.join(",");
        let inputShape = this.model.layers[0].inputSpec[0].shape;
        this.result = "Preloading model";
        const zeroTensor = tf.zeros(
          [1, inputShape[1], inputShape[2], inputShape[3]],
          "int32"
        );
        const result = await this.model.predict(zeroTensor);
        const res = await result.data();
        result.dispose();
        zeroTensor.dispose();
        this.result = "Preload model success";
      } else {
        let image = this.getSource();
        let image_tensor = await tf.browser.fromPixels(image);
        let res = await this.classify(this.model, image_tensor);
        let data = res.dataSync();
        let maxIndex = res.argMax(1).dataSync()[0];
        this.result = labels[maxIndex];
        this.prob = data[maxIndex];
      }
    },
    doInference: async function () {
      if (this.terminated) {
        return;
      }
      if (!this.cameraReady) {
        await this.sleep(500);
        return await this.doInference();
      }
      let { image, thumbnail } = await this.$refs.camera.snap();
      const formData = new FormData();
      formData.append("image", image, "infer.jpg");
      let project_id = this.project.id;
      formData.append("project_id", project_id);
      formData.append("type", "classification");
      try {
        let res = await axios({
          method: "POST",
          url: this.url + "/inference_image",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.data.result == "OK") {
          this.result = res.data.prediction;
          this.prob = res.data.prob;
        }
        await this.sleep(200);
        return await this.doInference();
      } catch (err) {
        console.log(err);
        return;
      }
    },
    onInfer: async function () {
      this.terminated = !this.terminated;
      console.log("terminated : ", this.terminated);
      if (!this.terminated) {
        await this.doInference();
      }
    },
    onClose: async function () {
      this.terminated = true;
      this.cameraReady = false;
    },
    sleep: function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>
<style lang="scss" scoped>
.display-screen {
  background-color: #fff;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  margin-top: 10px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.infer-class {
  padding: 10px;
  img {
    margin-right: 0.5em;
  }
  span {
    font-weight: 600;
  }
}
.infer_control {
  text-align: center;
}
</style>
