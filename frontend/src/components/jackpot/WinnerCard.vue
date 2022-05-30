<template>
  <div
    id="winner-card"
    class="secondary-color default-secondary-cell accent-color"
  >
    <img class="winner-pic" :src="winnerPic" />

    <div class="winner-info">
      <div class="winner-tag">
        <h3>Winner: {{ winnerName }}</h3>
      </div>

      <div class="winner-bets">
        <p>Percentage: {{ winnerPercent.toFixed(2) }}%</p>
        <p>Bet Amount: ${{ winnerTotal.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    winnerPercent: Number,
    winnerName: String,
    winnerPic: String,
    winnerTotal: Number,
  },
  data() {},
  name: "WinnerCard",
};
</script>

<style>
#winner-card {
  display: flex;
  gap: 15px;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  padding: 10px;
}
.winner-pic {
  width: 75px;
  height: 75px;
  border-radius: 10px;
  margin: 0;
  padding: 0;
}
.winner-tag {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0;
}
.winner-tag h3 {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 18px;
  color: white;
  margin: 0;
  padding: 0;
  text-shadow: 1px 2px 4px rgb(0 0 0 / 50%);
}
.winner-info {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin: 0;
}
.winner-bets {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 0;
}
.winner-bets p {
  margin: 0;
  color: white;
  font-family: "Montserrat";
  font-weight: 500;
  text-shadow: 1px 2px 4px rgb(0 0 0 / 50%);
}
</style>
