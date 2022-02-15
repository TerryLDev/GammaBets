const request = {
  state: {
    lastInventoryRequest: 0,
    inventoryWait: 5000,
    lastTradeRequest: 0,
    tradeWait: 3000,
    lastMessageRequest: 0,
    messageWait: 5000
  },
  getters: {
    canSendInventoryRequest(state) {
      const currentTime = Date.now();
      let difference = currentTime - state.lastInventoryRequest;

      if (difference >= state.inventoryWait)  {
        return true;
      }
      else {
        return false;
      }
    },
    canSendTradeRequest(state) {
      let difference = Date.now() - state.lastTradeRequest;

      if (difference >= state.tradeWait)  {
        return true;
      }
      else {
        return false;
      }
    }
  },
  mutations: {
    setLastInventoryRequest(state) {
      state.lastInventoryRequest = Date.now();
    },
    setLastTradeRequest(state) {
      state.lastTradeRequest = Date.now();
    },
  },
  actions: {
    setLastInventoryRequest({commit}) {
      commit("setLastInventoryRequest");
    },
    setLastTradeRequest({commit}) {
      commit("setLastTradeRequest");
    }
  },
};

export default request