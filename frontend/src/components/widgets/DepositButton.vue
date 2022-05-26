<template>
  <button id="deposit-button" @click="sendDeposit">Deposit</button>
</template>

<script>
import { io } from "socket.io-client";
let socket;

const env = process.env.NODE_ENV;

if (env == "development") {
  socket = io("http://localhost:4000");
} else {
  socket = io(window.location.origin);
}

export default {
  methods: {
    validateDeposit(depoState) {
      // check if they have a tradeURL
      if (
        this.$store.state.user.profile.TradeURL == undefined ||
        this.$store.state.user.profile.TradeURL.length == 0
      ) {
        return false;
      }

      // Check Deposit requirements
      if (
        depoState.selectedPrice >= depoState.depositMin &&
        depoState.selectedPrice <= depoState.depositMax
      ) {
        // close deposit and show trade link
        return true;
      }

      // give them an alert
      else if (depoState.selectedPrice < depoState.depositMin) {
        alert("The skins you selected are less than the deposit Minimum");
        return false;
      } else if (depoState.selectedPrice > depoState.depositMax) {
        alert("The skins you selected are greater than the deposit Maximum");
        return false;
      } else {
        alert("Weird Error");
        return false;
      }
    },

    sendDeposit() {
      const depositState = this.$store.state.deposit;

      const choseSkins = depositState.selectedSkins.length > 0;

      // check deposit type - CoinFlip Deposit
      if (depositState.depositType == "Coinflip" && choseSkins) {
        // creating a game
        if (depositState.gameID == undefined || depositState.gameID == "") {
          if (this.validateDeposit(depositState)) {
            const data = {
              steamID: this.$store.state.user.profile.SteamID,
              skins: depositState.selectedSkins,
              tradeURL: this.$store.state.user.profile.TradeURL,
              side: this.$store.state.coinflip.chosenSide,
            };

            socket.emit("createNewCoinFlipGame", data);

            this.$store.dispatch("resetDepositAll");
            this.$store.dispatch("setLoadingTrue");
          }
        }

        // joining a game
        else {
          if (this.validateDeposit(depositState)) {
            const data = {
              steamID: this.$store.state.user.profile.SteamID,
              skins: depositState.selectedSkins,
              tradeURL: this.$store.state.user.profile.TradeURL,
              gameID: depositState.gameID,
            };

            socket.emit("joinActiveCoinFlipGame", data);

            this.$store.dispatch("resetDepositAll");
            this.$store.dispatch("setLoadingTrue");
          }
        }
      }
      // High Stakes Deposit
      else if (depositState.depositType == "High Stakes" && choseSkins) {
        if (this.validateDeposit(depositState)) {
          const data = {
            steamID: this.$store.state.user.profile.SteamID,
            skins: depositState.selectedSkins,
            tradeURL: this.$store.state.user.profile.TradeURL,
          };

          socket.on("joinHighStakes", data);

          this.$store.dispatch("resetDepositAll");
          this.$store.dispatch("setLoadingTrue");
        }
      }
    },
  },
  name: "DepositButton",
};
</script>

<style>
#deposit-button {
  width: 110px;
  height: 30px;
  background: rgba(32, 29, 30, 0.7);
  border: 1px solid rgba(229, 239, 172, 0.5);
  box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  margin-right: 10px;
  margin-top: 0;
  margin-bottom: 0;
}

#deposit-button:hover {
  cursor: pointer;
  background-color: black;
  color: white;
}
</style>
