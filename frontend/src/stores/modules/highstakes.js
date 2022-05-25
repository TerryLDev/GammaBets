import axios from "axios";

const highStakes = {
  state: {
    active: false,
    game: {},
    history: [],
  },
  getters: {
    getHighStakesTotalItems(state) {
      let itemTotal = 0;

      if (state.game.Players == undefined) {
        return itemTotal;
      }

      state.game.Players.forEach((player) => {
        itemTotal += player.skins.length;
      });

      return itemTotal;
    },
  },
  mutations: {
    setHighStakesCurrentGame(state, data) {
      state.game = data;
    },
    setHighStakesPlayers(state, players) {
      state.game.Players = players;
    },
    setHighStakesState(state, active) {
      state.active = active;
    },
  },
  actions: {
    getAPIHighStakes({ commit }) {
      axios
        .post("/api/jackpot/highstakes")
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
