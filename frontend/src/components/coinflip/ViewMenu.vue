<template>
  <div class="view-menu primary-color-popup popup-cell">
    <div class="top-view">
      <div class="player-one-view">
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.playerOneSide == 'red',
            'black-border-img-view': game.playerOneSide == 'black',
          }"
          :src="game.playerOne.userPicture"
        />
        <div class="username-container-view">
          <p>{{ game.playerOne.username }}</p>
        </div>
        <div class="val-items-container-view">
          <div class="val-container-view">
            <p>${{ playerOneTotalVal }}</p>
          </div>
          <div class="item-container-view">
            <p>{{ game.playerOne.skins.length }}/20</p>
          </div>
        </div>
      </div>

      <div class="coin-section-view">
        <img
          class="coin-img-view"
          v-if="game.winner == 'none'"
          v-bind:src="defaultCoin"
        />
        <img v-else alt="should show winner animation" />
        <!-- /\ COIN IMAGE /\ | \/ TIMER/COUNT DOWN \/ -->
        <p v-if="game.secondPlayerJoining == false">Waiting for Player...</p>
        <p
          v-else-if="
            game.secondPlayerJoining && game.playerTwoTradeState == 'Active'
          "
        >
          Time Left: {{ timerObj.defaultTimer }}s
        </p>
        <p v-else-if="game.waitingToFlip">
          Flipping in: {{ timerObj.flippingTimer }}s
        </p>
        <p v-else>Winner: {{ game.winner }}</p>
      </div>

      <div class="player-two-view" v-if="game.secondPlayerJoining == false">
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.playerTwoSide == 'red',
            'black-border-img-view': game.playerTwoSide == 'black',
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

      <div
        class="player-two-view"
        v-else-if="
          game.secondPlayerJoining && game.playerTwoTradeState == 'Active'
        "
      >
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.playerTwoSide == 'red',
            'black-border-img-view': game.playerTwoSide == 'black',
          }"
          :src="game.playerTwo.userPicture"
        />
        <div class="username-container-view">
          <p>{{ game.playerTwo.username }}o</p>
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

      <div class="player-two-view" v-else>
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.playerTwoSide == 'red',
            'black-border-img-view': game.playerTwoSide == 'black',
          }"
          :src="game.playerTwo.userPicture"
        />
        <div class="username-container-view">
          <p>{{ game.playerTwo.username }}o</p>
        </div>
        <div style="align-self: end" class="val-items-container-view">
          <div class="item-container-view">
            <p>{{ game.playerTwo.skins.length }}/20</p>
          </div>
          <div class="val-container-view">
            <p>{{ playerTwoTotalVal }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="line-view"></div>

    <div class="bottom-view">
      <div
        class="player-skins-view"
        :class="{
          'red-skins-background-view': pOneSide == 'red',
          'black-skins-background-view': pOneSide == 'black',
        }"
      >
        <div class="skin-slot-view" v-for="(skinPic, index) in game.playerOne.skinPictures" v-bind:key="skinPic">
          <img :src="skinPic">
          <p>${{getSkinValue(game.playerOne.skinValues[index])}}</p>
        </div>
      </div>
      <div
        class="player-skins-view"
        :class="{
          'red-skins-background-view': pTwoSide == 'red',
          'black-skins-background-view': pTwoSide == 'black',
        }"
      >
        <div class="skin-slot-view" v-for="(skinPic, index) in game.playerTwo.skinPictures" v-bind:key="skinPic">
          <img :src="skinPic">
          <p>${{getSkinValue(game.playerTwo.skinValues[index])}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  setup() {
    const store = useStore();

    const game = computed(() => store.state.coinflip.viewMenu.chosenGame);

    const timerObj = computed(() =>
      store.getters.getGameTimerObjectByGameID(game.value.gameID)
    );

    const defaultCoin = computed(() => {
      const black = require("@/assets/blackchip.png");
      const red = require("@/assets/RedChip.png");

      if (game.value.playerOneSide == "red") {
        return red;
      } else {
        return black;
      }
    });

    const playerOneTotalVal = computed(() =>
      store.getters.getPlayerOneTotalValue(game.value.gameID).toFixed(2)
    );
    const playerTwoTotalVal = computed(() =>
      store.getters.getPlayerTwoTotalValue(game.value.gameID).toFixed(2)
    );

    const pOneSide = computed(() => game.value.playerOneSide);
    const pTwoSide = computed(() => game.value.playerTwoSide);

    console.log(game.value)

    return {
      game,
      timerObj,
      defaultCoin,
      playerOneTotalVal,
      playerTwoTotalVal,
      pOneSide,
      pTwoSide,
    };
  },
  methods: {
    getSkinValue(skinVal) {
      return (skinVal).toFixed(2);
    }
  },
  name: "ViewMenu",
};
</script>

<style>
.view-menu {
  position: fixed;
  width: 700px;
  height: 660px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  outline-color: rgba(229, 239, 172, 0.2);
  outline-style: solid;
  outline-width: 2px;
}

.top-view {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.player-one-view {
  display: flex;
  flex-direction: column;
  margin: 20px 0px 0px 10px;
}

.player-two-view {
  display: flex;
  flex-direction: column;
  margin: 20px 10px 0px 0px;
}

.profile-img-view {
  width: 120px;
  height: 120px;
  border-radius: 15px;
  align-self: center;
}

/* Border For Profile Image */
.red-border-img-view {
  border: 4px solid rgba(236, 31, 39, 0.5);
}

.black-border-img-view {
  border: 4px solid rgba(32, 29, 30, 0.75);
}

.username-container-view {
  width: 200px;
  height: 30px;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(229, 239, 172, 0.5);
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.username-container-view p {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  color: #ffffff;
  text-shadow: -2px 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.coin-section-view {
  margin-top: 12px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  color: #FFFFFF;
  text-shadow: -2px 2px 4px rgba(0, 0, 0, 0.5);
}

.coin-img-view {
  width: 135px;
  height: 135px;
}

.val-items-container-view {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-top: 5px;
}

.val-container-view {
  width: 100px;
  height: 30px;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(229, 239, 172, 0.5);
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.val-container-view p {
  font-family: Roboto;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
  text-shadow: -2px 2px 4px rgba(0, 0, 0, 0.5);
}

.item-container-view {
  width: 60px;
  height: 30px;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(229, 239, 172, 0.5);
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-container-view p {
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  text-shadow: -2px 2px 4px rgba(0, 0, 0, 0.5);
}

.line-view {
  margin-top: 20px;
  width: 100%;
  border-top: solid 2px rgba(229, 239, 172, 0.1);
}

.bottom-view {
  margin: 10px;
  position: relative;
  width: 680px;
  height: 385px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  gap: 20px;
}

.player-skins-view {
  height: 100%;
  width: 330px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 10px;
  overflow-y: scroll;
}

.player-skins-view::-webkit-scrollbar {
  display: none;
}

.red-skins-background-view {
  background: rgba(236, 31, 39, 0.5);
  border: 2px solid #ec1f27;
  box-sizing: border-box;
  border-radius: 10px;
}

.black-skins-background-view {
  background: rgba(32, 29, 30, 0.6);
  border: 2px solid #201d1e;
  box-sizing: border-box;
  border-radius: 10px;
}

.skin-slot-view {
  display: flex;
  flex-direction: column;
  margin: 0;
  align-items: center;
}

.skin-slot-view img {
  width: 100px;
  height: 100px;
  margin: 0;
}

.skin-slot-view p {
  margin: 0;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
}

</style>
