require("dotenv").config(__dirname + "/.env");
const fs = require("fs");

const CoinFlipGame = require("../../models/coinflipgame.model");
const User = require("../../models/user.model");
const emitter = require('events').EventEmitter;
const cfEvents = new emitter();

let allCFGames = [];
let cfGamesTimer = [];
let cfHistory = [];

class CoinFlipHandler {

    defaultTimer = process.env.COIN_FLIP_OPPONENT_JOINING_TIME;
    countDown = process.env.COIN_FLIP_COUNTDOWN_TIME;

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

    // needs work
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

    // done
    #checkCancelation(gameID) {

        let result;

        allCFGames.forEach(obj => {
            
            if (obj.gameID == gameID) {

                if (obj.playerTwoState == "Accepted") {
                    
                    result = false;
                }

                else if (obj.cancelRequest == true) {

                    result = false;

                }

                else {

                    obj.cancelRequest = true;
                    result = true;
                
                }
            }
        })
        
        return result;

    }

    ////////////////

    // Call Methods (runnning functions that handle big task for async functions)
    
    // done
    #callNewGame(gameObject) {

        let newEntry = {
            gameID: gameObject.GameID,
            bot: gameObject.BotID,
            gameState: true,
            playerOne: gameObject.Players[0],
            playerOneTradeState: gameObject.PlayerOneTradeState,
            playerTwo: {},
            playerTwoTradeState: "none",
            totalValue: gameObject.TotalValue,
            secondPlayerJoining: false,
            waitingToFlip: false,
            cancelRequest: false,
            winner: "none",
        }

        if (gameObject.Red == gameObject.Players[0].userSteamId) {
            newEntry.playerOneSide = "red";
            newEntry.playerTwoSide = "black";
        }
        
        else {
            newEntry.playerOneSide = "black";
            newEntry.playerTwoSide = "red";
        }

        allCFGames.push(newEntry);
        cfGamesTimer.push({gameID: gameObject.GameID, defaultTimer: this.defaultTimer, flippingTimer: this.countDown});

        return newEntry;

    }

    // done
    #callOpponentJoiningGame(gameID, steamID, username, tradeState, userPicURL) {

        let gameObj = allCFGames.find(game => game.gameID == gameID);

        gameObj.timer = parseInt(process.env.COIN_FLIP_OPPONENT_JOINING_TIME);
        gameObj.playerTwo = {
            username: username,
            userSteamId: steamID,
            userPicture: userPicURL,
        }
        gameObj.playerTwoTradeState = tradeState
        gameObj.secondPlayerJoining = true;

    }

    // needs work
    #callOpponentAcceptedTrade(gameObject) {

        let gameObj = allCFGames.find(game => game.gameID == gameID);

        gameObj.playerTwo = gameObject.Players[1];
        gameObj.playerTwo = gameObject.PlayerTwoTradeState;
        gameObj.waitingToFlip = true;

    }

    ////////////////

    // Main Methods

    // needs work
    async createNewGame(gameObject) {

        try {

            this.#callNewGame(gameObject);

            cfEvents.emit("newCFGame", await data);

        }

        catch (err) {
            console.log("An error occurred when adding a new game to the json file");
            console.log(err);
        }

    }

    // needs work
    async opponentJoiningGame(gameID, steamID, username, tradeState, userPicURL) {

        try {

            let data = await this.#callOpponentJoiningGame(gameID, steamID, username, tradeState, userPicURL);

            cfEvents.emit("secondPlayerJoiningCFGame", await data);

        }

        catch(err) {

            console.error(err);
            console.log("An Error Occrred when emitting data to server");

        }

    }

    // needs work
    async opponentAcceptedTrade(gameObject) {

        // oof
        try {

            let data = await this.#callOpponentAcceptedTrade(gameObject);

            cfEvents.emit("secondPlayerAccepctedTrade", await data);

        }
        catch (err) {

        }

    }

    // needs work
    cancelOpponentTrade(gameID) {

        let gameObject;

        allCFGames.forEach(gameObj => {

            if (gameObj.gameID == gameID) {

                gameObject = gameObj

                gameObj.playerTwoUser = "none";
                gameObj.playerTwoId = "none";
                gameObj.playerTwoPicture = "none";
                gameObj.playerTwoSkins = "none";
                gameObj.playerTwoSkinValues = "none";
                gameObj.playerTwoSkinPictures = "none";
                gameObj.playerTwoState = "none";
                gameObj.timer = false;
                gameObj.cancelRequest = false;

            }
        })
    
        return gameObject;

    }

    ////////////////

    // Timer Methods

    // needs work
    #updateTimer() {

        /*
        let newEntry = {
            gameID: gameObject.GameID,
            bot: gameObject.BotID,
            gameState: true,
            playerOne: gameObject.Players[0],
            playerOneTradeState: gameObject.PlayerOneTradeState,
            playerTwo: {},
            playerTwoTradeState: "none",
            totalValue: gameObject.TotalValue,
            secondPlayerJoining: false,
            defaultTimer: this.defaultTimer,
            waitingToFlip: false,
            flippingTimer: this.countDown,
            cancelRequest: false,
            winner: "none",
        }
        */

        allCFGames.forEach(gameObj =>{

            let gameTimer = cfGamesTimer.find(game => gameObj.gameID == game.gameID)

            if(gameObj.waitingToFlip == true && gameObj.playerTwoTradeState == "Accepted") {

                // continue it
                if (gameTimer.flippingTimer > 0) {

                    gameTimer.flippingTimer -= 1

                }

                // stop timer and choose a winner
                else {
                    console.log("choose winner", gameObj.gameID);
                }

            }

            else if(gameObj.secondPlayerJoining) {

                // continue it
                if (gameTimer.defaultTimer > 0) {

                    gameTimer.defaultTimer -= 1;

                }

                // cancel trade if it hits 0
                else {
                    console.log("cancel Trade for " + gameObj.gameID);
                }

            }

            else {
                console.log("yikes the timer brokey")
            }
            
        });

        return cfGamesTimer

    }

    // needs work
    async timer() {

        try {

            let result = await this.#updateTimer();

            if (await result) {

                cfEvents.emit("cfTimer", result);

            }

        }

        catch(err) {

            console.log("Error Occurred on Timer");
            return console.log(err);

        }

    };

}

module.exports = {CoinFlipHandler, cfEvents, allCFGames, cfHistory, cfGamesTimer};