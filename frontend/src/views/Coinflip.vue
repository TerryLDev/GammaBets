<template>
  <QuickPlay />
  <CoinFlipChoice />
  <CoinFlipListings :activeGames="activeGames" />
  <GameHistory :historyTitle="historyTitle" />
  <Transition>
    <div id="popup-background-layer" v-if="showViewMenu" @click="closeViewMenu">
      <ViewMenu />
    </div>
  </Transition>
</template>

<script>
import { computed, onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";

import CoinFlipChoice from "../components/coinflip/CoinFlipChoice.vue";
import CoinFlipListings from "../components/coinflip/CoinFlipListings.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";
import ViewMenu from "../components/coinflip/ViewMenu.vue";

export default {
  setup() {
    onMounted(() => {
      document.title = "GammaBets | CoinFlip";
    });

    const store = useStore();

    function closeViewMenu(event) {
      if (event.path[0] == document.getElementById("popup-background-layer")) {
        store.dispatch("toggleViewMenu");
        store.dispatch("resetChosenView");
      }
    }

    const activeGames = computed(() => store.state.coinflip.activeCoinflips);

    const coinflipHistory = computed(
      () => store.state.coinflip.coinflipHistory
    );

    ////////////////////////////////

    /*
    phase meanings
    0 = Start view menu the default config
    1 = player two is joining and the "default" timer is couting down
    2 = player two joined and the "flipping" timer is counting down
    3 = The coinflip is now in the animation phase with the coinflipping, after the animation it shows the winner
    */

    return {
      activeGames,
      coinflipHistory,
      closeViewMenu,
    };
  },
  beforeCreate() {
    this.$store.dispatch("getAPIActiveCoinflip");
    this.$store.dispatch("getAPICoinflipJoiningQueue");
    this.$store.dispatch("getAPICoinflipHistory");
  },
  data() {
    return {
      historyTitle: "CoinFlip",
      viewMenu: { game: {}, queue: {} },
    };
  },
  created() {
    ////////////////////////////////

    // CF Sockets
    this.$socket.on("cfTimer", (data) => {
      this.$store.dispatch("changeCFGameTimer", data);
    });

    this.$socket.on("newCFGame", (data) => {
      this.$store.dispatch("addNewCoinFlip", data);
    });

    this.$socket.on("secondPlayerAccepctedTrade", (data) => {
      this.$store.dispatch("updateCFGame", data);
    });

    this.$socket.on("secondPlayerJoiningGame", (data) => {
      this.$store.dispatch("updateCFGame", data);
    });

    this.$socket.on("updateJoiningQueue", (data) => {
      this.$store.dispatch("updateJoiningQueue", data);
    });

    this.$socket.on("secondPlayerTradeCanceled", (data) => {
      this.$store.dispatch("updateCFGame", data);
    });

    this.$socket.on("cfWinner", (data) => {
      this.$store.dispatch("updateCFGame", data);
    });

    this.$socket.on("cfHistoryUpdate", (data) => {
      this.$store.dispatch("setCoinflipHistory", data);
    });

    this.$socket.on("removeCFGame", (data) => {
      this.$store.dispatch("removeCFGame", data.GameID);
    });
  },
  methods: {
    setDefaultValues() {
      this.viewMenu.game = this.$store.getters.getChosenGame;
      this.viewMenu.queue = this.$store.getters.getChosenQueue;
    },
  },
  computed: {
    showViewMenu() {
      return this.$store.state.coinflip.viewMenu.isVisible;
    },
  },
  name: "Coinflip",
  watch: {
    showViewMenu(val) {
      if (val) {
        this.setDefaultValues();
      }
    },
  },
  components: {
    GameHistory,
    QuickPlay,
    CoinFlipChoice,
    CoinFlipListings,
    ViewMenu,
  },
};
</script>
<style></style>
