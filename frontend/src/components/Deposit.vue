<template>
  <div
    id="deposit-container"
    class="popup-cell primary-color-popup accent-color"
  >
    <div
      class="deposit-top-info default-secondary-cell secondary-color accent-color"
    >
      <p style="margin: auto auto auto 0; padding-left: 10px; font-size: 14px">
        Min: ${{ minPrice.toFixed(2) }}
      </p>

      <div id="selected-desired-skins">
        <h4>Selected Desired Items</h4>
        <p>{{ numberSelected }}/20</p>
      </div>
      <p
        style="margin: auto 0 auto auto; padding-right: 10px; font-size: 14px"
        v-if="maxPrice == 9999999"
      >
        Max: No Limit
      </p>
      <p
        style="margin: auto 0 auto auto; padding-right: 10px; font-size: 14px"
        v-else
      >
        Max: ${{ maxPrice.toFixed(2) }}
      </p>
    </div>

    <img v-if="isLoading" id="deposit-loading" src="../assets/gammalogo.png" />

    <div v-else id="player-inventory">
      <DepositSkinSlot v-for="skin in skins" v-bind:key="skin" :skin="skin" />
    </div>

    <div id="deposit-bottom-info">
      <h5>Total Value: ${{ selectedTotal }}</h5>
      <DepositButton />
    </div>
  </div>
</template>

<script>
import DepositButton from "./widgets/DepositButton.vue";
import DepositSkinSlot from "./widgets/DepositSkinSlot.vue";

import { computed } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const skins = computed(() => store.state.deposit.skins);
    const numberSelected = computed(
      () => store.getters.getNumberOfSelectedSkins
    );
    const selectedTotal = computed(() => store.getters.getSelectedTotal);
    const minPrice = computed(() => store.state.deposit.depositMin);
    const maxPrice = computed(() => store.state.deposit.depositMax);
    const isLoading = computed(() => store.state.deposit.loading);

    return {
      skins,
      numberSelected,
      selectedTotal,
      minPrice,
      maxPrice,
      isLoading,
    };
  },
  data() {
    return {};
  },
  computed: {
    isAuth() {
      return this.$store.getters.getUserAuth;
    },
    lastInventoryRequest() {
      return this.$store.getters.getLastInventoryRequest;
    },
    inventoryWait() {
      return this.$store.getters.getInventoryWait;
    },
  },
  beforeMount() {
    if (this.isAuth) {
      const emitData = {
        SteamID: this.$store.state.user.profile.SteamID,
      };

      const difference = Date.now() - this.lastInventoryRequest;

      if (difference > this.inventoryWait) {
        this.$socket.emit("getInventory", emitData);
        this.$store.dispatch("setLastInventoryRequest");
      } else {
        setTimeout(() => {
          this.$socket.emit("getInventory", emitData);
          this.$store.dispatch("setLastInventoryRequest");
        }, difference);
      }
    } else {
      alert("You must be logged in to make a deposit");
    }

    this.$store.dispatch("resetSelectedPrice");
    this.$store.dispatch("resetSelectedSkins");
},
  created() {
    this.$socket.on("getInventory", (data) => {
      if (data.msg == "No Inventory") {
        alert("You do not have any skins in your inventory");
        this.$store.dispatch("resetDepositAll");
        this.$store.dispatch("setLoadingFalse");
      } else {
        this.$store.dispatch("addSkins", data);
        this.$store.dispatch("resetSelectedPrice");
        this.$store.dispatch("resetSelectedSkins");
        this.$store.dispatch("setLoadingFalse");
      }
    });
  },
  name: "DepositMenu",
  components: { DepositSkinSlot, DepositButton },
};
</script>

<style>
#deposit-container {
  margin: 0;
  width: 650px;
  height: 700px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0;
}

.deposit-top-info {
  width: 630px;
  height: 60px;
  display: grid;
  grid-template: 1fr / 1fr 2fr 1fr;
  gap: 0px;
  margin-top: 10px;
}

.deposit-top-info h4 {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  color: #ffffff;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
  margin: 0;
}

#selected-desired-skins {
  text-align: center;
  margin: auto;
}

.deposit-top-info p {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
  color: #ffffff;
  margin: 0;
}

#num-of-skins-selected {
}

#player-inventory {
  width: 610px;
  height: 560px;
  border-radius: 10px 10px 0px 0px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
  justify-content: center;
  overflow-y: scroll;
  overflow-x: hidden;
}

#deposit-bottom-info {
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0px 0px 15px 15px;
  border-top: 2px solid rgba(229, 239, 172, 0.5);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 650px;
  height: 50px;
  margin: 0;
}

#deposit-bottom-info h5 {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  color: #ffffff;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
  margin-left: 10px;
  margin-top: 0;
  margin-bottom: 0;
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

#deposit-loading {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 150px;
  width: 150px;
  animation: loading-spin linear 1s infinite;
}
</style>
