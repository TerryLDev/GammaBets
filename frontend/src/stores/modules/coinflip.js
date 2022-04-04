import axios from "axios";

const coinflip = {
  state: {
    activeCoinflips: [],
    coinflipHistory: [],
    chosenSide: "",
    pastWinningSides: [],
    viewMenu: { isVisible: false, chosenGame: {}, state: 0 },
    joiningQueue: [],
    chosenQueue: {},
  },
  getters: {
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
    getChosenQueue(state) {
      return state.chosenQueue || false;
    },
    getViewMenuState(state) {
      return state.viewMenu.state;
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
      const game = state.activeCoinflips.find(
        (game) => game.game.gameID == gameID
      );

      state.viewMenu.chosenGame = game;
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
      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.gameID == gameObj.gameID
      );

      state.activeCoinflips[gameIndex] = gameObj;

      console.log(gameObj);
    },
    updateJoiningQueue(state, queues) {
      state.joiningQueue = queues;
    },
    setChosenQueue(state, gameID) {
      let getQueue = state.joiningQueue.find((queue) => queue.GameID == gameID);

      if (getQueue) {
        state.chosenQueue = getQueue;
      }
    },
    setViewState(state, value) {
      state.viewMenu.state = value;
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
    changeCFGameTimer({ commit }, timer) {
      // update the timer that is appart of the game's obj
      commit("changeCFGameTimer", timer);
    },
    addNewCoinFlip({ commit }, newGame) {
      commit("addNewCoinFlip", newGame);
    },
    updateCFGame({ commit }, data) {
      commit("updateCFGame", data);
      console.log(data);
    },
    updateJoiningQueue({ commit }, queues) {
      commit("updateJoiningQueue", queues);
    },
    setChosenQueue({ commit }, gameID) {
      commit("setChosenQueue", gameID);
    },
    setViewState({ commit }, value) {
      commit("setViewState", value);
    },
  },
};

export default coinflip;
