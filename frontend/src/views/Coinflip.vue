<template>
  <QuickPlay />
  <CoinFlipChoice />
  <CoinFlipListings />
  <GameHistory :historyTitle="historyTitle" />
</template>

<script>
import CoinFlipChoice from "../components/coinflip/CoinFlipChoice.vue";
import CoinFlipListings from "../components/coinflip/CoinFlipListings.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";

export default {
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
