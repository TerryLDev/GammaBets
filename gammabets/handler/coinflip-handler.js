require("dotenv").config(__dirname + "/.env");
const fs = require("fs");

const CoinFlipGame = require("../../models/coinflipgame.model");
const User = require("../../models/user.model");
const emitter = require('events').EventEmitter;
const cfEvents = new emitter();

class CoinFlipHandler {

    defaultTimer = process.env.COIN_FLIP_OPPONENT_JOINING_TIME;
    countDown = process.env.COIN_FLIP_COUNTDOWN_TIME
    waitTime = process.env.COIN_FLIP_ENDING_WAIT_TIME

    findCFBot(gameID) {
        CoinFlipGame.findOne({GameID: gameID}, (err, cf) => {

            if (err) return console.log(err);

            else {

                return cf.BotID

            }

        })
    }

    // Pulling parsed game json

    // done
    gameJson() {

        let rawJson = fs.readFileSync(`${__dirname}/cf-games.json`, {encoding: "utf-8"});
        const parsedJson = JSON.parse(rawJson);
        return parsedJson;

    }

    // done
    #editJson(modifiedJson) {

        fs.writeFileSync(`${__dirname}/cf-games.json`, JSON.stringify(modifiedJson));

    }

    // Updates Methods
    // needs work
    updateJsonGameState(update) {

        let modifier = this.gameJson();

        modifier.forEach(gameObj => {

            if (update.GameID == gameObj.gameID) {

                gameObj.gameState = update.GameState;

            }

        });

        this.#editJson(modifier);

    }

    // needs work
    updateJsonWinner(update) {

        // update format
        // update = {GameID: gameID, SteamID: winner}

        let modifier = this.gameJson();

        modifier.forEach(gameObj => {
            if (gameObj.gameID == update.GameID) {
                gameObj.winner = update.SteamID;
            }
        });

        this.editJson(modifier);

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

    // IDK yet
    #checkCancelation(gameID) {

        let modifier = this.gameJson();

        modifier.forEach(obj => {
            if (obj.gameID == gameID) {
                if (obj.playerTwoState == "Accepted") {
                    return false;
                }

                else {
                    return true;
                }
            }
        })

    }

    ////////////////

    // Call Methods (runnning functions that handle big task for async functions)
    
    // needs work
    #callNewGame(gameObject) {

        let modifier = this.gameJson();

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
        };

        if (gameObject.Red == "" || gameObject.Red == undefined) {
            newEntry.playerOneSide = "black";
            newEntry.playerTwoSide = "red";
        }
        
        else {
            newEntry.playerOneSide = "red";
            newEntry.playerTwoSide = "black";
        }

        modifier.push(newEntry);

        this.#editJson(modifier);

        return newEntry;

    }

    // needs work
    #callOpponentJoiningGame(gameID, steamID, username, tradeState, userPicURL) {

        let modifier = this.gameJson();
        let data = {};

        modifier.forEach((gameobj) => {

            if (gameobj.gameID == gameID) {

                gameobj.playerTwoState = tradeState;
                gameobj.playerTwoId = steamID;
                gameobj.playerTwoUser = username;
                gameobj.playerTwoPicture = userPicURL;
                gameobj.timer = process.env.COIN_FLIP_OPPONENT_JOINING_TIME;

                data.SteamID = steamID;
                data.Username = username;
                data.GameID = gameID;
                data.TradeState = tradeState;
                data.UserPicURL = userPicURL;
                data.PlayerTwoSide = gameobj.playerTwoSide;

            }

        });

        this.#editJson(modifier);

        return data;

    }

    #callOpponentAcceptedTrade(gameObject) {

        let modifier = this.gameJson();

        let data = {};

        modifier.forEach(obj => {

            if (obj.gameID == gameObject.GameID) {

                obj.playerTwoSkins = gameObject.Players[1].skins;
                obj.playerTwoSkinValues = gameObject.Players[1].skinValues;
                obj.playerTwoSkinPictures = gameObject.Players[1].skinPictures;
                obj.playerTwoState = gameObject.PlayerTwoTradeState;
                obj.timer = "Flipping in... " + process.env.COIN_FLIP_COUNTDOWN_TIME;

                data.GameID = gameObject.GameID;
                data.PlayerTwoSkins = gameObject.Players[1].skins;
                data.PlayerTwoSkinValues = gameObject.Players[1].skinValues;
                data.PlayerTwoSkinPictures = gameObject.Players[1].skinPictures;
                data.Timer = "Flipping in... " + process.env.COIN_FLIP_COUNTDOWN_TIME;

                gameObject.Players[1].skinValues.forEach(val => {

                    obj.totalValue += val;

                });
            }

        });

        this.#editJson(modifier);
        return data;

    }

    ////////////////

    // Main Methods

    // needs work
    async createNewGame(gameObject) {

        try {
            const data = await this.#callNewGame(gameObject);

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
    async opponentAcceptedTrade(cf) {

        // oof
        try {

            let data = await this.#callOpponentAcceptedTrade(cf);

            cfEvents.emit("secondPlayerAccepctedTrade", data);

        }
        catch (err) {

        }

    }

    // needs work
    cancelOpponentTrade(gameID) {

        let modifier = this.gameJson();

        let gameObject;

        modifier.forEach(gameObj => {

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

            }
        })
    
        this.#editJson(modifier);
        return gameObject;

    }

    ////////////////

    // Timer Methods

    // needs work
    #updateTimer() {

        let modifier = this.gameJson();

        let data = [];

        // go through each game in the json list
        if (modifier.length > 0) {

            modifier.forEach(gameObj => {

                let newEntry = {};

                // checks if game is active
                if (gameObj.gameState == true) {

                    // checks if the timer is a int (waiting for opponent to accept trade)
                    if (typeof(gameObj.timer) == "number") {

                        if (gameObj.timer == 0) {

                            // cancel trade offer sent to opponent
                            setTimeout(async () => {

                                let result = await this.#checkCancelation(gameObj.gameID);

                                if (await result) {
                                    cfEvents.emit("cancelCFGame", {GameID: gameObj.gameID});
                                }

                            }, 2500);

                        }

                        else {

                            gameObj.timer--;

                            newEntry.GameID = gameObj.gameID;
                            newEntry.CurrentTime = gameObj.timer;
                            
                        }

                    }

                    // if the timer is a string
                    // this means the coin is counting down for the flip
                    else if (typeof(gameObj.timer) == "string") {

                        let currentFlipTime = parseInt(gameObj.timer.split("Flipping in... ")[1]);

                        if (currentFlipTime >= 0) {

                            currentFlipTime--;
                            newTime = "Flipping in... " + currentFlipTime;

                            gameObj.timer = newTime;

                            newEntry.GameID = gameObj.gameID;
                            newEntry.CurrentTime = gameObj.timer;

                        }

                        else {

                            // emit event to decide a winner
                            cfEvents.emit("decideWinner", {

                                GameID: gameObj.gameID,
                                GameState: false

                            });
                            

                        }

                    }

                    data.push(newEntry);

                }

            })

            this.#editJson(modifier);
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

                cfEvents.emit("timer", result);

            }

        }

        catch(err) {

            console.log("Error Occurred on Timer");
            return console.log(err);

        }

    };

    ////////////////

}

module.exports = {CoinFlipHandler, cfEvents};