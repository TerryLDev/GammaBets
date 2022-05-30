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
// @ is an alias to /src
import JackpotTimer from "../components/jackpot/JackpotTimer.vue";
import JackpotPlayArea from "../components/jackpot/JackpotPlayerArea.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  setup() {

    const store = useStore();

    store.dispatch("getAPIHighStakesGame");
    store.dispatch("getAPIHighStakesTimer");
    store.dispatch("getAPIHighStakesHistory");

    const playerBets = computed(() => store.getters.getHighStakesPlayerBets);
    const totalPotVal = computed(() => store.getters.getHighStakesTotalValue);

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
  beforeCreate() {
    document.title = "GammaBets | High Stakes Jackpot";
  },
  created() {
    this.$socket.on("newHighStakesGame", (data) => {
      this.$store.dispatch("newHighStakesGame", data);
    });

    this.$socket.off("newHighStakesPlayer").on("newHighStakesPlayer", (data) => {
      console.log("NEW PLAYER!", data.Player.username);
      this.$store.dispatch("newHighStakesPlayer", data);
    });

    this.$socket.on("highStakesTimer", (data) => {
      this.$store.dispatch("setHighStakesTimer", data);
    });

    this.$socket.on("highStakesHistory", (data) => {
      this.$store.dispatch("setHighStakesHistory", data);
      console.log(data);
    });

    this.$socket.on("highStakesWinner", (data) => {
      this.$store.dispatch("setHighStakesWinner", data);
    });
  },
  name: "Home",
  components: { JackpotTimer, JackpotPlayArea, GameHistory, QuickPlay },
};
</script>

<style></style>
