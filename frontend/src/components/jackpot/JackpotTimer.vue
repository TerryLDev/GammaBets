<template>
  <div id="spinner-area" class="primary-color default-cell accent-color">
    <div class="top-spinner-area">
      <div
        id="jp-total-amount"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 id="jp-total-amount-text" class="top-spinner-area-h">
          ${{ totalPotValue }}
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
        <h2 class="top-spinner-area-h">{{ itemTotal }}/100</h2>
        <p class="top-spinner-area-t">Total Items:</p>
      </div>
    </div>

    <button
      id="jp-deposit"
      class="secondary-color default-secondary-cell accent-color"
      @click="openDepositMenu"
    >
      Deposit
    </button>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  setup() {
    const store = useStore();

    const itemTotal = computed(() => store.getters.getHighStakesTotalItems);
    const totalPotValue = computed(
      () => store.getters.getHighStakesTotalPotValue
    );

    return {
      itemTotal,
      totalPotValue,
    };
  },
  data() {
    return {
      depositType: "High Stakes",
      depositMin: 1.0,
      depositMax: 0,
    };
  },
  methods: {
    openDepositMenu() {
      const store = this.$store;

      store.dispatch("setDepositMin", this.depositMin);
      store.dispatch("setDepositMax", this.depositMax);
      store.dispatch("isVisibleToggle");
      store.dispatch("setDepositType", this.depositType);
    },
  },
  name: "JackpotTimer",
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
</style>
