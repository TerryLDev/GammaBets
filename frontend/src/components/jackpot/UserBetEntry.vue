<template>
  <Transition name="fade-user-bet">
    <div
      class="player-bet"
      v-bind:class="getUserBetClass(player)"
      v-if="player && renderBet"
    >
      <img class="player-bet-profile-img" :src="player.userPicture" />

      <div v-if="player.skins.length > 9" class="player-bet-skins">
        <template v-for="(skin, index) in player.skins" :key="skin">
          <img v-if="index < 9" class="player-skin-img" :src="skin.imageURL" />
        </template>

        <p>+{{ player.skins.length - 9 }}</p>
      </div>

      <div v-else class="player-bet-skins">
        <div
          style="
            margin: 0;
            padding: 0;
            position: relative;
            vertical-align: middel;
          "
          v-for="skin in player.skins"
          :key="skin"
        >
          <img
            @mouseover="visibleSkinID = skin.id"
            @mouseleave="visibleSkinID = ''"
            class="player-skin-img"
            :src="skin.imageURL"
          />
          <Transition name="showSkinInfo">
            <div
              class="skinInfo"
              :class="getUserBetClass(player)"
              v-if="visibleSkinID == skin.id"
            >
              <p>{{ skin.name }}</p>
              <p>${{ skin.value.toFixed(2) }}</p>
            </div>
          </Transition>
        </div>
      </div>

      <div class="player-bet-val-and-name">
        <h5>
          ${{ playerValue(player.skins) }} {{ getPlayerPercent(player) }}%
        </h5>
        <h6>{{ player.username }}</h6>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  props: { player: Object },
  data() {
    return {
      renderBet: false,
      visibleSkinID: "",
    };
  },
  methods: {
    playerValue(playerSkins) {
      let totalVal = 0;

      playerSkins.forEach((skin) => {
        totalVal += skin.value;
      });

      return totalVal.toFixed(2);
    },
    getPlayerPercent(player) {
      const total = this.$store.getters.getHighStakesTotalValue;

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
  mounted() {
    this.renderBet = true;
  },
  name: "UserBetEntry",
};
</script>

<style>
.fade-user-bet-enter-from,
.fade-user-bet-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.fade-user-bet-enter-to {
  opacity: 1;
}

.fade-user-bet-leave-active,
.fade-user-bet-enter-active {
  transition: all 1s;
}

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
.skinInfo {
  position: absolute;
  padding: 5px;
  margin: 0px;
  border-radius: 5px;
  right: -29px;
  bottom: 50px;
  width: 90px;
  text-align: center;
  border-radius: 5px;
  border: 1px solid rgba(14, 14, 14, 0.9);
}

.skinInfo p {
  font-family: Montserrat;
  font-weight: 600;
  padding: 0px;
  margin: 0px;
  font-size: 10px;
  color: rgb(0, 0, 0);
}
</style>
