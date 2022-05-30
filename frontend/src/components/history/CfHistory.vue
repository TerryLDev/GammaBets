<template>
  <div v-if="cfDef" id="history-div">
    <CFHistoryTop :topGame="cfHistory.topGame" />
    <div
      id="recent-history"
      v-for="histObj in cfHistory.history"
      :key="histObj.gameID"
    >
      <CFHistoryTile :historyObject="histObj" />
      <div class="tile-line-break"></div>
    </div>
  </div>
  <div v-else></div>
</template>

<script>
import CFHistoryTop from "./CFHistoryTop.vue";
import CFHistoryTile from "./CFHistoryTile.vue";

export default {
  props: {
    cfHistory: Object,
  },
  computed: {
    cfDef() {
      return this.$store.getters.getIsCfHistoryDefined;
    },
  },
  name: "CfHistory",
  components: {
    CFHistoryTop,
    CFHistoryTile,
  },
};
</script>

<style></style>
