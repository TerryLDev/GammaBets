const request = {
  state: {
    lastInventoryRequest: 0,
    inventoryWait: 5000,
    lastTradeRequest: 0,
    tradeWait: 5000,
    lastMessageRequest: 0,
    messageWait: 5000,
  },
  getters: {
    getLastInventoryRequest(state) {
      return state.lastInventoryRequest;
    },
    getlastTradeRequest(state) {
      return state.lastTradeRequest;
    },
    getLastMessageRequest(state) {
      return state.lastMessageRequest;
    },
    getInventoryWait(state) {
      return state.inventoryWait;
    },
    getTradeWait(state) {
      return state.tradeWait;
    },
    getMessageWait(state) {
      return state.messageWait;
    },
  },
  mutations: {
    setLastInventoryRequest(state) {
      state.lastInventoryRequest = Date.now();
    },
    setLastTradeRequest(state) {
      state.lastTradeRequest = Date.now();
    },
    setLastMessageRequest(state) {
      state.lastMessageRequest = Date.now();
    },
  },
  actions: {
    setLastInventoryRequest({ commit }) {
      commit("setLastInventoryRequest");
    },
    setLastTradeRequest({ commit }) {
      commit("setLastTradeRequest");
    },
    setLastMessageRequest({ commit }) {
      commit("setLastMessageRequest");
    },
  },
};

export default request;
