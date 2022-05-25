<template>
  <div id="cf-top-container">
    <div id="coin-choice" class="primary-color default-cell accent-color">
      <button
        v-if="redSideChosen"
        style="
          background: rgba(236, 31, 39, 1);
          border: 2px solid rgba(255, 255, 255, 0.5);
        "
        id="red-button-side"
        class="button-flex"
        @click="chooseSide('red')"
      >
        <h3 class="choice-button-text">Red</h3>
        <p class="choice-button-percent-text">{{ redPercent }}%</p>
      </button>

      <button
        v-else
        id="red-button-side"
        class="button-flex"
        @click="chooseSide('red')"
      >
        <h3 class="choice-button-text">Red</h3>
        <p class="choice-button-percent-text">{{ redPercent }}%</p>
      </button>

      <div id="cf-deposit-container">
        <h3>Choose a Side</h3>
        <button
          id="cf-deposit-button"
          class="secondary-color default-secondary-cell accent-color"
          @click="openDepositMenu"
        >
          Deposit
        </button>
      </div>

      <button
        v-if="blackSideChosen"
        style="
          background: rgba(32, 29, 30, 1);
          border: 2px solid rgba(255, 255, 255, 0.5);
        "
        id="black-button-side"
        class="button-flex"
        @click="chooseSide('black')"
      >
        <h3 class="choice-button-text">Black</h3>
        <p class="choice-button-percent-text">{{ blackPercent }}%</p>
      </button>

      <button
        v-else
        id="black-button-side"
        class="button-flex"
        @click="chooseSide('black')"
      >
        <h3 class="choice-button-text">Black</h3>
        <p class="choice-button-percent-text">{{ blackPercent }}%</p>
      </button>
    </div>

    <div id="percent-bar">
      <div ref="redBar" id="red-bar" class="percent-action">
        <p style="margin: 0 0 0 10px" class="percent-bar-text">
          Red - {{ redPercent }}%
        </p>
      </div>
      <div ref="blackBar" id="black-bar" class="percent-action">
        <p style="margin: 0 10px 0 0" class="percent-bar-text">
          {{ blackPercent }}% - Black
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { io } from "socket.io-client";

const env = process.env.NODE_ENV;
let socket;
if (env == "development") {
  socket = io("http://localhost:4000");
} else {
  socket = io(window.location.origin);
}

export default {
  data() {
    return {
      minPrice: 1.0,
      maxPrice: 0,
      pastWinningSides: [],
      redPercent: 50.0,
      blackPercent: 50.0,
    };
  },
  computed: {
    redSideChosen() {
      return this.$store.state.coinflip.chosenSide == "red";
    },
    blackSideChosen() {
      return this.$store.state.coinflip.chosenSide == "black";
    },
  },
  methods: {
    chooseSide(side) {
      this.$store.dispatch("setCoinSide", side);
    },
    openDepositMenu() {
      const store = this.$store;
      const side = store.state.coinflip.chosenSide;

      if (side == "red" || side == "black") {
        store.dispatch("setDepositMin", this.minPrice);
        store.dispatch("setDepositMax", this.maxPrice);
        store.dispatch("isVisibleToggle");
        store.dispatch("setDepositType", "Coinflip");
      }
    },
    setRedPercent(sidesArray) {
      const redSides = sidesArray.filter((side) => side == "red");
      this.redPercent = ((redSides.length / sidesArray.length) * 100).toFixed(
        2
      );
      const per = this.redPercent + "%";
      this.$refs.redBar.style.width = per;
    },
    setBlackPercent(sidesArray) {
      const blackSides = sidesArray.filter((side) => side == "black");
      this.blackPercent = (
        (blackSides.length / sidesArray.length) *
        100
      ).toFixed(2);
      const per = this.blackPercent + "%";
      this.$refs.blackBar.style.width = per;
    },
  },
  beforeCreate() {
    axios
      .post("/api/coinflip/past-sides")
      .then((res) => {
        console.log(res.data);
        this.setRedPercent(res.data.past);
        this.setBlackPercent(res.data.past);
        this.pastWinningSides = res.data.past;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  mounted() {
    socket.on("pastCFSides", (data) => {
      this.setRedPercent(data.past);
      this.setBlackPercent(data.past);
      this.pastWinningSides = data.past;
    });
  },
  name: "CoinFlipChoice",
};
</script>

<style>
/* Main Container */
#cf-top-container {
  display: inline-flex;
  margin-top: 20px;
  height: 150px;
  width: calc(100% - (20px + 350px));
  justify-content: center;
  align-items: center;
  flex-direction: column;
  float: left;
}

/* Coin Choice Container */
#coin-choice {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
  width: 100%;
  height: 120px;
  gap: 50px;
}

.button-flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  align-items: center;
}

.button-flex p {
  margin: 0;
}

#red-button-side {
  width: 240px;
  height: 80px;
  background: rgba(236, 31, 39, 0.75);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  cursor: pointer;
}

.choice-button-text {
  font-family: Roboto;
  font-style: normal;
  font-weight: 900;
  font-size: 20px;
  line-height: 23px;
  text-align: center;
  color: #ffffff;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  margin: 0;
}

#black-button-side {
  width: 240px;
  height: 80px;
  background: rgba(32, 29, 30, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  cursor: pointer;
}

.choice-button-percent-text {
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  text-align: center;
  color: #ffffff;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
}

#cf-deposit-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#cf-deposit-container h3 {
  font-family: Roboto;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 5px 0;
}

#cf-deposit-button {
  width: 180px;
  height: 60px;
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 21px;
  text-align: center;
  color: #ffffff;
  cursor: pointer;
}

/* Percent Bar Container*/
#percent-bar {
  justify-content: center;
  margin-top: 0;
  display: inline-flex;
  flex-direction: row;
  width: calc(100% - 30px);
}

#red-bar {
  height: 30px;
  width: 50%;
  background: rgba(236, 31, 39, 0.75);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
  border-radius: 0px 0px 0px 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

#black-bar {
  height: 30px;
  width: 50%;
  background: rgba(32, 29, 30, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
  border-radius: 0px 0px 10px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.percent-bar-text {
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  line-height: 14px;
  color: #ffffff;
}

.percent-action {
  transition: all 0.5s;
}
</style>
