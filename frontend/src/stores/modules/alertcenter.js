const alertCenter = {
  state: {
    tradeAlert: {
      tradeLink: "",
      gameID: "",
      steamID: "",
      success: null,
      waiting: true,
      isVisible: false,
    },
  },
  getters: {
    getTradeAlertIsVisible(state) {
      return state.isVisible;
    },
    getTradeAlertSuccessState(state) {
      return state.success;
    },
  },
  mutations: {
    newTradeAlert(state, data) {
      state.tradeLink = data.tradeLink;
      state.gameID = data.gameID;
      state.steamID = data.steamID;
    },
    toggleTradeAlert(state) {
      state.isVisible = !state.isVisible;
    },
    setTradeAlertSuccess(state, bool) {
      state.success = bool;
    },
    resetTradeAlertSuccess(state) {
      state.success = null;
    },
  },
  actions: {
    newTradeAlert({ commit }, data) {
      commit("newTradeAlert", data);
    },
    toggleTradeAlert({ commit }) {
      commit("newTradeAlert");
    },
    setTradeAlertSuccess({ commit }, bool) {
      commit("setTradeAlertSuccess", bool);
    },
    resetTradeAlertSuccess({ commit }) {
      commit("resetTradeAlertSuccess");
    },
  },
};

export default alertCenter;
