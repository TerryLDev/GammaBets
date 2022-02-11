import axios from "axios";

const highStakes = {
  state: {
    active: false,
    game: { GameID: "", Players: [], TotalPotValue: 0 },
  },
  getters: {},
  mutations: {
    setHighStakesGameID(state, gameID) {
      state.game.GameID = gameID;
    },
    setHighStakesPlayers(state, players) {
      state.game.Players = players;
    },
    setHighStakesTotalPotValue(state, val) {
      state.game.TotalPotValue = val;
    },
    setHighStakesState(state, active) {
      state.active = active;
    },
  },
  actions: {
    getAPIHighStakes({ commit }) {
      axios
        .get("/api/jackpot/highstakes")
        .then((res) => {
          commit("setHighStakesGameID", res.data.GameID);
          commit("setHighStakesPlayers", res.data.Players);
          commit("setHighStakesTotalPotValue", res.data.TotalPotValue);
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};

export default highStakes;
