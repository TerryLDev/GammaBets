require("dotenv").config(__dirname + "/.env");
const fs = require("fs");

const CoinFlipGame = require("../../models/coinflipgame.model");
const User = require("../../models/user.model");
const emitter = require('events').EventEmitter;
const cfEvents = new emitter();

let allCFGames = [];
let cfHistory = [];

class CoinFlipHandler {

    defaultTimer = process.env.COIN_FLIP_OPPONENT_JOINING_TIME;
    countDown = process.env.COIN_FLIP_COUNTDOWN_TIME;
    waitTime = process.env.COIN_FLIP_ENDING_WAIT_TIME;

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

    // Updates Methods
    // needs work
    updateJsonGameState(update) {

        allCFGames.forEach(gameObj => {

            if (update.GameID == gameObj.gameID) {

                gameObj.gameState = update.GameState;

            }

        });

    }

    // needs work
    updateJsonWinner(update) {

        // update format
        // update = {GameID: gameID, SteamID: winner}

        allCFGames.forEach(gameObj => {

            if (gameObj.gameID == update.GameID) {
                gameObj.winner = update.SteamID;
            }

        });

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
            playerOneUser: gameObject.Players[0].username,
            playerOneId: gameObject.Players[0].userSteamId,
            playerOnePicture: gameObject.Players[0].userPicture,
            playerOneSkins: gameObject.Players[0].skins,
            playerOneSkinValues: gameObject.Players[0].skinValues,
            playerOneSkinPictures: gameObject.Players[0].skinPictures,
            playerOneState: gameObject.PlayerOneTradeState,
            playerOneSide: "none",
            playerTwoUser: "none",
            playerTwoId: "none",
            playerTwoPicture: "none",
            playerTwoSkins: "none",
            playerTwoSkinValues: "none",
            playerTwoSkinPictures: "none",
            playerTwoState: "none",
            playerTwoSide: "none",
            totalValue: gameObject.TotalValue,
            bot: gameObject.BotID,
            timer: false,
            gameState: gameObject.Status,
            winner: "none",
            wait: parseInt(process.env.COIN_FLIP_ENDING_WAIT_TIME),
            slicerDelay: 3,
            cancelRequest: false
        };

        if (gameObject.Red == gameObject.Players[0].userSteamId) {
            newEntry.playerOneSide = "red";
            newEntry.playerTwoSide = "black";
        }
        
        else {
            newEntry.playerOneSide = "black";
            newEntry.playerTwoSide = "red";
        }

        allCFGames.push(newEntry);

        return newEntry;

    }

    // done
    #callOpponentJoiningGame(gameID, steamID, username, tradeState, userPicURL) {

        let data = {};

        allCFGames.forEach((gameobj) => {

            if (gameobj.gameID == gameID) {

                gameobj.playerTwoState = tradeState;
                gameobj.playerTwoId = steamID;
                gameobj.playerTwoUser = username;
                gameobj.playerTwoPicture = userPicURL;
                gameobj.timer = parseInt(process.env.COIN_FLIP_OPPONENT_JOINING_TIME);

                data.SteamID = steamID;
                data.Username = username;
                data.GameID = gameID;
                data.TradeState = tradeState;
                data.UserPicURL = userPicURL;
                data.PlayerTwoSide = gameobj.playerTwoSide;

            }

        });

        return data;

    }

    // needs work
    #callOpponentAcceptedTrade(gameObject) {

        let data;

        allCFGames.forEach(obj => {

            if (obj.gameID == gameObject.GameID) {

                obj.playerTwoSkins = gameObject.Players[1].skins;
                obj.playerTwoSkinValues = gameObject.Players[1].skinValues;
                obj.playerTwoSkinPictures = gameObject.Players[1].skinPictures;
                obj.playerTwoState = gameObject.PlayerTwoTradeState;
                obj.timer = parseInt(process.env.COIN_FLIP_COUNTDOWN_TIME);

                data.GameID = gameObject.GameID;
                data.PlayerTwoSkins = gameObject.Players[1].skins;
                data.PlayerTwoSkinValues = gameObject.Players[1].skinValues;
                data.PlayerTwoSkinPictures = gameObject.Players[1].skinPictures;
                data.PlayerTwoSide = gameObject.playerTwoSide;

                gameObject.Players[1].skinValues.forEach(val => {

                    obj.totalValue += val;

                });
            }

        });

        return data;

    }

    ////////////////

    // Main Methods

    // needs work
    async createNewGame(gameObject) {

        try {

            let data = await this.#callNewGame(gameObject);

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

            let data = await this.#callOpponentJoiningGame(gameID,steamID, username, tradeState, userPicURL);

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

        let data = [];

        // go through each game in the json list
        if (allCFGames.length > 0) {

            allCFGames.forEach(gameObj => {

                let newEntry = {};

                // checks if game is active
                if (gameObj.gameState == true) {

                    if (gameObj.playerTwoState == "Active") {

                        let getTimer = parseInt(gameObj.timer);

                        if (getTimer > 0) {

                            gameObj.timer = getTimer - 1;

                            newEntry.GameID = gameObj.gameID;
                            newEntry.CurrentTime = gameObj.timer;
                            newEntry.State = "waiting";

                        }

                        else {

                            setTimeout(async () => {

                                let result = await this.#checkCancelation(gameObj.gameID);

                                if (await result) {
                                    cfEvents.emit("cancelCFGame", {GameID: gameObj.gameID});
                                }

                            }, 2500);

                        }
                    }

                    else if (gameObj.playerTwoState == "Accepted") {

                        let getTimer = parseInt(gameObj.timer);

                        if (getTimer > 0) {

                            gameObj.timer = getTimer - 1;

                            newEntry.GameID = gameObj.gameID;
                            newEntry.CurrentTime = gameObj.timer;
                            newEntry.State = "flipping";

                        }

                        else {

                            cfEvents.emit("decideWinner", {
                                GameID: gameObj.gameID,
                                GameState: false
                            });

                        }

                    }

                    data.push(newEntry);

                }

            })

            return data;
        }


        else {

            return false

        }
    }

    // needs work
    async timer() {

        try {

            const result = await this.#updateTimer();

            if (await result != false) {

                cfEvents.emit("cfTimer", result);

            }

        }

        catch(err) {

            console.log("Error Occurred on Timer");
            return console.log(err);

        }

    };

}

module.exports = {CoinFlipHandler, cfEvents, allCFGames, cfHistory};