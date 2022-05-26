import axios from "axios";

const highStakes = {
  state: {
    currentGame: {
      GameID: "",
      Players: [],
      TotalPotValue: 0,
      Winner: "",
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
  },
  mutations: {
    setHighStakesCurrentGame(state, data) {
      state.currentGame.GameID = data.GameID;
      data.Players.forEach((player) => state.currentGame.Players.push(player));
      state.currentGame.TotalPotValue = data.TotalPotValue;
      state.currentGame.Winner = data.Winner;
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
  },
};

export default highStakes;
