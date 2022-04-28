import axios from "axios";

const coinflip = {
  state: {
    activeCoinflips: [],
    coinflipHistory: [],
    chosenSide: "",
    pastWinningSides: [],
    viewMenu: { isVisible: false, chosenGame: {} },
    joiningQueue: [],
    chosenQueue: {},
    gamePhases: [],
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
    getChosenQueue: (state) => (gameID) => {
      const index = state.joiningQueue.findIndex(
        (queue) => queue.GameID == gameID
      );

      return state.joiningQueue[index];
    },
    getGamePhase: (state) => (gameID) => {
      // gamePhaseObj = {gameID: **, value: **}

      const gameIndex = state.gamePhases.findIndex(
        (game) => game.gameID == gameID
      );

      return state.gamePhases[gameIndex].phase;
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
        (game) => game.game.gameID == gameObj.game.gameID
      );

      state.activeCoinflips[gameIndex] = gameObj;

      console.log(gameObj);
    },
    updateJoiningQueue(state, queues) {
      state.joiningQueue = queues;
    },
    setGamePhase(state, gamePhaseObj) {

      // gamePhaseObj = {gameID: **, value: **}

      const index = state.gamePhases.forEach(gPhase => gPhase.gameID == gamePhaseObj.gameID);

      if(index == undefined) {
        const newPhase = {gameID: gamePhaseObj.gameID, phase: gamePhaseObj.value}

        state.gamePhases.push(newPhase);
      }

      else {
        state.gamePhases[index].phase = gamePhaseObj.value;
      }

    },
    updateWinner(state, gameID, steamID) {

      const gameIndex = state.activeCoinflips.findIndex(
        (game) => game.game.gameID == gameID
      );

      state.activeCoinflips[gameIndex].game.winner = steamID;
    },
  },
  actions: {
    setGamePhase({ commit }, gamePhaseObj) {
      // gamePhaseObj = {gameID: **, value: **}
      commit("setGamePhase", gamePhaseObj);
    },

    // API grabs
    getAPIActiveCoinflip({ commit }) {
      axios
        .post("api/coinflip/active")
        .then((res) => {
          commit("setActiveCoinflips", res.data);

          res.data.forEach(gameObj => {

            const innerGame = gameObj.game;
            let phase = 0;
            
            if(innerGame.playerTwoJoining == false && innerGame.playerTwoJoined == false) {
              phase = 0;
            }

            else if(innerGame.playerTwoJoining && innerGame.playerTwoJoined == false) {
              phase = 1;
            }

            else if(innerGame.playerTwoJoining && innerGame.playerTwoJoined) {
              phase = 2;
            }

            else if(innerGame.winner != "none") {
              phase = 3;
            }

            else {
              phase = 0;
            }

            const data = {gameID: innerGame.gameID, value: phase};

            commit("setGamePhase", data);
          })
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
      commit("setGamePhase", {gameID: newGame.game.gameID, value: 0});
    },

    updateCFGame({ commit }, data) {
      commit("updateCFGame", data);
      console.log(data);
    },

    updateJoiningQueue({ commit }, queues) {
      commit("updateJoiningQueue", queues);
    },

    // fix this
    updateWinner({ commit }, gameID, steamID) {
      commit("updateWinner", gameID, steamID);
    },
  },
};

export default coinflip;
