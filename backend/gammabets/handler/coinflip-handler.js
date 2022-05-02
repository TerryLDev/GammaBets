require("dotenv").config(__dirname + "/.env");
const fs = require("fs");

const CoinFlipGame = require("../../models/coinflipgame.model");
const User = require("../../models/user.model");
const emitter = require('events').EventEmitter;
const cfEvents = new emitter();

let allCFGames = [];

let cfGamesTimer = [];

let cfHistory = [];

let creatingQueue = {
    queue: [],
    addToQueue(gameID, steamID, side) {
        const entry = {
            GameID: gameID,
            SteamID: steamID,
            Side: side
        }

        this.queue.push(entry);
    },
    getQueue(gameID, steamID) {

        let grabSide = this.queue.find(wSide => wSide.GameID == gameID && wSide.SteamID == steamID);

        return grabSide;

    },
    removeQueue(gameID, steamID) {

        let index = this.queue.findIndex(wSide => wSide.GameID == gameID && wSide.SteamID == steamID);
        
        this.queue.splice(index, 1);

    },
    
};

let joiningQueue = {
    queue: [],
    // adds player to the joining queue for a coin flip
    addToQueue(gameID, steamID, username = "No Name Found", userPicURL) {
        const entry = {
            GameID: gameID,
            SteamID: steamID,
            Username: username,
            UserPic: userPicURL
        }
        this.queue.push(entry);

        cfEvents.emit("updateJoiningQueue", this.queue);
    },
    // checks to see if a player has already joined the queue for a game
    checkSelectedQueue(gameID) {

        const findQueue = this.queue.find(queue => gameID == queue.GameID);

        if (findQueue) {
            return false;
        }

        else {
            return true;
        }
    },
    // returns if it can find a queue
    getSelectedQueue(gameID) {

        const findQueue = this.queue.find(queue => gameID == queue.GameID);

        if (findQueue) {
            return findQueue;
        }

        else {
            return false;
        }

    },
    removeSelectedQueue(gameID) {

        const index = this.queue.findIndex(queue => gameID == queue.GameID);
        this.queue.splice(index, 1);

        cfEvents.emit("updateJoiningQueue", this.queue);
    },
    updateTradeID(tradeID, gameID) {
        const gameIndex = this.queue.findIndex(q => q.GameID == gameID);

        this.queue[gameIndex].TradeID = tradeID;
    },
    findTradeID(gameID) {
        const gameIndex = this.queue.findIndex(q => q.GameID == gameID);

        if (gameIndex != undefined) {
            return this.queue[gameIndex].TradeID;
        }

        else {
            return false;
        }
    }
};

class CoinFlipHandler {

    mainTimer = parseFloat(process.env.COIN_FLIP_OPPONENT_JOINING_TIME);
    countDown = parseFloat(process.env.COIN_FLIP_COUNTDOWN_TIME);

    createGameID() {

        const chars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    
        let id = "";
    
        for(let i = 0; i < 32; i++) {
    
            let index = Math.floor(Math.random() * chars.length);
            id += chars[index]
    
        }
    
        return id;
    }

    findCFBot(gameID) {

        let bot = "none";

        allCFGames.forEach(obj => {

            if (obj.game.gameID == gameID) {

                bot = obj.game.bot;

            }

        });

        return bot;

    }

    ////////////////

    // Winner methods

    // needs work - A lot of work
    #decideWinner(cfInnerGameObject) {

        joiningQueue.removeSelectedQueue(cfInnerGameObject.gameID)

        const gameID = cfInnerGameObject.gameID;

        if (cfInnerGameObject.playerTwo.skins.length > 0 && cfInnerGameObject.playerOne.skins.length > 0) {
            
            let listOfPlayers = [];

            let playerOneTotal = 0;
            let playerTwoTotal = 0;

            cfInnerGameObject.playerOne.skinValues.forEach(val => playerOneTotal+= val);

            cfInnerGameObject.playerTwo.skinValues.forEach(val => playerTwoTotal+= val);

            const playerOneEntries = playerTwoTotal * 100;
            const playerTwoEntries = playerOneTotal * 100;

            for (let i = 0; i < playerOneEntries; i++) {
                listOfPlayers.push(cfInnerGameObject.playerOne.username);
            }

            for (let i = 0; i < playerTwoEntries; i++) {
                listOfPlayers.push(cfInnerGameObject.playerTwo.username);
            }

            let shuffled = listOfPlayers.sort(() => Math.random() - 0.5);

            let randomWinner = Math.floor(Math.random() * shuffled.length);

            let winner = shuffled[randomWinner];

            const data = {
                GameID: gameID,
                SteamID: winner
            }

            return data;
        }

        else {
            return false;
        }
    
    }

    // needs work i think
    takeProfitAndWithdrawal(gameID) {

        const index = allCFGames.findIndex(game => game.game.gameID == gameID);

        if (index == undefined) {
            return false;
        }

        const chosenGame = allCFGames[index];

        let allSkins = []

        for(let i = 0; i < chosenGame.game.playerOne.skins.length; i++) {
            let entry = {
                name: chosenGame.game.playerOne.skins[i],
                value: chosenGame.game.playerOne.skinsValues[i]
            };

            allSkins.push(entry);
        }

        for(let i = 0; i < chosenGame.game.playerTwo.skins.length; i++) {
            let entry = {
                name: chosenGame.game.playerTwo.skins[i],
                value: chosenGame.game.playerTwo.skinsValues[i]
            };

            allSkins.push(entry);
        }

        let maxValue = 0;
            
        allSkins.forEach(skin => {
            maxValue += skin.value;
        });

        const winnerName = chosenGame.game.playerOne.username == chosenGame.game.winner ? chosenGame.game.playerOne.username : chosenGame.game.playerTwo.username

        if (winnerName.toLowerCase().includes("gammabets")) {
            maxValue *= .05
        }

        else {
            maxValue *= .10
        }

        let highestAttempt = {skins: [], totalVal: 0};

        for(let x = 0; x < 10; x++) {

            let attempt = {
                skins: [],
                totalVal: 0
            };

            let shuffleSkins = allSkins.sort(() => Math.random() - 0.5);

            for (let s = 0; s < shuffleSkins.length; s++) {

                const choice =  shuffleSkins[Math.floor(Math.random() * shuffled.length)];

                if (choice <= maxValue) {
                    attempt.skins.push(choice.name);
                    attempt.totalVal += choice.value;
                }

            }

            if (highestAttempt.totalVal < attempt.totalVal) {
                highestAttempt = attempt;
            }

        }

        return highestAttempt.skins;

    }

    ////////////////

    // Call Methods (runnning functions that handle big task for async functions)
    
    // done
    #callNewGame(gameObject) {

        let newEntry = {};

        newEntry.game = {
            gameID: gameObject.GameID,
            bot: gameObject.BotID,
            gameState: true,
            playerOne: gameObject.Players[0],
            playerTwo: {},
            playerTwoJoining: false,
            playerTwoJoined: false,
            waitingToFlip: false,
            cancelRequest: false,
            winner: "none",
        }

        newEntry.cancelPlayerTwoTrade = false;

        if (gameObject.Red == gameObject.Players[0].userSteamId) {
            newEntry.game.playerOneSide = "red";
            newEntry.game.playerTwoSide = "black";
        }
        
        else {
            newEntry.game.playerOneSide = "black";
            newEntry.game.playerTwoSide = "red";
        }

        newEntry.timer = {defaultTimer: this.mainTimer, flippingTimer: this.countDown};

        newEntry.clock = null;

        newEntry.startClock = function() {

            this.clock = setInterval(() => {

                if (this.game.waitingToFlip && this.game.playerTwoJoined) {

                    if (this.timer.flippingTimer > 0) {
                        this.timer.flippingTimer -= 1
                    }

                    else {
                        console.log("choose winner", this.game.gameID);
                        // emit a winner
                        const data = this.game;
                        cfEvents.emit("chooseCFWinner", data);
                        this.stopClock();
                    }
                }

                else if(this.game.playerTwoJoining) {

                    // continue it
                    if (this.timer.defaultTimer > 0) {

                        this.timer.defaultTimer -= 1;

                    }

                    // cancel trade if it hits 0
                    else {
                        
                        this.stopClock();

                        this.cancelPlayerTwoTrade = true;

                        const tradeID = joiningQueue.findTradeID(this.game.gameID);

                        if(tradeID != false) {

                            const data = {GameID: this.game.gameID, TradeID: tradeID}

                            cfEvents.emit("callCancelCFTrade", data);
                        
                            console.log("Player Two did not accept trade in time, cancel trade for:" + this.game.gameID);

                            this.game.playerTwoJoining = false;

                            this.cancelPlayerTwoTrade = false;

                            cfEvents.emit("secondPlayerTradeCanceled", {GameID: this.game.gameID})

                        }

                        else {
                            console.log("Player Two did not accept trade in time, AND COULD NOT CANCEL TRADE:" + this.game.gameID);
                        }

                    }

                }

                const data = {
                    timer: this.timer,
                    GameID: this.game.gameID,
                };

                cfEvents.emit("cfTimer", data)
            }, 1000)
        }

        // basically resets the clock
        newEntry.stopClock = function() {
            clearInterval(this.clock);
            console.log(this.timer.defaultTimer);
            this.timer.defaultTimer = this.mainTimer;
            this.timer.flippingTimer = this.countDown;
        };

        allCFGames.push(newEntry);

        return newEntry;

    }

    // done
    #callOpponentJoiningGame(gameID, steamID, username, userPicURL) {

        const gameObjIndex = allCFGames.findIndex(obj => {

            if(obj.game.gameID == gameID) {
                return obj;
            }

        });

        if (gameObjIndex != undefined) {

            allCFGames[gameObjIndex].game.playerTwoJoining = true;

            allCFGames[gameObjIndex].startClock();

            joiningQueue.addToQueue(gameID, steamID, username, userPicURL);

            return allCFGames[gameObjIndex];

        }

        else  {
            return console.error("Could not find game in CF Game Handler");
        }
    }

    // needs work
    #callOpponentAcceptedTrade(gameObject) {

        // if this fails, you might need to change this to findIndex

        let gameIndex = allCFGames.findIndex(obj => obj.game.gameID == gameObject.GameID);

        allCFGames[gameIndex].game.playerTwo = gameObject.Players[1];
        allCFGames[gameIndex].game.playerTwoJoined = true;
        allCFGames[gameIndex].game.waitingToFlip = true;

        return allCFGames[gameIndex];

    }

    #callMoveGameToHistory(gameObject) {

        cfHistory.push(gameObject);

        function shiftHistory() {

            cfHistory.shift();

            if (cfHistory.length > 5) {

                shiftHistory();
            }

        }

        if (cfHistory.length > 5) {

            shiftHistory();

        }

    }

    ////////////////

    // Main Methods

    // needs work - maybe
    async createNewGame(gameObject) {

        try {

            let data = await this.#callNewGame(gameObject);

            cfEvents.emit("newCFGame", await data);

        }

        catch (err) {
            console.log("An error occurred when adding a new game to array");
            console.log(err);
        }

    }

    // needs work - maybe
    async opponentJoiningGame(gameID, steamID, username, userPicURL) {

        try {

            let data = await this.#callOpponentJoiningGame(gameID, steamID, username, userPicURL);

            cfEvents.emit("secondPlayerJoiningGame", await data);

        }

        catch(err) {

            console.error(err);
            console.log("An Error Occrred when emitting data to server");

        }

    }

    // needs work - maybe
    opponentAcceptedTrade(gameObject) {

        let data = this.#callOpponentAcceptedTrade(gameObject);

        cfEvents.emit("secondPlayerAccepctedTrade", data);

    }

    async chooseWinner(innerGameObject) {

        try {

            const winnerData = await this.#decideWinner(innerGameObject);

            if (winnerData) {
                cfEvents.emit("cfWinner", winnerData);
            }

            setTimeout(async () => {

                // Move game Object into game history
                try {

                    await this.#callMoveGameToHistory(innerGameObject);

                }

                catch(err) {

                    console.error(err);

                }


            }, 5000);

        }

        catch(err) {

        }
    }

    ////////////////

    // Timer Methods

    // needs work - help
}

module.exports = {CoinFlipHandler, cfEvents, allCFGames, cfHistory, cfGamesTimer, creatingQueue, joiningQueue};