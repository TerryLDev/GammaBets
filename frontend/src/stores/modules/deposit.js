const deposit = {
  state: {
    skins: [],
    selectedSkins: [],
    selectedPrice: 0,
    gameID: "", //
    depositMin: 0,
    depositMax: 0,
    isVisible: false,
    depositType: "",
    loading: true,
  },
  getters: {
    getNumberOfSelectedSkins(state) {
      return state.selectedSkins.length;
    },
    getSelectedTotal(state) {
      if (state.selectedPrice < 0) {
        return (0).toFixed(2);
      } else {
        return state.selectedPrice.toFixed(2);
      }
    },
    getIsVisible(state) {
      return state.isVisible;
    },
  },
  mutations: {
    setSkins(state, skins) {
      state.skins = skins;
    },
    resetSelectedSkins(state) {
      state.selectedSkins = [];
    },
    addSelectedSkin(state, skin) {
      state.selectedSkins.push(skin);
    },
    removeSelectedSkin(state, skin) {
      const index = state.selectedSkins.indexOf(skin);
      state.selectedSkins.splice(index, 1);
    },
    addSelectedPrice(state, price) {
      state.selectedPrice += price;
    },
    subtractSelectedPrice(state, price) {
      state.selectedPrice -= price;
    },
    resetSelectedPrice(state) {
      state.selectedPrice = 0;
    },
    setSelectedGameID(state, gameID) {
      state.selectedGameID = gameID;
    },
    resetSelectedGameID(state) {
      state.selectedGameID = "";
    },
    setDepositType(state, game) {
      state.depositType = game;
    },
    resetDepositType(state) {
      state.depositType = "";
    },
    setDepositMin(state, min) {
      state.depositMin = min;
    },
    resetDepositMin(state) {
      state.depositMin = 0;
    },
    setDepositMax(state, max) {
      state.depositMax = max;
    },
    resetDepositMax(state) {
      state.depositMax = 0;
    },
    isVisibleToggle(state) {
      state.isVisible = !state.isVisible;
    },
    setLoadingTrue(state) {
      state.loading = true;
    },
    setLoadingFalse(state) {
      state.loading = false;
    },
    resetDepositAll(state) {
      state.skins = [];
      state.selectedSkins = [];
      state.selectedPrice = 0;
      state.gameID = "";
      state.depositMin = 0;
      state.depositMax = 0;
      state.isVisible = false;
      state.depositType = "";
      state.loading = true;
    },
  },
  actions: {
    addSkins({ commit }, skins) {
      commit("setSkins", skins);
    },
    resetSelectedSkins({ commit }) {
      commit("resetSelectedSkins");
    },
    addSelectedSkin({ commit }, skin) {
      commit("addSelectedSkin", skin);
    },
    removeSelectedSkin({ commit }, skin) {
      commit("removeSelectedSkin", skin);
    },
    resetSelectedPrice({ commit }) {
      commit("resetSelectedPrice");
    },
    addSelectedPrice({ commit }, price) {
      commit("addSelectedPrice", price);
    },
    substractSelectedPrice({ commit }, price) {
      commit("subtractSelectedPrice", price);
    },
    setSelectedGameID({ commit }, gameID) {
      commit("setSelectedGameID", gameID);
    },
    resetSelectedGameID({ commit }) {
      commit("setSelectedGameID");
    },
    setDepositMin({ commit }, min) {
      commit("setDepositMin", min);
    },
    resetDepositMin({ commit }) {
      commit("resetDepositMin");
    },
    setDepositMax({ commit }, max) {
      commit("setDepositMax", max);
    },
    resetDepositMax({ commit }) {
      commit("resetDepositMax");
    },
    isVisibleToggle({ commit }) {
      commit("isVisibleToggle");
    },
    setDepositType({ commit }, game) {
      commit("setDepositType", game);
    },
    resetDepositType({ commit }) {
      commit("resetDepositType");
    },
    resetDepositAll({ commit }) {
      commit("resetDepositAll");
    },
    setLoadingTrue({ commit }) {
      commit("setLoadingTrue");
    },
    setLoadingFalse({ commit }) {
      commit("setLoadingFalse");
    },
  },
};

export default deposit;
