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

    store.dispatch("getAPILowStakesGame");
    store.dispatch("getAPILowStakesTimer");
    store.dispatch("getAPILowStakesHistory");

    const playerBets = computed(() => store.getters.getLowStakesPlayerBets);
    const totalPotVal = computed(() => store.getters.getLowStakesTotalValue);

    return {
      playerBets,
      totalPotVal,
    };
  },
  data() {
    return {
      potName: "Low Stakes",
      betMin: 1.0,
      betMax: 20.0,
    };
  },
  beforeCreate() {
    document.title = "GammaBets | Low Stakes Jackpot";
  },
  created() {
    this.$socket.on("newLowStakesGame", (data) => {
      this.$store.dispatch("newLowStakesGame", data);
    });

    this.$socket.off("newLowStakesPlayer").on("newLowStakesPlayer", (data) => {
      console.log("NEW PLAYER!", data.Player.username);
      this.$store.dispatch("newLowStakesPlayer", data);
    });

    this.$socket.on("lowStakesTimer", (data) => {
      this.$store.dispatch("setLowStakesTimer", data);
    });

    this.$socket.on("lowStakesHistory", (data) => {
      this.$store.dispatch("setLowStakesHistory", data);
      console.log(data);
    });

    this.$socket.on("lowStakesWinner", (data) => {
      this.$store.dispatch("setLowStakesWinner", data);
    });
  },
  name: "Home",
  components: { JackpotTimer, JackpotPlayArea, GameHistory, QuickPlay },
};
</script>

<style></style>
