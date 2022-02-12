<template>
  <QuickPlay />
  <CoinFlipChoice />
  <CoinFlipListings :activeGames="activeGames" />
  <GameHistory :historyTitle="historyTitle" />
</template>

<script>
import { computed } from '@vue/runtime-core';
import { useStore } from "vuex";

import CoinFlipChoice from "../components/coinflip/CoinFlipChoice.vue";
import CoinFlipListings from "../components/coinflip/CoinFlipListings.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";

export default {
  setup() {

    const store = useStore();

    store.dispatch("getAPIActiveCoinflip");
    store.dispatch("getAPICoinflipHistory");

    const activeGames = computed(() => store.state.coinflip.activeCoinflips);

    const coinflipHistory = computed(() => store.state.coinflip.coinflipHistory);

    return {
      activeGames,
      coinflipHistory
    }

  },
  data() {
    return {
      historyTitle: "CoinFlip",
    };
  },
  name: "Coinflip",
  components: { GameHistory, QuickPlay, CoinFlipChoice, CoinFlipListings },
};
</script>
<style></style>
