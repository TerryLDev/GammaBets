<template>
  <QuickPlay />
  <JackpotTimer
    :totalPotValue="totalPotVal"
    :depositMax="betMax"
    :depositType="potName"
    :depositMin="betMin"
  />
  <JackpotPlayArea
    :potMin="betMin"
    :potName="potName"
    :potMax="betMax"
    :bets="playerBets"
    :totalPotVal="totalPotVal"
  />
  <GameHistory :historyTitle="potName" />
</template>

<script>
import { io } from "socket.io-client";
// @ is an alias to /src
import JackpotTimer from "../components/jackpot/JackpotTimer.vue";
import JackpotPlayArea from "../components/jackpot/JackpotPlayerArea.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";
import { useStore } from "vuex";
import { computed } from "vue";
const env = process.env.NODE_ENV;

export default {
  setup() {
    let socket;
    if (env == "development") {
      socket = io("http://localhost:4000");
    } else {
      socket = io(window.location.origin);
    }

    const store = useStore();

    store.dispatch("getAPIHighStakesGame");
    store.dispatch("getAPIHighStakesTimer");
    store.dispatch("getAPIHighStakesHistory");

    const playerBets =  computed(() => store.getters.getHighStakesPlayerBets);
    const totalPotVal = computed(() => store.getters.getHighStakesTotalValue);

    socket.on("newHighStakesGame", (data) => {
      store.dispatch("newHighStakesGame", data);
    });

    socket.on("newHighStakesPlayer", (data) => {
      store.dispatch("newHighStakesPlayer", data);
    });

    socket.on("highStakesTimer", (data) => {
      store.dispatch("setHighStakesTimer", data);
    });

    socket.on("highStakesHistory", (data) => {
      store.dispatch("setHighStakesHistory", data);
      console.log(data);
    });

    socket.on("highStakesWinner", (data) => {
      store.dispatch("setHighStakesWinner", data);
    });

    return {
      playerBets,
      totalPotVal,
    };
  },
  data() {
    return {
      potName: "High Stakes",
      betMin: 1.0,
      betMax: 0,
    };
  },
  computed: {},
  beforeCreate() {
    document.title = "GammaBets | High Stakes Jackpot";
  },
  name: "Home",
  components: { JackpotTimer, JackpotPlayArea, GameHistory, QuickPlay },
};
</script>

<style></style>
