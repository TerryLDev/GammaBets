import axios from "axios";
import { io } from "socket.io-client";
let socket;
const env = process.env.NODE_ENV;

if (env == "development") {
  socket = io("http://localhost:4000");
} else {
  socket = io(window.location.origin);
}

const user = {
  state: {
    auth: false,
    profile: {},
  },
  getters: {
    getTradeURL(state) {
      if (state.user.profile.TradeURL) {
        return state.user.profile.TradeURL;
      } else {
        return false;
      }
    },
    getUserAuth(state) {
      return state.auth;
    },
  },
  mutations: {
    setUser(state, user) {
      state.profile = user;
    },
    setUserAuth(state, auth) {
      state.auth = auth;

      if (state.auth) {
        socket.emit("join", state.profile.SteamID);
      }
    },
  },
  actions: {
    getAPIUser({ commit }) {
      axios
        .post("api/user")
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
  },
};

export default user;
