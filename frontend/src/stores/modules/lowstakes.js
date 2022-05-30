import axios from "axios";

const lowStakes = {
  state: {
    currentGame: {
      GameID: "",
      Players: [],
      TotalPotValue: 0,
      Winner: "none",
      readyToSpin: false,
    },
    time: 120,
    pastGames: {
      topGame: {
        GameID: "",
        Players: [],
        TotalPotValue: 0,
        Winner: "",
      },
      history: [],
      isDefinedHistory: false,
    },
  },
  getters: {
    getLowStakesTotalValue(state) {
      return state.currentGame.TotalPotValue;
    },
    getLowStakesPlayerBets(state) {
      return state.currentGame.Players;
    },
    getLowStakesHistory(state) {
      return state.pastGames;
    },
    getLowStakesTotalItems(state) {
      let totalItems = 0;

      state.currentGame.Players.forEach((player) => {
        totalItems += player.skins.length;
      });

      return totalItems;
    },
    getLowStakesTime(state) {
      return state.time;
    },
    getLowStakesWinner(state) {
      return state.currentGame.Winner;
    },
    getLowStakesSpinnerStatus(state) {
      return state.currentGame.readyToSpin;
    },
    getIsLowStakesHistoryDefined(state) {
      return state.pastGames.isDefinedHistory;
    },
  },
  mutations: {
    setLowStakesCurrentGame(state, data) {
      state.currentGame.GameID = data.GameID;
      state.currentGame.Players = [];
      data.Players.forEach((player) => state.currentGame.Players.push(player));
      state.currentGame.TotalPotValue = data.TotalPotValue;
      state.currentGame.Winner = data.winner;
      if (
        state.currentGame.Winner != "" &&
        state.currentGame.Winner != "" &&
        state.currentGame.Winner != undefined
      ) {
        state.currentGame.readyToSpin = true;
      } else {
        state.currentGame.readyToSpin = false;
      }
    },
    setLowStakesTimer(state, data) {
      state.time = data.time;
    },
    setLowStakesHistory(state, data) {
      // topGame
      state.pastGames.topGame.GameID = data.topGame.GameID;
      state.pastGames.topGame.Players = [];

      data.topGame.Players.forEach((player) =>
        state.pastGames.topGame.Players.push(player)
      );

      state.pastGames.topGame.TotalPotValue = data.topGame.TotalPotValue;
      state.pastGames.topGame.Winner = data.topGame.Winner;

      // history
      state.pastGames.history = [];
      data.history.forEach((gameObj) => {
        state.pastGames.history.push(gameObj);
      });

      if (state.pastGames.history.length > 0) {
        state.pastGames.isDefinedHistory = true;
      }
    },
    newLowStakesPlayer(state, data) {
      state.currentGame.Players.push(data.Player);
      state.currentGame.TotalPotValue = data.TotalPotValue;
    },
    setLowStakesWinner(state, data) {
      state.currentGame.Winner = data.winner;
      if (
        state.currentGame.Winner != "" &&
        state.currentGame.Winner != "" &&
        state.currentGame.Winner != undefined
      ) {
        state.currentGame.readyToSpin = true;
      } else {
        state.currentGame.readyToSpin = false;
      }
    },
  },
  actions: {
    getAPILowStakesGame({ commit }) {
      axios
        .post("/api/jackpot/lowstakes")
        .then((res) => {
          commit("setLowStakesCurrentGame", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPILowStakesTimer({ commit }) {
      axios
        .post("api/jackpot/lowstakes/timer")
        .then((res) => {
          commit("setLowStakesTimer", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPILowStakesHistory({ commit }) {
      axios
        .post("api/jackpot/lowstakes/history")
        .then((res) => {
          commit("setLowStakesHistory", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    newLowStakesGame({ commit }, game) {
      commit("setLowStakesCurrentGame", game);
    },
    newLowStakesPlayer({ commit }, data) {
      commit("newLowStakesPlayer", data);
    },
    setLowStakesTimer({ commit }, time) {
      commit("setLowStakesTimer", time);
    },
    setLowStakesHistory({ commit }, data) {
      commit("setLowStakesHistory", data);
    },
    setLowStakesWinner({ commit }, data) {
      commit("setLowStakesWinner", data);
    },
  },
};

export default lowStakes;
