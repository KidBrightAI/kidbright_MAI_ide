<template>
  <div class="img-counter">
    <span class="current-img">{{prefix}} </span>
    <span class="ov-img">{{current || "-"}} {{seperator}} {{dataLength}} {{suffix}}{{dataLength > 1? "s" : ""}}</span>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
export default {
  name: "DatasetCounter",
  props : {
    prefix : {
      type : String
    },
    current : {
    },
    seperator : {
      type: String,
      default : "/"
    },
    suffix:{
      type : String
    },
  },
  components: { },
  computed: {
    ...mapGetters("dataset",['dataLength','positionOf']),
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #007e4e;
.img-counter {
    position: absolute;
    bottom: 30px;
    right: 30px;
    background-color: #fff;
    border-radius: 19px;
    padding: 10px 20px;
    box-shadow: 0 0 10px #33333333;
    span {
      font-weight: bold;
    }
    .current-img {
      color: $primary-color;
      padding-right: 5px;
    }
  }
</style>