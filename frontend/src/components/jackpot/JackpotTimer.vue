<template>
  <div id="spinner-area" class="primary-color default-cell accent-color">
    <div class="top-spinner-area">
      <div
        id="jp-total-amount"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 id="jp-total-amount-text" class="top-spinner-area-h">
          ${{ totalPotValue.toFixed(2) }}
        </h2>
        <p class="top-spinner-area-t">Total Amount:</p>
      </div>
      <!-- If anyone is ready this, this timer was a pain in the ass to make -->
      <div id="jp-timer">
        <div class="jp-timer-border"></div>
        <svg
          id="svg-circle"
          width="100"
          height="100"
          style="transform: rotate(-90deg) scaleY(-1)"
        >
          <circle
            ref="jpTimerCircle"
            id="jp-timer-circle"
            cx="50"
            cy="50"
            r="45"
            stroke="white"
            stroke-width="9"
            stroke-dasharray="283"
            stroke-offset="283"
            fill="none"
          />
        </svg>
        <p id="jp-current-time">{{ timerText }}</p>
      </div>
      <div
        id="jp-total-item"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 class="top-spinner-area-h">{{ itemTotal }}/100</h2>
        <p class="top-spinner-area-t">Total Items:</p>
      </div>
    </div>
    <Transition name="timer-trans" mode="out-in">
      <WinnerCard
        v-if="showWinner"
        :winnerName="winnerName"
        :winnerPic="winnerPic"
        :winnerTotal="winnerTotal"
        :winnerPercent="winnerPercent"
      />
      <button
        v-else-if="imagesloaded == false"
        id="jp-deposit"
        class="secondary-color default-secondary-cell accent-color"
        @click="openDepositMenu"
      >
        Deposit
      </button>

      <div v-else-if="imagesloaded" id="spinner-div">
        <div id="spinner-block">
          <div ref="spinnerImageHolder" id="spinner-image-holder">
            <SpinnerPlayerImage
              v-for="img in playerImgList"
              :key="img"
              :imgSrc="img"
            />
          </div>
        </div>
        <div id="spinner-line"></div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, watch, ref } from "vue";
import SpinnerPlayerImage from "./SpinnerPlayerImage.vue";
import WinnerCard from "./WinnerCard.vue";

export default {
  props: {
    totalPotValue: Number,
    depositType: String,
    depositMin: Number,
    depositMax: Number,
  },
  setup(props) {
    const store = useStore();

    // Refs
    const jpTimerCircle = ref();

    // The total number of items in the pot
    const itemTotal = computed(() => {
      let items;
      if (props.depositType == "High Stakes") {
        items = store.getters.getHighStakesTotalItems;
      } else if (props.depositType == "Low Stakes") {
        items = store.getters.getLowStakesTotalItems;
      }
      return items;
    });

    // The Timer for the pot
    const timerText = computed(() => {
      let time;
      if (props.depositType == "High Stakes") {
        time = store.getters.getHighStakesTime;
      } else if (props.depositType == "Low Stakes") {
        time = store.getters.getLowStakesTime;
      }
      return time;
    });

    // Watching for the time to change and updating the circle accordingly
    watch(timerText, (newValue) => {
      const circleStrokeDashoffset = 283 - (newValue * 283) / 120;
      jpTimerCircle.value.style.strokeDashoffset = circleStrokeDashoffset;
    });

    return {
      itemTotal,
      timerText,
      jpTimerCircle,
    };
  },
  data() {
    return {
      playerImgList: [],
      imagesloaded: false,
      showWinner: false,
      winnerPercent: 0,
      winnerTotal: 0,
      winnerName: "",
      winnerPic: "",
    };
  },
  computed: {
    ifReadyToSpin() {
      let readySpin = false;
      if (this.depositType == "High Stakes") {
        readySpin = this.$store.getters.getHighStakesSpinnerStatus;
      } else if (this.depositType == "Low Stakes") {
        readySpin = this.$store.getters.getLowStakesSpinnerStatus;
      }
      return readySpin;
    },
    potWinner() {
      let winner = "";
      if (this.depositType == "High Stakes") {
        winner = this.$store.getters.getHighStakesWinner;
      } else if (this.depositType == "Low Stakes") {
        winner = this.$store.getters.getLowStakesWinner;
      }
      return winner;
    },
  },
  methods: {
    getWinnerInfo(winnerID, allPlayers) {
      const winnerObject = allPlayers.find(
        (player) => player.steamID == winnerID
      );
      this.winnerName = winnerObject.username;
      this.winnerPic = winnerObject.userPicture;

      let totalBet = 0;
      allPlayers.forEach((player) => {
        if (player.steamID == winnerID) {
          player.skins.forEach((skin) => {
            totalBet += skin.value;
          });
        }
      });

      this.winnerTotal = totalBet;
      this.winnerPercent = (totalBet / this.totalPotValue) * 100;
    },
    getNegativeRandomInt(min, max) {
      return Math.abs(Math.floor(Math.random() * (max - min + 1)) + min) * -1;
    },
    getPlayerTotalValuePercentage(potTotal, player) {
      let total = 0;
      player.skins.forEach((skin) => {
        total += skin.value;
      });
      return Math.floor((total / potTotal) * 100);
    },
    openDepositMenu() {
      const store = this.$store;

      store.dispatch("setDepositMin", this.depositMin);
      store.dispatch("setDepositMax", this.depositMax);
      store.dispatch("isVisibleToggle");
      store.dispatch("setDepositType", this.depositType);
    },
    generateImages() {
      const store = this.$store;

      let allPlayers;

      if (this.depositType == "High Stakes") {
        allPlayers = store.getters.getHighStakesPlayerBets;
      } else if (this.depositType == "Low Stakes") {
        allPlayers = store.getters.getLowStakesPlayerBets;
      }

      const winnerIndex = allPlayers.findIndex(
        (player) => player.steamID == this.potWinner
      );

      const winnerImg = allPlayers[winnerIndex].userPicture;
      const imageList = [];
      allPlayers.forEach((player) => {
        const playerValPercent = this.getPlayerTotalValuePercentage(
          this.totalPotValue,
          player
        );

        for (let i = 0; i < playerValPercent; i++) {
          imageList.push(player.userPicture);
        }
      });

      for (let i = 0; i < 201; i++) {
        const randomPlayerImg = Math.floor(Math.random() * imageList.length);
        this.playerImgList.push(imageList[randomPlayerImg]);
      }

      this.playerImgList[196] = winnerImg;

      this.imagesloaded = true;

      setTimeout(() => {
        const randomInt = this.getNegativeRandomInt(16167, 16242);
        console.log(randomInt);
        this.$refs.spinnerImageHolder.style.transform = `translateX(${randomInt}px)`;
      }, 1500);

      setTimeout(() => {
        this.getWinnerInfo(this.potWinner, allPlayers);
        this.showWinner = true;
        // Transition to to show the winner and their percentage
      }, 13000);
    },
  },
  watch: {
    ifReadyToSpin(newVal) {
      if (newVal) {
        this.generateImages();
      } else {
        this.imagesloaded = false;
        this.showWinner = false;
      }
    },
  },
  name: "JackpotTimer",
  components: { SpinnerPlayerImage, WinnerCard },
};
</script>

<style>
#spinner-area {
  display: inline-block;
  margin-top: 20px;
  width: calc(100% - (350px + 20px));
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.top-spinner-area {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 30px;
  align-items: center;
}

.top-spinner-area-h {
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
  color: #ffffff;
  margin: 0;
}

.top-spinner-area-t {
  font-family: Roboto;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 21px;
  color: #ffffff;
  margin: 0;
}

#jp-total-amount {
  width: 250px;
  height: 90px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

#jp-total-item {
  width: 250px;
  height: 90px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

#jp-deposit {
  width: 660px;
  height: 90px;
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  line-height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ffffff;
  cursor: pointer;
}

/* Timer */

#jp-timer {
  height: 100px;
  width: 100px;
  display: grid;
  grid-template: 1 fr / 1 fr;
  place-items: center;
}

.jp-timer-border {
  height: 100px;
  width: 100px;
  border: 10px solid rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.25));
  border-radius: 50%;
  grid-area: 1 / 1 / span 1 / span 1;
  justify-content: center;
  align-items: center;
}

#svg-circle {
  grid-area: 1 / 1 / span 1 / span 1;
}

#jp-timer-circle {
  transition: all 1s;
  grid-area: 1 / 1 / span 1 / span 1;
}

#jp-current-time {
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  line-height: 37px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #ffffff;
  grid-area: 1 / 1 / span 1 / span 1;
}

/* Spinner Animation */

#spinner-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

#spinner-block {
  float: left;
  width: 600px;
  height: 82px;
  padding: 0;
  border: black solid 4px;
  border-radius: 10px;
  overflow: hidden;
  white-space: nowrap;
}

#spinner-image-holder {
  width: 16800px;
  height: 82px;
  padding: 0;
  background-color: white;
  transition: all 10s;
  transition-timing-function: cubic-bezier(0.08, 0.88, 0.03, 1);
}

#spinner-line {
  padding: 0px;
  margin: 0px;
  height: 82px;
  border-right: 3px solid green;
  border-radius: 10px;
  position: absolute;
}

.timer-trans-enter-from,
.timer-trans-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.timer-trans-enter-to {
  opacity: 1;
}

.timer-trans-leave-active,
.timer-trans-enter-active {
  transition: all 1s;
}
</style>
