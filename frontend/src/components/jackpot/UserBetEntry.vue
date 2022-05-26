<template>
  <div class="player-bet" v-bind:class="getUserBetClass(player)" v-if="player">
    <img class="player-bet-profile-img" :src="player.userPicture" />

    <div v-if="player.skins.length > 9" class="player-bet-skins">
      <template v-for="(skin, index) in player.skins" :key="skin">
        <img v-if="index < 9" class="player-skin-img" :src="skin.imageURL" />
      </template>

      <p>+{{ player.skinPictures.length - 9 }}</p>
    </div>

    <div v-else class="player-bet-skins">
      <template v-for="skin in player.skins" :key="skin">
        <img class="player-skin-img" :src="skin.imageURL" />
      </template>
    </div>

    <div class="player-bet-val-and-name">
      <h5>${{ playerValue(player.skins) }} {{ getPlayerPercent(player) }}%</h5>
      <h6>{{ player.username }}</h6>
    </div>
  </div>
</template>

<script>
export default {
  props: { player: Object },
  methods: {
    playerValue(playerSkins) {
      let totalVal = 0;

      playerSkins.forEach((skin) => {
        totalVal += skin.value;
      });

      return totalVal.toFixed(2);
    },
    getPlayerPercent(player) {
      const total = this.$store.state.highStakes.game.TotalPotValue;

      let percent = ((this.playerValue(player.skins) / total) * 100).toFixed(2);

      return percent;
    },
    getUserBetClass(player) {
      let percent = this.getPlayerPercent(player);

      if (percent > 50) {
        return "top-player-bet";
      } else if (percent > 40) {
        return "first-player-bet";
      } else if (percent > 30) {
        return "second-player-bet";
      } else if (percent > 20) {
        return "third-player-bet";
      } else if (percent > 10) {
        return "fourth-player-bet";
      } else {
        return "fifth-player-bet";
      }
    },
  },
  name: "UserBetEntry",
};
</script>

<style>
.player-bet {
  display: grid;
  grid-template: auto / 1fr auto 1fr;
  width: 100%;
  height: 90px;
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
  text-align: center;
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
