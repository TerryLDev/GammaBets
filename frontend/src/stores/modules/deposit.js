const deposit = {
  state: {
    skins: [],
    selectedSkins: [],
    selectedPrice: 0,
  },
  getters: {
    getNumberOfSelectedSkins(state) {

      return state.selectedSkins.length;

    },
    getSelectedTotal(state) {
      if(state.selectedPrice < 0) {
        return (0).toFixed(2);
      }
      else {
        return (state.selectedPrice).toFixed(2);
      }
    }
  },
  mutations: {
    setSkins(state, skins) {
      state.skins = skins;
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
  },
  actions: {
    addSkins({ commit }, skins) {
      commit("setSkins", skins);
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
  },
};

export default deposit;
