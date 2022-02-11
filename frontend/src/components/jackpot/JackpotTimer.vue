<template>
  <div id="spinner-area" class="primary-color default-cell accent-color">
    <div class="top-spinner-area">
      <div
        id="jp-total-amount"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 id="jp-total-amount-text" class="top-spinner-area-h">$0.00</h2>
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
        <p id="jp-current-time">120</p>
      </div>
      <div
        id="jp-total-item"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 class="top-spinner-area-h">
          <span id="jp-total-item-text">0</span>/100
        </h2>
        <p class="top-spinner-area-t">Total Items:</p>
      </div>
    </div>

    <button
      id="jp-deposit"
      class="secondary-color default-secondary-cell accent-color"
      @click="
        showDepositMenuVisible = !showDepositMenuVisible;
        openDeposit();
      "
    >
      Deposit
    </button>
  </div>
  <Transition name="show-deposit">
    <div
      id="deposit-background-layer"
      v-if="showDepositMenuVisible && this.$store.state.user.auth"
      @click="closeMenu"
    >
      <DepositMenu :depositType="depositType" :minPrice="depositMin" :maxPrice="depositMax"/>
    </div>
  </Transition>
</template>

<script>
import { useStore } from "vuex";
import DepositMenu from "../Deposit.vue";

import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default {
  setup() {
    const store = useStore();

    socket.on("getInventory", (data) => {
      console.log(data);
      store.dispatch("addSkins", data);
    });
  },
  data() {
    return {
      showDepositMenuVisible: false,
      depositType: "High Stakes",
      depositMin: 1.00,
      depositMax: 0
    };
  },
  methods: {
    closeMenu(event) {
      if (
        event.path[0] == document.getElementById("deposit-background-layer")
      ) {
        this.showDepositMenuVisible = !this.showDepositMenuVisible;
        this.$store.state.deposit.selected = [];
      }
    },
    openDeposit() {
      const data = {
        SteamID: this.$store.state.user.profile.SteamID,
      };

      console.log(data);
      socket.emit("getInventory", data);
    },
  },
  name: "JackpotTimer",
  components: { DepositMenu },
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

#jp-total-amount-text {
}

#jp-total-item-text {
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

#deposit-background-layer {
  background-color: rgba(0, 0, 0, 0.5);
  margin: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
}
</style>
