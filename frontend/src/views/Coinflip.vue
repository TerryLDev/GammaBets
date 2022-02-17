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
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";

import CoinFlipChoice from "../components/coinflip/CoinFlipChoice.vue";
import CoinFlipListings from "../components/coinflip/CoinFlipListings.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";
import ViewMenu from "../components/coinflip/ViewMenu.vue";

import { io } from "socket.io-client";

let socket;
const env = process.env.NODE_ENV;

if (env == "development") {
  socket = io("http://localhost:4000");
}

else {
  socket = io("https://gammabets.com")
}

export default {
  setup() {
    const store = useStore();

    store.dispatch("getAPIActiveCoinflip");
    store.dispatch("getAPICoinflipHistory");

    const activeGames = computed(() => store.state.coinflip.activeCoinflips);

    const coinflipHistory = computed(
      () => store.state.coinflip.coinflipHistory
    );

    const showViewMenu = computed(
      () => store.state.coinflip.viewMenu.isVisible
    );
    const chosenView = computed(() => store.state.coinflip.viewMenu.chosenGame);

    // CF Sockets

    socket.on("cfTimer", (data) => {
      store.dispatch("changeCFGameTimers", data);
    });

    socket.on("secondPlayerAccepctedTrade", (data) => {
      store.dispatch("modifyCFGame", data);
    });

    socket.on("newCFGame", (data) => {
      store.dispatch("addNewCoinFlip", data);
    });

    socket.on("secondPlayerAccepctedTrade", (data) => {
      store.dispatch("modifyCFGame", data);
    });

    ////////////////////////////////

    return {
      activeGames,
      coinflipHistory,
      showViewMenu,
      chosenView,
    };
  },
  data() {
    return {
      historyTitle: "CoinFlip",
    };
  },
  methods: {
    closeViewMenu(event) {
      if (event.path[0] == document.getElementById("popup-background-layer")) {
        this.$store.dispatch("toggleViewMenu");
        this.$store.dispatch("resetChosenView");
      }
    },
  },
  name: "Coinflip",
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
