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
/*
I FINALLY GOT IT

DO NOT UPDATE THE QUEUE AND GAME FROM STATE. UPDATE THE DATA LOCALLY!

GET THE TIMER OBJ IN VIEWMENU COMPONENT

*/
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
} else {
  socket = io(window.location.origin);
}

export default {
  setup() {
    const store = useStore();

    onBeforeMount(() => {
      store.dispatch("getAPIActiveCoinflip");
      store.dispatch("getAPICoinflipHistory");
      store.dispatch("getAPICoinflipJoiningQueue");
    });

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

    // CF Sockets

    socket.on("cfTimer", (data) => {
      store.dispatch("changeCFGameTimer", data);
    });

    socket.on("newCFGame", (data) => {
      store.dispatch("addNewCoinFlip", data);
    });

    socket.on("secondPlayerAccepctedTrade", (data) => {
      store.dispatch("updateCFGame", data);
    });

    socket.on("secondPlayerJoiningGame", (data) => {
      console.log(data);
      store.dispatch("updateCFGame", data);
    });

    socket.on("updateJoiningQueue", (data) => {
      console.log(data);

      store.dispatch("updateJoiningQueue", data);
    });

    ////////////////////////////////

    return {
      activeGames,
      coinflipHistory,
      closeViewMenu,
    };
  },
  data() {
    return {
      historyTitle: "CoinFlip",
      viewMenu: { game: {}, queue: {} },
    };
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
