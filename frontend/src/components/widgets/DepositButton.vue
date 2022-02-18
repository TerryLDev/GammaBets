<template>
  <button id="deposit-button" @click="sendDeposit">Deposit</button>
</template>

<script>
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default {
  methods: {
    sendDeposit() {
      const depositState = this.$store.state.deposit;
      console.log(depositState);

      const choseSkins = depositState.selectedSkins.length > 0;

      // check deposit type
      if (depositState.depositType == "Coinflip" && choseSkins) {
        // creating a game
        if (depositState.selectedGameID == undefined || depositState.selectedGameID == "") {
          const data = {
            steamID: this.$store.state.user.profile.SteamID,
            skins: depositState.selectedSkins,
            tradeURL: this.$store.state.user.profile.TradeURL,
            side: this.$store.state.coinflip.chosenSide,
          };

          console.log(data);

          socket.emit("createNewCoinFlipGame", data);
        }

        // joining a game
        else {
          const data = {
            steamID: this.$store.state.user.profile.SteamID,
            skins: depositState.selectedSkins,
            tradeURL: this.$store.state.user.profile.TradeURL,
            side: this.$store.state.coinflip.chosenSide,
            gameID: depositState.selectedGameID,
          };

          console.log(data);

          socket.emit("joinActiveCoinFlipGame", data);
        }
      } else if (depositState.depositType == "High Stakes" && choseSkins) {
        console.log("err");
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
