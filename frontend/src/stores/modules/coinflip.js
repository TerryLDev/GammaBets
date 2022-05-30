import axios from "axios";

const coinflip = {
  state: {
    activeCoinflips: [],
    coinflipHistory: {},
    isCfHistoryDefined: false,
    chosenSide: "",
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
    getIsCfHistoryDefined(state) {
      return state.isCfHistoryDefined;
    },
  },
  mutations: {
    setActiveCoinflips(state, games) {
      state.activeCoinflips = games;
    },
    setCoinflipHistory(state, history) {
      state.coinflipHistory = history;
      if (state.coinflipHistory.history.length > 0) {
        state.isCfHistoryDefined = true;
      } else {
        state.isCfHistoryDefined = false;
      }
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
    removeCFGame(state, gameID) {
      // removes game
      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.game.gameID == gameID
      );

      if (gameIndex > -1 && gameIndex != undefined) {
        state.activeCoinflips.splice(gameIndex, 1);
      } else {
        console.log("Please refresh the page, coinflip games need an update");
      }
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
          return console.error(err);
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
    setCoinflipHistory({ commit }, cfHistory) {
      commit("setCoinflipHistory", cfHistory);
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
    },

    updateCFGame({ commit }, data) {
      commit("updateCFGame", data);
    },

    updateJoiningQueue({ commit }, queues) {
      commit("updateJoiningQueue", queues);
    },
    updateWinner({ commit }, data) {
      commit("updateWinner", data);
    },
    removeCFGame({ commit }, gameID) {
      commit("removeCFGame", gameID);
    },
  },
};

export default coinflip;
