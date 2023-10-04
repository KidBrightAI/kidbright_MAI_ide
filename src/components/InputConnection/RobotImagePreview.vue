<template>
  <img v-if="isRunning" style="width:100%" :src="`${streamUrl}?topic=/output/image_detected&type=ros_compressed`">
</template>
<script>

import { mapState, mapActions, mapMutations, mapGetters } from "vuex";

export default {
  name: "ImagePreview",
  components: {
  },
  data() {
    return {
      // toolbox: Toolbox,
      // blocks: Blocks,
    };
  },
  methods: {
  },
  computed: {
    ...mapState("project", ["project"]),
    ...mapState(["currentDevice", "serverUrl", "streamUrl","terminalUrl","terminalWebsocket"]),
    ...mapState("server", ["url"]),
    imageSrc() {
      if (this.isRunning) {
        return `${this.streamUrl}?topic=/output/image_detected&type=ros_compressed`
      } else {
        return `${this.streamUrl}?topic=/output/image_raw&type=ros_compressed`
      }
    }
  },
};
</script>
