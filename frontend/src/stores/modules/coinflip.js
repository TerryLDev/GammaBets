import axios from "axios";

const coinflip = {
  state: {
    activeCoinflips: [],
    coinflipHistory: [],
    chosenSide: "",
    pastWinningSides: [],
    viewMenu: { isVisible: false, chosenGame: {} },
    cfGameTimers: [],
    joiningQueue: [],
  },
  getters: {
    getChosenSide(state) {
      return state.chosenSide;
    },
    getGameTimerObjectByGameID: (state) => (gameID) => {
      let timerIndex = state.cfGameTimers.findIndex(
        (obj) => obj.gameID == gameID
      );

      return state.cfGameTimers[timerIndex];
    },
    getPlayerOneTotalValue: (state) => (gameID) => {
      let gameIndex = state.activeCoinflips.findIndex(
        (obj) => obj.gameID == gameID
      );

      let totalVal = 0;

      state.activeCoinflips[gameIndex].playerOne.skinValues.forEach((val) => {
        totalVal += val;
      });

      return totalVal;
    },
    getPlayerTwoTotalValue: (state) => (gameID) => {
      let gameIndex = state.activeCoinflips.findIndex(
        (obj) => obj.gameID == gameID
      );

      let totalVal = 0;

      state.activeCoinflips[gameIndex].playerTwo.skinValues.forEach((val) => {
        totalVal += val;
      });

      return totalVal;
    },
    getSelectedJoiningQueue: (state) => (gameID) => {
      let getQueue = state.joiningQueue.find(queue => queue.GameID == gameID);

      if (getQueue) {
        return getQueue;
      }
      else {
        return false;
      }
    },
  },
  mutations: {
    setActiveCoinflips(state, games) {
      state.activeCoinflips = games;
    },
    setCoinflipHistory(state, history) {
      state.coinflipHistory = history;
    },
    setCoinflipJoiningQueue(state, queue) {
      state.joiningQueue = queue;
    },
    setCoinSide(state, side) {
      state.chosenSide = side;
    },
    toggleViewMenu(state) {
      state.viewMenu.isVisible = !state.viewMenu.isVisible;
    },
    setChosenView(state, gameID) {
      const game = state.activeCoinflips.find((game) => game.gameID == gameID);

      state.viewMenu.chosenGame = game;
    },
    resetChosenView(state) {
      state.viewMenu.chosenGame = {};
    },
    changeCFGameTimers(state, cfTimers) {
      cfTimers.forEach((timerObj) => {
        let index = state.cfGameTimers.findIndex(
          (currentObj) => timerObj.gameID == currentObj.gameID
        );

        if (index != undefined) {
          state.cfGameTimers[index] = timerObj;
        }
      });
    },
    addNewCoinFlip(state, newGame) {
      state.activeCoinflips.push(newGame);
    },
    updateCFGame(state, gameObj) {
      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.gameID == gameObj.gameID
      );

      state.activeCoinflips[gameIndex] = gameObj;
    },
    updateJoiningQueue(state, queues) {
      state.joiningQueue = queues;
    },
  },
  actions: {
    // API grabs
    getAPIActiveCoinflip({ commit }) {
      axios
        .post("api/coinflip/active")
        .then((res) => {
          commit("setActiveCoinflips", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPICoinflipHistory({ commit }) {
      axios
        .post("api/coinflip/history")
        .then((res) => {
          commit("setCoinflipHistory", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAPICoinflipJoiningQueue({ commit }) {
      axios
        .post("api/coinflip/joining-queue")
        .then((res) => {
          commit("setCoinflipJoiningQueue", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // view menu
    setCoinSide({ commit }, side) {
      commit("setCoinSide", side);
    },
    toggleViewMenu({ commit }) {
      commit("toggleViewMenu");
    },
    setChosenView({ commit }, gameID) {
      commit("setChosenView", gameID);
    },
    resetChosenView({ commit }) {
      commit("resetChosenView");
    },
    changeCFGameTimers({ commit }, timers) {
      commit("changeCFGameTimers", timers);
    },
    addNewCoinFlip({ commit }, newGame) {
      commit("addNewCoinFlip", newGame);
    },
    updateCFGame({ commit }, data) {
      commit("updateCFGame", data);
    },
    updateJoiningQueue({commit}, queues) {
      commit("updateJoiningQueue", queues);
    },
  },
};

export default coinflip;
