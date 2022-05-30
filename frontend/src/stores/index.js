import { createStore } from "vuex";
import axios from "axios";
import user from "./modules/user";
import highStakes from "./modules/highstakes";
import deposit from "./modules/deposit";
import coinflip from "./modules/coinflip";
import request from "./modules/request";
import lowStakes from "./modules/lowstakes";

export default createStore({
  state: {
    messages: [],
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
    getMessages(state) {
      return state.messages;
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
        .post("/api/messages")
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
    coinflip,
    request,
    lowStakes,
  },
});
