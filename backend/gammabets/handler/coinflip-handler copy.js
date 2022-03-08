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

    buildAndAddGame(gameObject) {
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

        newEntry.startClock = setInterval(() => {
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
                    const data = {
                        timer: this.timer,
                        GameID: this.game.gameID,
                    }
                    cfEvents.emit("cfTimer", data)

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
        }, 1000)

        newEntry.stopClock = function() {
            clearInterval(this.startClock);
        }

        allCFGames.push(newEntry);

        return newEntry;
    }
}

module.exports = {CoinFlipHandler, cfEvents, allCFGames, cfHistory, cfGamesTimer, creatingQueue, joiningQueue};