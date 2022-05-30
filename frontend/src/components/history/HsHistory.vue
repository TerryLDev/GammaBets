<template>
  <div v-if="histDef" id="history-div">
    <JPHistoryTop :topGame="history.topGame" />
    <div class="tile-line-break"></div>
    <div
      id="recent-history"
      v-for="histObj in history.history"
      :key="histObj.gameID"
    >
      <JPHistoryTile :historyObject="histObj" />
      <div class="tile-line-break"></div>
    </div>
  </div>
  <div v-else></div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
import JPHistoryTop from "./JPHistoryTop.vue";
import JPHistoryTile from "./JPHistoryTile.vue";

export default {
  setup() {
    const store = useStore();

    const histDef = computed(() => store.getters.getIsHighStakesHistoryDefined);
    const history = computed(() => store.getters.getHighStakesHistory);

    return {
      history,
      histDef,
    };
  },
  name: "HsHistory",
  components: {
    JPHistoryTop,
    JPHistoryTile,
  },
};
</script>

<style></style>
