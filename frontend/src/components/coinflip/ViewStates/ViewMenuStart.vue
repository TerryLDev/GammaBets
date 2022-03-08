<template>
  <div class="top-view">
    <div class="player-one-view">
      <img
        class="profile-img-view"
        :class="{
          'red-border-img-view': game.game.playerOneSide == 'red',
          'black-border-img-view': game.game.playerOneSide == 'black',
        }"
        :src="game.game.playerOne.userPicture"
      />
      <div class="username-container-view">
        <p>{{ game.game.playerOne.username }}</p>
      </div>
      <div class="val-items-container-view">
        <div class="val-container-view">
          <p>${{ playerOneTotalVal(game.game) }}</p>
        </div>
        <div class="item-container-view">
          <p>{{ game.game.playerOne.skins.length }}/20</p>
        </div>
      </div>
    </div>

    <div class="coin-section-view">
      <img
        class="coin-img-view"
        v-bind:src="defaultCoin(game.game.playerOneSide)"
      />
      <div :key="game.timer">
        <p>{{game.timer}}</p>
      </div>
    </div>

    <div class="player-two-view">
      <img
        class="profile-img-view"
        :class="{
          'red-border-img-view': game.game.playerTwoSide == 'red',
          'black-border-img-view': game.game.playerTwoSide == 'black',
        }"
        src="@/assets/user/defaultProfile.png"
      />
      <div class="username-container-view">
        <p>Player Two</p>
      </div>
      <div style="align-self: end" class="val-items-container-view">
        <div class="item-container-view">
          <p>0/20</p>
        </div>
        <div class="val-container-view">
          <p>$0.00</p>
        </div>
      </div>
    </div>
  </div>

  <div class="line-view"></div>

  <div class="bottom-view">
    <div
      class="player-skins-view"
      :class="{
        'red-skins-background-view': game.game.playerOneSide == 'red',
        'black-skins-background-view': game.game.playerOneSide == 'black',
      }"
    >
      <div
        class="skin-slot-view"
        v-for="(skinPic, index) in game.game.playerOne.skinPictures"
        v-bind:key="skinPic"
      >
        <img :src="skinPic" />
        <p>${{ getSkinValue(game.game.playerOne.skinValues[index]) }}</p>
      </div>
    </div>
    <div
      class="player-skins-view"
      :class="{
        'red-skins-background-view': game.game.playerTwoSide == 'red',
        'black-skins-background-view': game.game.playerTwoSide == 'black',
      }"
    >
      <div
        class="skin-slot-view"
        v-for="(skinPic, index) in game.game.playerTwo.skinPictures"
        v-bind:key="skinPic"
      >
        <img :src="skinPic" />
        <p>${{ getSkinValue(game.game.playerTwo.skinValues[index]) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
  },
  computed: {
    game() {
      return this.$store.getters.getChosenGame;
    },
  },
  methods: {
    getSkinValue(skinVal) {
      return skinVal.toFixed(2);
    },
    defaultCoin(side) {
      const black = require("@/assets/blackchip.png");
      const red = require("@/assets/RedChip.png");

      if (side == "red") {
        return red;
      } else {
        return black;
      }
    },
    playerOneTotalVal(game){
      let total = 0;
      game.playerOne.skinValues.forEach(val => total += val);
      return total.toFixed(2);
    }
  },
  name: "ViewMenuStart"
}
</script>

<style>

</style>