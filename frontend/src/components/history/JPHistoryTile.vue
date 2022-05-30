<template>
  <div class="history-tile">
    <img :src="getWinnerPicture()" alt="Winner's Steam Picture" />

    <div class="history-tile-left">
      <div class="history-tile-info">
        <p>Total Value:</p>
        <p>${{ historyObject.TotalPotValue.toFixed(2) }}</p>
      </div>

      <div class="history-tile-info">
        <p>Total Items:</p>
        <p>{{ getPotTotalSkins() }}/100</p>
      </div>

      <div class="history-tile-info">
        <p>Percentage:</p>
        <p>{{ getWinnerPercentage() }}%</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { historyObject: Object },
  mounted() {
    console.log(this.historyObject);
  },
  methods: {
    getWinnerPicture() {
      const winner = this.historyObject.Players.find(
        (player) => (player.steamID = this.historyObject.Winner)
      );
      return winner.userPicture;
    },
    getPotTotalSkins() {
      let totalItems = 0;
      this.historyObject.Players.forEach((player) => {
        totalItems += player.skins.length;
      });
      return totalItems;
    },
    getWinnerPercentage() {
      let winnerValue = 0;
      this.historyObject.Players.forEach((player) => {
        if (player.steamID == this.historyObject.Winner) {
          player.skins.forEach((skin) => {
            winnerValue += skin.value;
          });
        }
      });
      return ((winnerValue / this.historyObject.TotalPotValue) * 100).toFixed(
        2
      );
    },
  },
  name: "JPHistoryTile",
};
</script>

<style>
.history-tile {
  display: grid;
  width: 100%;
  grid-template: 75px / 75px 1fr;
  grid-template-rows: 75px;
  margin-bottom: 10px;
}

.history-tile img {
  margin: 0;
  width: 75px;
  height: 75px;
  border-radius: 10px;
  grid-area: 1 / 1 / span 1 / span 1;
}

.history-tile-left {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding-left: 10px;
}

.history-tile-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  width: 100%;
}

.history-tile-info p {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 14px;
  color: #fff;
  margin: 0;
}
</style>
