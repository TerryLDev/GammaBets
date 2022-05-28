<template>
  <Transition>
    <div id="cf-history-top">
      <img class="top-history-img" :src="getWinnerPicture()" />

      <h3 class="top-history-title">Largest Pot</h3>

      <div style="margin-bottom: 5px" class="top-history-info">
        <p>Total Value:</p>
        <p>${{ topGame.TotalPotValue.toFixed(2) }}</p>
      </div>

      <div style="margin-bottom: 5px" class="top-history-info">
        <p>Total Items:</p>
        <p>{{ getPotTotalSkins() }}/100</p>
      </div>

      <div style="margin-bottom: 5px" class="top-history-info">
        <p>Percentage:</p>
        <p>{{ getWinnerPercentage() }}%</p>
      </div>

    </div>
  </Transition>
</template>

<script>
export default {
  props: { topGame: Object },
  methods: {
    getWinnerPicture() {
      const winner = this.topGame.Players.find(
        (player) => (player.steamID = this.topGame.Winner)
      );
      console.log(winner);
      return winner.userPicture;
    },
    getPotTotalSkins() {
      let totalItems = 0;
      this.topGame.Players.forEach((player) => {
        totalItems += player.skins.length;
      });
      return totalItems;
    },
    getWinnerPercentage() {
      let winnerValue = 0;
      this.topGame.Players.forEach((player) => {
        if (player.steamID == this.topGame.Winner) {
          player.skins.forEach((skin) => {
            winnerValue += skin.value;
          });
        }
      });
      return ((winnerValue / this.topGame.TotalPotValue) * 100).toFixed(2);
    },
  },
  name: "CFHistoryTop",
};
</script>

<style>
#cf-history-top {
  margin: 0 0 10px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.top-history-img {
  width: 100px;
  height: 100px;
  border-radius: 10px;
}
</style>