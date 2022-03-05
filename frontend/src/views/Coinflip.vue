<template>
  <QuickPlay />
  <CoinFlipChoice />
  <CoinFlipListings :activeGames="activeGames" />
  <GameHistory :historyTitle="historyTitle" />
  <Transition>
    <div id="popup-background-layer" v-if="showViewMenu" @click="closeViewMenu">
      <ViewMenu :key="viewMenu" :viewMenu="viewMenu"/>
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

    const activeGames = computed(() => store.state.coinflip.activeCoinflips);

    const coinflipHistory = computed(
      () => store.state.coinflip.coinflipHistory
    );

    ////////////////////////////////

    // CF Sockets

    socket.on("cfTimer", (data) => {
      store.dispatch("changeCFGameTimers", data);
    });

    socket.on("newCFGame", (data) => {
      store.dispatch("addNewCoinFlip", data);
    });

    ////////////////////////////////

    return {
      activeGames,
      coinflipHistory,
      closeViewMenu
    };
  },
  data() {
    return {
      historyTitle: "CoinFlip",
      viewMenu: {game: {}, queue: {}, keyState: 0},
    };
  },
  methods: {
    setDefaultValues() {
      this.viewMenu.game = this.$store.getters.getChosenGame;
      this.viewMenu.queue = this.$store.getters.getChosenQueue;
    },
    updateQueue(data) {
      let q = data.find(queue => queue.GameID == this.viewMenu.game.gameID)
      this.viewMenu.queue = q
    },
    updateGame(data) {
      if (data.GameID == this.viewMenu.game.gameID) {
        this.viewMenu.game = data;
      }
    }
  },
  mounted() {
    socket.on("secondPlayerAccepctedTrade", (data) => {
      this.$store.dispatch("updateCFGame", data);
      this.updateGame(data);
      this.viewMenu.keyState = 3;
    });

    socket.on("secondPlayerJoiningGame", (data) => {
      this.$store.dispatch("updateCFGame", data);
      this.updateGame(data);
      this.viewMenu.keyState = 2;
    });

    socket.on("updateJoiningQueue", (data) => {
      this.$store.dispatch("updateJoiningQueue", data);
      this.updateQueue(data);
      this.viewMenu.keyState = 1;
    });
  },
  computed: {
    showViewMenu() { return this.$store.state.coinflip.viewMenu.isVisible
    },
  },
  name: "Coinflip",
  watch: { 
    showViewMenu(val) {
      if(val) {
        this.setDefaultValues();
      }
    }
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
