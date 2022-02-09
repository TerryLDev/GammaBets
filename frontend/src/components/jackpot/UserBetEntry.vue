<template>
  <div id="default-player-bet" class="player-bet">
    <img class="player-bet-profile-img" :src="player.userPicture" />
<!--
    <div v-if="player.skinPictures.length > 9" v-for="({skinPic}, index)in player.skinPictures" class="player-bet-skins">
      <img class="player-skin-img" :src="skinPic" />
      <p>+{{player.skinPictures.length}}</p>
    </div>
-->
    <div class="player-bet-val-and-name">
      <h5>$value percent%</h5>
      <h6>Username</h6>
    </div>
  </div>
</template>

<script>
export default {
  props: {player: {type: Object}},
  methods: {
    getPlayerPercent() {

    },
    getPlayerValue(playerValues) {
      let totalVal = 0

      playerValues.forEach(val => {
        totalVal += val
      });

      return totalVal;
    }
  },
  name: "UserBetEntry",
};
</script>

<style>
.player-bet {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 90px;
  justify-content: center;
  align-items: center;
  border: 2px solid rgba(229, 239, 172, 0.5);
  box-sizing: border-box;
  border-radius: 10px;
}

.player-bet-profile-img {
  width: 70px;
  height: 70px;
  box-sizing: border-box;
  border-radius: 10px;
  margin-left: 10px;
  margin-right: auto;
}

.user-bet-border {
  border: 2px solid rgba(236, 31, 39, 0.5);
}

.player-bet-skins {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  margin-right: auto;
}

.player-skin-img {
  width: 44px;
  height: 44px;
}

.player-bet-skins p {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.player-bet-val-and-name {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  margin-right: 10px;
  margin-left: auto;
}

.player-bet-val-and-name h5 {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.player-bet-val-and-name h6 {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  color: #ffffff;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
  margin: 0;
}

/* Backgounds for player bets */
.top-player-bet {
  background: rgba(212, 175, 55, 0.5);
}

.first-player-bet {
  background: rgba(255, 255, 255, 0.5);
}

.second-player-bet {
  background: rgba(255, 255, 255, 0.4);
}

.third-player-bet {
  background: rgba(255, 255, 255, 0.3);
}

.fourth-player-bet {
  background: rgba(255, 255, 255, 0.2);
}

.fifth-player-bet {
  background: rgba(255, 255, 255, 0.1);
}
</style>
