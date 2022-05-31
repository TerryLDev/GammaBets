<template>
  <div id="jp-play-area" class="primary-color default-cell accent-color">
    <div class="pot-info secondary-color default-secondary-cell accent-color">
      <h3 style="text-align: right">Min: ${{ potMin.toFixed(2) }}</h3>
      <h3>{{ potName }} Pot</h3>
      <h3 v-if="potMax == 0">Max: No Limit</h3>
      <h3 v-else>Max: ${{ potMax.toFixed(2) }}</h3>
    </div>
    <div id="jp-pot">
      <UserBetEntry
        v-for="player in bets"
        v-bind:key="player"
        :player="player"
        :potTotalValue="totalPotVal"
      />
    </div>
  </div>
</template>

<script>
import UserBetEntry from "./UserBetEntry.vue";

export default {
  props: {
    potMin: { type: Number },
    potName: { type: String },
    potMax: { type: Number },
    bets: { type: Array },
    totalPotVal: { type: Number },
  },
  name: "JackpotPlayerArea",
  components: { UserBetEntry },
};
</script>

<style>
#jp-play-area {
  display: inline-flex;
  margin-top: 20px;
  width: calc(100% - (20px + 350px));
  height: calc(100% - (20px + 60px + 20px + 250px + 20px));
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding: 10px;
}

#jp-pot {
  margin-top: 10px;
  height: 100%;
  width: 100%;
  border-radius: 0px 0px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

#jp-pot::-webkit-scrollbar {
  display: none;
}

.pot-info {
  width: calc(100% - 40px);
  height: 30px;
  display: grid;
  grid-template: auto / 1fr auto 1fr;
  align-items: center;
  gap: 30px;
  margin: 5px 0px;
}

.pot-info h3 {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
  color: #ffffff;
}
</style>
