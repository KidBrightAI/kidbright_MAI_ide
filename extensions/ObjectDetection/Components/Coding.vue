<template>
  <coding-browser v-if="currentDevice == 'BROWSER'"></coding-browser>
  <coding-robot v-else-if="currentDevice == 'ROBOT'"></coding-robot>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import CodingBrowser from "./CodingBrowser.vue";
import CodingRobot from "./CodingRobot.vue";

export default {
  name: "BlocklyComponent",
  components: {
    CodingBrowser,
    CodingRobot
  },
  computed: {
    ...mapState(["currentDevice"]),
  }
};
</script>