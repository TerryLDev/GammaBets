import axios from "axios";

const highStakes = {
  state: {
    currentGame: {
      GameID: "",
      Players: [],
      TotalPotValue: 0,
      Winner: "",
    },
    time: 0,
    pastGames: {
      topGame: {
        GameID: '',
        Players: [],
        TotalPotValue: 0,
        Winner: '',
      },
      history: [],
    }
  },
  getters: {
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
      })
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
          commit("setHighStakesCurrentGame", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};

export default highStakes;
