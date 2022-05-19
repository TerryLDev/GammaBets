import axios from "axios";

const coinflip = {
  state: {
    activeCoinflips: [],
    coinflipHistory: {},
    chosenSide: "",
    pastWinningSides: [],
    viewMenu: { isVisible: false, chosenGame: {} },
    joiningQueue: [],
    chosenQueue: {},
  },
  getters: {
    getCFHistory(state) {
      return state.coinflipHistory;
    },
    getChosenSide(state) {
      return state.chosenSide;
    },
    getGameDefaultTimer: (state) => (gameID) => {
      let timerIndex = state.activeCoinflips.findIndex(
        (obj) => obj.game.gameID == gameID
      );

      return state.activeCoinflips[timerIndex].timer.defaultTimer;
    },
    getGameFlippingTimer: (state) => (gameID) => {
      let timerIndex = state.activeCoinflips.findIndex(
        (obj) => obj.game.gameID == gameID
      );

      return state.activeCoinflips[timerIndex].timer.flippingTimer;
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
    getChosenGame(state) {
      return state.viewMenu.chosenGame;
    },
    getChosenQueue: (state) => (gameID) => {
      const index = state.joiningQueue.findIndex(
        (queue) => queue.GameID == gameID
      );

      return state.joiningQueue[index];
    },
    getGamePhase: (state) => (gameID) => {

      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.game.gameID == gameID
      );

      if (gameIndex >= 0) {
        return state.activeCoinflips[gameIndex].game.phase;
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
      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.game.gameID == gameID
      );

      state.viewMenu.chosenGame = state.activeCoinflips[gameIndex];
    },
    resetChosenView(state) {
      state.viewMenu.chosenGame = {};
    },
    changeCFGameTimer(state, cfTimer) {
      let gameIndex = state.activeCoinflips.findIndex(
        (game) => game.game.gameID == cfTimer.GameID
      );

      if (gameIndex >= 0) {
        state.activeCoinflips[gameIndex].timer = cfTimer.timer;
      }
    },
    addNewCoinFlip(state, newGame) {
      state.activeCoinflips.push(newGame);
    },
    updateCFGame(state, gameObj) {
      // Update gameObj
      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.game.gameID == gameObj.game.gameID
      );

      state.activeCoinflips[gameIndex] = gameObj;
      
      ///////////////////////////////////////
      // Update chosen View Menu, if they are looking at it
      if (
        state.viewMenu.chosenGame.game.gameID ==
        state.activeCoinflips[gameIndex].game.gameID
      ) {
        state.viewMenu.chosenGame = state.activeCoinflips[gameIndex];
      }
    },
    updateJoiningQueue(state, queues) {
      state.joiningQueue = queues;
    },
    updateHistory(state, historyArray) {
      state.coinflipHistory = historyArray;
    },
  },
  actions: {

    // API grabs
    getAPIActiveCoinflip({ commit }) {
      axios.post("api/coinflip/active")
        .then((res) => {
          commit("setActiveCoinflips", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    setCoinflipHistory({ commit }, cfHistory) {
      commit("setCoinflipHistory", cfHistory);
    },
    getAPICoinflipJoiningQueue({ commit }) {
      axios.post("api/coinflip/joining-queue")
        .then((res) => {
          commit("setCoinflipJoiningQueue", res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },

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

    changeCFGameTimer({ commit }, timer) {
      // update the timer that is appart of the game's obj
      commit("changeCFGameTimer", timer);
    },

    addNewCoinFlip({ commit }, newGame) {
      commit("addNewCoinFlip", newGame);
      commit("setGamePhase", { gameID: newGame.game.gameID, value: 0 });
    },

    updateCFGame({ commit }, data) {
      commit("updateCFGame", data);
    },

    updateJoiningQueue({ commit }, queues) {
      commit("updateJoiningQueue", queues);
    },

    // fix this
    updateWinner({ commit }, data) {
      commit("updateWinner", data);
    },
    updateCFHistory({ commit }, histAry) {
      commit("updateHistory", histAry);
    },
  },
};

export default coinflip;
