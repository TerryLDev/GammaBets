<template>
  <button id="deposit-button" @click="sendDeposit">Deposit</button>
</template>

<script>
export default {
  computed: {
    lastTradeRequest() {
      return this.$store.getters.getlastTradeRequest;
    },
    tradeWait() {
      return this.$store.getters.getTradeWait;
    },
  },
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
        if (this.$store.getters.getNumberOfSelectedSkins <= 20) {
          return false;
        } else {
          // close deposit and show trade link
          return true;
        }
      }

      // give them an alert
      else if (depoState.selectedPrice < depoState.depositMin) {
        alert("The skins you selected are less than the deposit Minimum");
        return false;
      } else if (depoState.selectedPrice > depoState.depositMax) {
        alert("The skins you selected are greater than the deposit Maximum");
        return false;
      } else if (this.$store.getters.getNumberOfSelectedSkins < 20) {
        alert("You must select at least 20 skins");
        return false;
      } else {
        alert("An unknown error has occurred");
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
          const data = {
            steamID: this.$store.state.user.profile.SteamID,
            skins: depositState.selectedSkins,
            tradeURL: this.$store.state.user.profile.TradeURL,
            side: this.$store.state.coinflip.chosenSide,
          };

          console.log(data);

          this.$socket.emit("createNewCoinFlipGame", data);

          this.$store.dispatch("resetDepositAll");
        }

        // joining a game
        else {
          const data = {
            steamID: this.$store.state.user.profile.SteamID,
            skins: depositState.selectedSkins,
            tradeURL: this.$store.state.user.profile.TradeURL,
            gameID: depositState.gameID,
          };

          this.$socket.emit("joinActiveCoinFlipGame", data);

          this.$store.dispatch("resetDepositAll");
        }
      }
      // High Stakes Deposit
      else if (depositState.depositType == "High Stakes" && choseSkins) {
        const data = {
          steamID: this.$store.state.user.profile.SteamID,
          skins: depositState.selectedSkins,
          tradeURL: this.$store.state.user.profile.TradeURL,
        };

        this.$socket.emit("joinHighStakes", data);

        this.$store.dispatch("resetDepositAll");
      } 
      // Low Stakes
      else if (depositState.depositType == "Low Stakes" && choseSkins) {
        const data = {
          steamID: this.$store.state.user.profile.SteamID,
          skins: depositState.selectedSkins,
          tradeURL: this.$store.state.user.profile.TradeURL,
        };

        this.$socket.emit("joinLowStakes", data);

        console.log("sent LS deposit");

        this.$store.dispatch("resetDepositAll");
      } else {
        console.log("Error in Deposit");
      }
    },
    checkRequest() {
      const depositState = this.$store.state.deposit;
      const tradeValidation = this.validateDeposit(depositState);
      if (tradeValidation) {
        this.$store.dispatch("setLoadingTrue");

        const difference = Date.now() - this.lastTradeRequest;

        if (difference > this.tradeWait) {
          this.sendDeposit();
          this.$store.dispatch("setLastTradeRequest");
        } else {
          setTimeout(() => {
            this.sendDeposit();
            this.$store.dispatch("setLastTradeRequest");
          }, difference);
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
