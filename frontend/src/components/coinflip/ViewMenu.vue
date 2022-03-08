<template>
  <div class="view-menu primary-color-popup popup-cell">
    <ViewMenuStart />
  </div>
</template>

<script>
//import {mapGetters, mapState} from "vuex";
import ViewMenuStart from "./ViewStates/ViewMenuStart.vue";
//import { io } from "socket.io-client";

export default {
  setup() {
    let socket;
    const env = process.env.NODE_ENV;

    if (env == "development") {
      socket = io("http://localhost:4000");
    } else {
      socket = io(window.location.origin);
    }

    socket.on("secondPlayerAccepctedTrade", (data) => {
      
    });

    socket.on("secondPlayerJoiningGame", (data) => {
    });

    socket.on("updateJoiningQueue", (data) => {
    });

  },
  methods: {
    playerOneTotalVal(game){
      let total = 0;
      game.playerOne.skinValues.forEach(val => total += val);
      return total.toFixed(2);
    },
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
  },
  computed: {
    timer() {
      return this.$store.state.coinflip.activeCoinflips[4].timer;
    }
  },
  name: "ViewMenu",
  components: {
    ViewMenuStart,
  }
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
  color: #ffffff;
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
  color: #ffffff;
}
</style>
