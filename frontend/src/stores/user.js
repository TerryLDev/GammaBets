import { createStore } from "vuex";

export default createStore({
  state: {
    auth: false,
    SteamID: "",
    Username: "",
    ProfilePictureURL: "",
    ProfileURL: "",
    Trades: [],
    TradeURL: "",
  },
  getters: {},
  mutations: {
    setAuth(state, payload) {
      state.auth = payload;
    },
    setSteamID(state, payload) {
      state.SteamID = payload;
    },
    setUsername(state, payload) {
      state.Username = payload;
    },
    setProfilePictureURL(state, payload) {
      state.ProfilePictureURL = payload;
    },
  },
  actions: {
    setAuth(context) {
      context.commit("setAuth");
    },
  },
});
