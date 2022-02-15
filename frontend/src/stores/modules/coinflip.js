import axios from "axios";

const coinflip = {
  state: {
    activeCoinflips: [],
    coinflipHistory: [],
    chosenSide: "",
    pastWinningSides: [],
  },
  getters: {
    getCFGame(state, gameID) {
      let cfGame = state.activeCoinflips.find((game) => game.gameID == gameID);
      return cfGame;
    },
    getChosenSide(state) {
      return state.chosenSide;
    },
  },
  mutations: {
    setActiveCoinflips(state, games) {
      state.activeCoinflips = games;
    },
    setCoinflipHistory(state, history) {
      state.coinflipHistory = history;
    },
    setCoinSide(state, side) {
      state.chosenSide = side;
    },
  },
  actions: {
    getAPIActiveCoinflip({ commit }) {
      axios
        .get("/api/coinflip/active")
        .then((res) => {
          commit("setActiveCoinflips", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPICoinflipHistory({ commit }) {
      axios
        .get("/api/coinflip/history")
        .then((res) => {
          commit("setCoinflipHistory", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    setCoinSide({ commit }, side) {
      commit("setCoinSide", side);
    },
  },
};

export default coinflip;
