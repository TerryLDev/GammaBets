const deposit = {
  state: {
    skins: [],
    selected: [],
  },
  getters: {},
  mutations: {
    setSkins(state, skins) {
      state.skins = skins;
    },
    addSelectedSkin(state, skin) {
      state.selected.push(skin);
    },
    removeSelectedSkin(state, skin) {
      const index = state.selected.indexOf(skin);
      state.selected.splice(index, 1);
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
  },
};

export default deposit;
