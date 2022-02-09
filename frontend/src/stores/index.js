import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    user: { auth: false, profile: {} },
    messages: [],
    highStakes: {
      active: false,
      game: { GameID: "", Players: [], TotalPotValue: 0 },
    },
    lowStakes: {
      active: false,
      game: { GameID: "", Players: [], TotalPotValue: 0 },
    },
    coinflips: [],
  },
  getters: {
    getTradeURL(state) {
      if (state.user.profile.TradeURL) {
        return state.user.profile.TradeURL;
      } else {
        return false;
      }
    },
    getMessageFormat(state) {
      const messageData = {
        username: state.user.profile.Username,
        profileURL: state.user.profile.ProfileURL,
        profilePictureURL: state.user.profile.ProfilePictureURL,
      };

      return messageData;
    },
  },
  mutations: {
    setUser(state, user) {
      state.user.profile = user;
    },
    setUserAuth(state, auth) {
      state.user.auth = auth;
    },
    setMessages(state, messages) {
      state.messages = messages;
    },
    setHighStakesGame(state, game) {
      state.highStakes.game = game;
    },
    setHighStakesState(state, active) {
      state.highStakes.active = active;
    },
    addNewMessage(state, message) {
      state.messages.push(message);
    },
  },
  actions: {
    getAPIUser({ commit }) {
      axios
        .get("/api/user")
        .then((res) => {
          if (res.data.auth) {
            commit("setUser", res.data.user);
            commit("setUserAuth", res.data.auth);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPIMessages({ commit }) {
      axios
        .get("/api/messages")
        .then((res) => {
          commit("setMessages", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPIHighStakes({ commit }) {
      axios
        .get("/api/jackpot/highstakes")
        .then((res) => {
          commit("setHighStakesGame", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    addNewMessage({ commit }, message) {
      commit("addNewMessage", message);
    },
  },
});
