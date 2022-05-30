<template>
  <div
    :style="{ display: showDisplay }"
    class="view-menu primary-color-popup popup-cell"
  >
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
            <p>${{ playerTotalVal(game.game.playerOne.skins) }}</p>
          </div>
          <div class="item-container-view">
            <p>{{ game.game.playerOne.skins.length }}/20</p>
          </div>
        </div>
      </div>

      <div ref="coinSection" class="start coin-section-view">
        <img ref="coinImg" class="start coin-img-view" :src="dataCoinImg" />
        <p ref="coinSectionText" class="start">
          Flipping In: {{ defaultTimer }}s
        </p>
      </div>

      <div class="player-two-view">
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.game.playerTwoSide == 'red',
            'black-border-img-view': game.game.playerTwoSide == 'black',
          }"
          :src="game.game.playerTwo.userPicture"
        />
        <div class="username-container-view">
          <p>{{ game.game.playerTwo.username }}</p>
        </div>
        <div style="align-self: end" class="val-items-container-view">
          <div class="item-container-view">
            <p>{{ game.game.playerTwo.skins.length }}/20</p>
          </div>
          <div class="val-container-view">
            <p>${{ playerTotalVal(game.game.playerTwo.skins) }}</p>
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
          v-for="skin in game.game.playerOne.skins"
          v-bind:key="skin"
        >
          <img :src="skin.imageURL" />
          <p>${{ skin.value.toFixed(2) }}</p>
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
          v-for="skin in game.game.playerTwo.skins"
          v-bind:key="skin"
        >
          <img :src="skin.imageURL" />
          <p>${{ skin.value.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
// Steps
// 1 fade away middle coin icon
// 2 display winner gif
// 3 fade to winner coin and show text of winner
export default {
  props: { active: Boolean, gameID: String },
  setup() {
    // Coin Gifs
    const endB1 = require("@/assets/coins/endblack1.gif");
    const endB2 = require("@/assets/coins/endblack2.gif");
    const endB3 = require("@/assets/coins/endblack3.gif");
    const endB4 = require("@/assets/coins/endblack4.gif");

    const endR1 = require("@/assets/coins/endred1.gif");
    const endR2 = require("@/assets/coins/endred2.gif");
    const endR3 = require("@/assets/coins/endred3.gif");
    const endR4 = require("@/assets/coins/endred4.gif");

    // Coin Img
    const blackCoin = require("@/assets/blackchip.png");
    const redCoin = require("@/assets/RedChip.png");

    const store = useStore();

    // Refs
    const coinSection = ref();
    const coinSectionText = ref();
    const coinImg = ref();

    // Winner Stuff
    let winnerSide;
    let winnerText = "Winner: ";

    let dataCoinImg;

    // Coinflipping Gifs
    const blackCoinGifs = [endB1, endB2, endB3, endB4];
    const redCoinGifs = [endR1, endR2, endR3, endR4];

    const game = computed(() => store.getters.getChosenGame);

    function randomCoinFlip(side) {
      const randIndex = Math.floor(Math.random() * 4);

      if (side == "red") {
        return redCoinGifs[randIndex];
      } else {
        return blackCoinGifs[randIndex];
      }
    }

    function defaultCoin() {
      let side = game.value.game.playerOneSide;

      if (side == "red") {
        return redCoin;
      } else {
        return blackCoin;
      }
    }

    if (game.value.game.winner == game.value.game.playerOne.userSteamId) {
      winnerText += game.value.game.playerOne.username;
      winnerSide = game.value.game.playerOneSide;
    } else {
      winnerText += game.value.game.playerTwo.username;
      winnerSide = game.value.game.playerTwoSide;
    }

    dataCoinImg = defaultCoin();

    dataCoinImg = randomCoinFlip(winnerSide);

    /*
    function callAnimate(div) {
      div.value.style.opacity = "0";
    }
    */

    return {
      game,
      coinSection,
      coinSectionText,
      coinImg,
      winnerSide,
      winnerText,
      dataCoinImg,
    };
  },
  data() {
    return {
      showDisplay: "none",
    };
  },
  computed: {
    defaultTimer() {
      return this.$store.getters.getGameFlippingTimer(this.gameID) || 0;
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.active) {
        this.showDisplay = "";
      } else {
        this.showDisplay = "none";
      }
    });
  },
  methods: {
    playerTotalVal(skins) {
      let total = 0;
      skins.forEach((skin) => (total += skin.value));
      return total.toFixed(2);
    },
  },
  name: "ViewMenuWinner",
};
</script>

<style>
.start {
  opacity: 1;
  transition: all 1s;
}
</style>
