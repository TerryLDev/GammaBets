import { createStore } from "vuex";
import axios from "axios";
import user from "./modules/user";
import highStakes from "./modules/highstakes";
import deposit from "./modules/deposit";

export default createStore({
  state: {
    messages: [],
    lowStakes: {
      active: false,
      game: { GameID: "", Players: [], TotalPotValue: 0, Time: 120 },
    },
    coinflips: [],
  },
  getters: {
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
    setMessages(state, messages) {
      state.messages = messages;
    },
    addNewMessage(state, message) {
      state.messages.push(message);
    },
  },
  actions: {
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
    addNewMessage({ commit }, message) {
      commit("addNewMessage", message);
    },
  },
  modules: {
    user,
    deposit,
    highStakes,
  },
});
