<template>
  <div class="listing-buttons-div">
      <button
        v-if="game.playerOne.userSteamId != userSteamID && phase == 0"
        class="listing-button"
        :class="buttonClass(game.playerOneSide)"
        @click="openDepositMenu"
      >
        Join
      </button>
      <button
        class="listing-button"
        :class="buttonClass(game.playerOneSide)"
        @click="openViewMenu"
      >
        View
      </button>
    </div>
</template>

<script>
export default {
  props: {game: Object, phase: Number},
  methods: {
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
}
</script>

<style>

</style>