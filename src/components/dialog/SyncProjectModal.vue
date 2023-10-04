<template>
  <b-modal 
    id="sync-project" 
    v-model="isSync"
    title="กำลังบันทึกโปรเจค" 
    header-bg-variant="success" 
    header-text-variant="light" 
    size="md"
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    hide-footer
  >
    <div class="text-center">
      <vm-progress
            type="circle"
            :percentage="progress"
            style="vertical-align: middle"
            strokeColor="#007E4E"
            stroke-width="24"
            :width="200"
      >
            <h4 class="my-3" text-black>กำลังบันทึก ... {{progress.toFixed(2)}}%</h4>
      </vm-progress>
    </div>
  </b-modal>
</template>
<script>
import Progress from 'vue-multiple-progress';
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
export default {
  name: "SyncProject",
  components: {
    Progress
  },
  computed: {
    ...mapState("server",["isSync","progress"]),
  },
  methods: {
    
  }
}
</script>