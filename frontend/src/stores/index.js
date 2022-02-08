import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    user: { auth: false, profile: {} },
    jackpot: { active: false, game: {}},
    coinflips: []
  },
  getters: {
    getTradeURL(state) {
      if(state.user.profile.TradeURL) {
        return state.user.profile.TradeURL;
      }
      else {
        return false;
      }
    }
  },
  mutations: {
    setUser(state, user) {
      state.user.profile = user;
    },
    setAuth(state, auth) {
      state.user.auth = auth;
    },
  },
  actions: {
    getUser({ commit }) {
      axios
        .get("/api/user")
        .then((res) => {
          if (res.data.auth) {
            commit("setUser", res.data.user);
            commit("setAuth", res.data.auth);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
});
