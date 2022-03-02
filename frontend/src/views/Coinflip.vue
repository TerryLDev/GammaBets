<template>
  <QuickPlay />
  <CoinFlipChoice />
  <CoinFlipListings :activeGames="activeGames" />
  <GameHistory :historyTitle="historyTitle" />
  <Transition>
    <div id="popup-background-layer" v-if="showViewMenu" @click="closeViewMenu">
      <ViewMenu v-for="game in gameObj" v-bind:key="game" :game="gameObj[0]" :timerObj="timerObj"/>
    </div>
  </Transition>
</template>

<script>
import { computed, onBeforeMount } from "@vue/runtime-core";
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
  socket = io(window.location.origin);
}

export default {
  setup() {
    const store = useStore();

    onBeforeMount(() => {
      store.dispatch("getAPIActiveCoinflip");
      store.dispatch("getAPICoinflipHistory");
      store.dispatch("getAPICoinflipJoiningQueue");
    })

    function closeViewMenu(event) {
      if (event.path[0] == document.getElementById("popup-background-layer")) {
        store.dispatch("toggleViewMenu");
        store.dispatch("resetChosenView");
      }
    }

    let gameObj = computed(() => {
      return [store.state.coinflip.viewMenu.chosenGame];
    });
    let timerObj = computed(() => {
      return store.getters.getGameTimerObjectByGameID(store.state.coinflip.viewMenu.chosenGame.gameID);
    });

    const activeGames = computed(() => store.state.coinflip.activeCoinflips);

    const coinflipHistory = computed(
      () => store.state.coinflip.coinflipHistory
    );

    const showViewMenu = computed(
      () => store.state.coinflip.viewMenu.isVisible
    );

    ////////////////////////////////

    // CF Sockets

    socket.on("cfTimer", (data) => {
      store.dispatch("changeCFGameTimers", data);
    });

    socket.on("secondPlayerAccepctedTrade", (data) => {
      store.dispatch("updateCFGame", data);
    });

    socket.on("secondPlayerJoiningGame", (data) => {
      store.dispatch("updateCFGame", data);
      console.log()
    });

    socket.on("newCFGame", (data) => {
      store.dispatch("addNewCoinFlip", data);
    });

    socket.on("updateJoiningQueue", (data) => {
      store.dispatch("updateJoiningQueue", data);
    });

    ////////////////////////////////

    return {
      activeGames,
      coinflipHistory,
      showViewMenu,
      gameObj,
      timerObj,
      closeViewMenu
    };
  },
  data() {
    return {
      historyTitle: "CoinFlip",
    };
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
