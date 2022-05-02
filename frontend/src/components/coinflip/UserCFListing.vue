<template>
  <div class="coinflip-listing" v-bind:class="playerOneSide(game)">
    <div class="listing-profile-div">
      <img class="listing-profile-div-img" :src="game.playerOne.userPicture" />
      <div class="listing-profile-div-user-and-val">
        <p>{{ game.playerOne.username }}</p>
        <p>${{ playerValue(game.playerOne.skinValues) }}</p>
      </div>
    </div>

    <div
      class="listing-player-skins"
      v-if="game.playerOne.skinPictures.length > 5"
    >
      <template
        v-for="(skinPic, index) in game.playerOne.skinPictures"
        :key="skinPic"
      >
        <img v-if="index < 5" :src="skinPic" />
      </template>
      <p>+{{ game.playerOne.skinPictures.length - 5 }}</p>
    </div>

    <div v-else class="listing-player-skins">
      <img
        v-for="skinPic in game.playerOne.skinPictures"
        :key="skinPic"
        :src="skinPic"
      />
    </div>
    <CFListingButtons :phase="phase(game.gameID)" :game="game" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CFListingButtons from "../widgets/CFListingButtons.vue";

export default {
  props: { game: Object },
  data() {
    return {
      depositType: "Coinflip",
      showDepositMenuVisible: false,
    };
  },
  computed: mapGetters({ phase: "getGamePhase" }),
  methods: {
    playerOneSide(game) {
      if (game.playerOneSide == "red") {
        return "red-listing";
      } else {
        return "black-listing";
      }
    },
    playerValue(playerSkinVals) {
      let totalVal = 0;
      playerSkinVals.forEach((val) => (totalVal += val));
      return totalVal.toFixed(2);
    },
    buttonClass(playerSide) {
      if (playerSide == "red") {
        return "red-listing-button";
      } else {
        return "black-listing-button";
      }
    },
    openDepositMenu() {
      const store = this.$store;

      let min = this.playerValue(this.game.playerOne.skinValues) * 0.95;
      let max = this.playerValue(this.game.playerOne.skinValues) * 1.05;

      store.dispatch("setDepositMin", min);
      store.dispatch("setDepositMax", max);
      store.dispatch("setSelectedGameID", this.game.gameID);
      store.dispatch("isVisibleToggle");
      store.dispatch("setDepositType", "Coinflip");
    },
    openViewMenu() {
      console.log(this.game);
      this.$store.dispatch("toggleViewMenu");
      this.$store.dispatch("setChosenView", this.game.gameID);
    },
  },
  components: { CFListingButtons },
  name: "UserCFListing",
};
</script>

<style>
.coinflip-listing {
  width: 100%;
  height: 90px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-sizing: border-box;
  border-radius: 10px;
  display: inline-grid;
  grid-template: auto / 1fr auto 1fr;
  padding: 10px;
  align-items: center;
}

.red-listing {
  background: rgba(236, 31, 39, 0.35);
}

.black-listing {
  background: rgba(32, 29, 30, 0.6);
}

.listing-profile-div {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.listing-profile-div-img {
  width: 70px;
  height: 70px;
  border-radius: 10px;
}

.listing-profile-div-user-and-val {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 16px;
  color: #ffffff;
}

.listing-profile-div-user-and-val p {
  margin: 0;
}

.listing-player-skins {
  display: inline-flex;
  text-align: center;
  flex-direction: row;
  align-items: center;

  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 26px;
  color: rgba(255, 255, 255, 0.5);
}

.listing-player-skins img {
  width: 45px;
  height: 45px;
}

.listing-buttons-div {
  margin: auto 0 auto auto;
}

.listing-button {
  width: 60px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  border-radius: 5px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 14px;
  color: #ffffff;
  margin-left: 15px;
  cursor: pointer;
}

.red-listing-button {
  background: rgba(236, 31, 39, 0.75);
}

.black-listing-button {
  background: rgba(32, 29, 30, 0.85);
}
</style>
