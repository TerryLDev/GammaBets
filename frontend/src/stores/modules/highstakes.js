import axios from "axios";

const highStakes = {
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
    },
  },
  getters: {
    getHighStakesTotalValue(state) {
      return state.currentGame.TotalPotValue;
    },
    getHighStakesPlayerBets(state) {
      return state.currentGame.Players;
    },
    getHighStakesHistory(state) {
      return state.pastGames;
    },
    getHighStakesTotalItems(state) {
      let totalItems = 0;

      state.currentGame.Players.forEach((player) => {
        totalItems += player.skins.length;
      });

      return totalItems;
    },
    getHighStakesTime(state) {
      return state.time;
    },
    getHighStakesWinner(state) {
      return state.currentGame.Winner;
    },
    getSpinnerStatus(state) {
      return state.currentGame.readyToSpin;
    }
  },
  mutations: {
    setHighStakesCurrentGame(state, data) {
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
      }
      else {
        state.currentGame.readyToSpin = false;
      }
    },
    setHighStakesTimer(state, data) {
      state.time = data.time;
    },
    setHighStakesHistory(state, data) {
      state.pastGames.topGame.GameID = data.topGame.GameID;
      data.topGame.Players.forEach((player) =>
        state.pastGames.topGame.Players.push(player)
      );
      state.pastGames.topGame.TotalPotValue = data.topGame.TotalPotValue;
      state.pastGames.topGame.Winner = data.topGame.Winner;

      data.history.forEach((gameObj) => {
        state.pastGames.history.push(gameObj);
      });
    },
    newHighStakesPlayer(state, data) {
      state.currentGame.Players.push(data.Player);
      state.currentGame.TotalPotValue = data.TotalPotValue;
    },
    setHighStakesWinner(state, data) {
      state.currentGame.Winner = data.winner;
      if (
        state.currentGame.Winner != "" &&
        state.currentGame.Winner != "" &&
        state.currentGame.Winner != undefined
      ) {
        state.currentGame.readyToSpin = true;
      }
      else {
        state.currentGame.readyToSpin = false;
      }
    },
  },
  actions: {
    getAPIHighStakesGame({ commit }) {
      axios
        .post("/api/jackpot/highstakes")
        .then((res) => {
          commit("setHighStakesCurrentGame", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPIHighStakesTimer({ commit }) {
      axios
        .post("api/jackpot/highstakes/timer")
        .then((res) => {
          commit("setHighStakesTimer", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPIHighStakesHistory({ commit }) {
      axios
        .post("api/jackpot/highstakes/history")
        .then((res) => {
          commit("setHighStakesHistory", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    newHighStakesGame({ commit }, game) {
      commit("setHighStakesCurrentGame", game);
    },
    newHighStakesPlayer({ commit }, data) {
      commit("newHighStakesPlayer", data);
    },
    setHighStakesTimer({ commit }, time) {
      commit("setHighStakesTimer", time);
    },
    setHighStakesHistory({ commit }, data) {
      commit("setHighStakesHistory", data);
    },
    setHighStakesWinner({ commit }, data) {
      commit("setHighStakesWinner", data);
    },
  },
};

export default highStakes;
