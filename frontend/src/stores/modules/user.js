import axios from "axios";

const user = {
  state: {
    auth: false,
    profile: {},
  },
  getters: {
    getTradeURL(state) {
      if (state.user.profile.TradeURL) {
        return state.user.profile.TradeURL;
      }
      else {
        return false;
      }
    },
    getUserAuth(state) {
      return state.auth;
    }
  },
  mutations: {
    setUser(state, user) {
      state.profile = user;
    },
    setUserAuth(state, auth) {
      state.auth = auth;
    },
  },
  actions: {
    getAPIUser({ commit }) {
      axios
        .get("api/user")
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
