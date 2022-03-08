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

    }
    
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
    }
};

class CoinFlipHandler {

    defaultTimer = parseFloat(process.env.COIN_FLIP_OPPONENT_JOINING_TIME);
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

            if (obj.gameID == gameID) {

                bot = obj.bot;

            }

        });

        return bot;

    }

    ////////////////

    // Winner methods

    // needs work - A lot of work
    decideWinner(gameID) {

        CoinFlipGame.findOne({GameID: gameID}, (err, cf) => {

            if (err) return err;

            else {

                let listOfPlayers = [];

                cf.Players.forEach((player) => {

                    let playerTotalVal = 0;

                    player["skinValues"].forEach((val) => {

                        playerTotalVal += val;

                    });

                    for (let i = 0; i < playerTotalVal; i++) {

                        listOfPlayers.push(player.userSteamId);
                    }

                });

                let shuffled = listOfPlayers.sort(() => Math.random() - 0.5);

                let randomWinner = Math.floor(Math.random() * shuffled.length);

                let winner = shuffled[randomWinner]

                const data = {
                    GameID: gameID,
                    SteamID: winner
                }

                return data;
            }

        });
    
    }

    // needs work
    takeProfitAndWithdrawal() {
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

        if (gameObject.Red == gameObject.Players[0].userSteamId) {
            newEntry.game.playerOneSide = "red";
            newEntry.game.playerTwoSide = "black";
        }
        
        else {
            newEntry.game.playerOneSide = "black";
            newEntry.game.playerTwoSide = "red";
        }

        newEntry.timer = {defaultTimer: this.defaultTimer, flippingTimer: this.countDown};

        newEntry.clock = null;

        newEntry.startClock = function() {

            this.clock = setInterval(() => {

                if (this.game.waitingToFlip && this.game.playerTwoJoined) {

                    if (this.timer.flippingTimer > 0) {
                        this.timer.flippingTimer -= 1
                    }

                    else {
                        console.log("choose winner", this.gameID);
                        // emit a winner
                    }
                }

                else if(this.game.playerTwoJoining) {

                    // continue it
                    if (this.timer.defaultTimer > 0) {

                        this.timer.defaultTimer -= 1;

                    }

                    // cancel trade if it hits 0
                    else {
                        /*
                        cfEvents.emit("cancelCFGame", {GameID: gameObj.gameID});
                        this.cancelOpponentTrade(gameObj.gameID);
                        */
                        console.log("cancel Trade for " + this.gameID);

                    }

                }

                const data = {
                    timer: this.timer,
                    GameID: this.game.gameID,
                };

                cfEvents.emit("cfTimer", data)
            }, 1000)
        }

        newEntry.stopClock = () => {
            clearInterval(this.clock);
            this.timer.defaultTimer = this.defaultTimer;
            this.timer.flippingTimer = this.countDown;
        };

        allCFGames.push(newEntry);

        return newEntry;

    }

    // done
    #callOpponentJoiningGame(gameID, steamID, username, userPicURL) {

        let gameObj = allCFGames.find(obj => obj.game.gameID == gameID);
        
        gameObj.game.playerTwoJoining = true;

        gameObj.startClock();

        joiningQueue.addToQueue(gameID, steamID, username, userPicURL);

        return gameObj;

    }

    // needs work
    #callOpponentAcceptedTrade(gameObject) {

        // if this fails, you might need to change this to findIndex

        let gameObj = allCFGames.find(obj => obj.game.gameID == gameObject.GameID);

        gameObj.game.playerTwo = gameObject.Players[1];
        gameObj.game.playerTwoJoined = true;
        gameObj.game.waitingToFlip = true;

        joiningQueue.removeSelectedQueue(gameObject.GameID);

        return gameObj;

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

            cfEvents.emit("secondPlayerJoiningCFGame", await data);

        }

        catch(err) {

            console.error(err);
            console.log("An Error Occrred when emitting data to server");

        }

    }

    // needs work - maybe
    async opponentAcceptedTrade(gameObject) {

        // oof
        try {

            let data = await this.#callOpponentAcceptedTrade(gameObject);

            cfEvents.emit("secondPlayerAccepctedTrade", await data);

        }
        catch (err) {

        }

    }

    // needs work - maybe
    cancelOpponentTrade(gameID) {

        let currentGame = allCFGames.find(game => game.gameID == gameID);

        currentGame.playerTwoJoining = false;
        joiningQueue.removeSelectedQueue(gameID);

        cfEvents.emit("secondPlayerCancelTrade", currentGame);

    }

    ////////////////

    // Timer Methods

    // needs work - help
}

module.exports = {CoinFlipHandler, cfEvents, allCFGames, cfHistory, cfGamesTimer, creatingQueue, joiningQueue};