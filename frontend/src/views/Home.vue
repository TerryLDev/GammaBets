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

    const playerBets =  computed(() => store.getters.getHighStakesPlayerBets);
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
  computed: {},
  beforeCreate() {
    document.title = "GammaBets | High Stakes Jackpot";
  },
  name: "Home",
  components: { JackpotTimer, JackpotPlayArea, GameHistory, QuickPlay },
};
</script>

<style></style>
