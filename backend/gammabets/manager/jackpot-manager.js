const TradeOfferManager = require('steam-tradeoffer-manager');

const { HighStakesHandler } = require("../handler/high-stakes-handler");
const { LowStakesHandler } = require("../handler/low-stakes-handler");
const TradeHistory = require('../../models/tradehistory.model');
const HighStakesJackpot = require("../../models/highstakes.model");
const LowStakesJackpot = require("../../models/lowstakes.model");
const User = require('../../models/user.model');

const { GameManager } = require('./game-manager');

class JackpotManager extends GameManager {
    constructor(botID) {

        super(botID);
        this.highStakesHandler = new HighStakesHandler();
        this.lowStakesHandler = new LowStakesHandler();

    }

    // update trade after the bot finds the the gameid
    // This method checks which which kind of pot the trade is meant for (high or low)
    #callTradeAccepted(tradeDoc, dbskins) {

        User.findOne({SteamID: tradeDoc.SteamID}, (err, userDoc) => {

            if (err) {
                return console.log(err);
            }

            else if (userDoc == null || userDoc == undefined) {

                return console.log("User was not found in the User DB");

            }

            else {

                let userBet = this.userBetArraySlot(tradeDoc, dbskins, userDoc);

                if (userBet == false) {
                    console.log("PLEASE FIX THIS PROBLEM");
                    return console.log("Error Occurred while making the userbet");
                }

                else if (tradeDoc.GameMode == "High Stakes") {

                    this.#acceptedHighStakesGame(tradeDoc, userBet);

                }

                else if (tradeDoc.GameMode == "Low Stakes") {

                    this.#acceptedLowStakesGame();

                }

                else {
                    return console.log("Invalid Game Mode");
                }

            }

        })

    }

    #updateTradeDocandUserPlayerGames(tradeDoc, gameDoc) {

        TradeHistory.updateOne({TradeID: tradeDoc.TradeID}, {GameID: gameDoc.GameID}, (err) => {
            if (err) return console.error(err);
            else {
                return console.log(`Updated GameID in TradeDoc: ${tradeDoc.TradeID}`);
            }
        });

        User.updateOne({SteamID: tradeDoc.SteamID}, {$push: {GamesPlayed: gameDoc.GameID}}, (err) => {
            if (err) return console.error(err);
            else {
                return console.log(`Pushed GameID in GamesPlayed for User: ${tradeDoc.SteamID}`);
            }
        })

    }

    #getTotalPlayerVal(playerSkins) {
        let total = 0;
        playerSkins.forEach(skin => total += skin.value);
        return total;
    }

    #acceptedHighStakesGame(tradeDoc, userBet) {
        // check if the pot is spinning
        // (true) if its spinning - add to queue
        if (this.highStakesHandler.checkIfPotIsSpinning()) {
            // if the queue is empty - create new queue
            if (this.highStakesHandler.checkIfQueueEmpty()) {
                const newQueueID = this.highStakesHandler.createGameID();

                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                const query = {
                    GameID: newQueueID,
                    TotalPotValue: totalPlayerValue,
                    Players: [userBet],
                    BotID: tradeDoc.BotID,
                    Status: true,
                    WinningsSent: "Not Sent"
                };

                HighStakesJackpot.create(query)
                .then(doc => {
                    this.highStakesHandler.newQueue(doc);
                    this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                })
                .catch(error => {
                    return console.error(error);
                });
            }
            // else - add to current queue
            else {
                const currentQueueID = this.highStakesHandler.getCurrentQueueID();

                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                HighStakesJackpot.findOneAndUpdate({GameID: currentQueueID}, {$push: { Players: userBet}, $inc: {TotalPotValue: totalPlayerValue} }, {new: true}, (err, doc) => {
                    if (err) return console.error(err);

                    else {
                        console.log("New Player Joining High Stakes QUEUE: " + userBet.username);
                        this.highStakesHandler.addPlayerToQueue(userBet, doc.TotalPotValue);
                        this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                    }
                });
            }
        }

        // (false) else - add to pot
        else {
            // check if pot is empty
            if (this.highStakesHandler.isPotEmpty()) {
                // (true) create new pot
                const newGameID = this.highStakesHandler.createGameID();

                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                const query = {
                    GameID: newGameID,
                    TotalPotValue: totalPlayerValue,
                    Players: [userBet],
                    BotID: tradeDoc.BotID,
                    Status: true,
                    WinningsSent: "Not Sent"
                }

                HighStakesJackpot.create(query)
                .then(doc => {
                    this.highStakesHandler.newGame(doc);
                    this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                })
                .catch(err => {
                    return console.error(err);
                });
            }
            else {
                // (false) add to current pot
                const currentGameID = this.highStakesHandler.getCurrentGameID();
                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                HighStakesJackpot.findOneAndUpdate({GameID: currentGameID}, {$push: { Players: userBet}, $inc: {TotalPotValue: totalPlayerValue} }, {new: true}, (err, doc) => {
                    if (err) return console.error(err);

                    else {
                        console.log("New Player Joining High Stakes POT: " + userBet.username);
                        this.highStakesHandler.addPlayerToGame(userBet, doc.TotalPotValue);
                        this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                    }
                });

            }
        }
    }

    #acceptedLowStakesGame(tradeDoc, userBet) {
        // check if the pot is spinning
        // (true) if its spinning - add to queue
        if (this.lowStakesHandler.checkIfPotIsSpinning()) {
            // if the queue is empty - create new queue
            if (this.lowStakesHandler.checkIfQueueEmpty()) {
                const newQueueID = this.lowStakesHandler.createGameID();

                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                const query = {
                    GameID: newQueueID,
                    TotalPotValue: totalPlayerValue,
                    Players: [userBet],
                    BotID: tradeDoc.BotID,
                    Status: true,
                    WinningsSent: "Not Sent"
                };

                LowStakesJackpot.create(query)
                .then(doc => {
                    this.lowStakesHandler.newQueue(doc);
                    this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                })
                .catch(error => {
                    return console.error(error);
                });
            }
            // else - add to current queue
            else {
                const currentQueueID = this.lowStakesHandler.getCurrentQueueID();

                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                LowStakesJackpot.findOneAndUpdate({GameID: currentQueueID}, {$push: { Players: userBet}, $inc: {TotalPotValue: totalPlayerValue} }, {new: true}, (err, doc) => {
                    if (err) return console.error(err);

                    else {
                        console.log("New Player Joining Low Stakes QUEUE: " + userBet.username);
                        this.lowStakesHandler.addPlayerToQueue(userBet, doc.TotalPotValue);
                        this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                    }
                });
            }
        }

        // (false) else - add to pot
        else {
            // check if pot is empty
            if (this.lowStakesHandler.isPotEmpty()) {
                // (true) create new pot
                const newGameID = this.lowStakesHandler.createGameID();

                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                const query = {
                    GameID: newGameID,
                    TotalPotValue: totalPlayerValue,
                    Players: [userBet],
                    BotID: tradeDoc.BotID,
                    Status: true,
                    WinningsSent: "Not Sent"
                }

                LowStakesJackpot.create(query)
                .then(doc => {
                    this.lowStakesHandler.newGame(doc);
                    this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                })
                .catch(err => {
                    return console.error(err);
                });
            }
            else {
                // (false) add to current pot
                const currentGameID = this.lowStakesHandler.getCurrentGameID();
                const totalPlayerValue = this.#getTotalPlayerVal(userBet.skins);

                LowStakesJackpot.findOneAndUpdate({GameID: currentGameID}, {$push: { Players: userBet}, $inc: {TotalPotValue: totalPlayerValue} }, {new: true}, (err, doc) => {
                    if (err) return console.error(err);

                    else {
                        console.log("New Player Joining Low Stakes POT: " + userBet.username);
                        this.lowStakesHandler.addPlayerToGame(userBet, doc.TotalPotValue);
                        this.#updateTradeDocandUserPlayerGames(tradeDoc, doc);
                    }
                });

            }
        }
    }

    tradeAccepted(tradeOfferObject, dbSkins) {

        TradeHistory.findOneAndUpdate({TradeID: tradeOfferObject.id}, {State: TradeOfferManager.ETradeOfferState[tradeOfferObject.state]}, {new: true}, (err, tradeHisDoc) => {

            if (err) {
                return console.log(err);
            }

            else if (tradeHisDoc == null || tradeHisDoc == undefined) {

                return console.log("Invalid TradeID Lookup or Manual Change");
            }

            else if (tradeHisDoc.TransactionType == "Deposit") {

                this.#callTradeAccepted(tradeHisDoc, dbSkins);

            }

            else if (tradeHisDoc.TransactionType == "Withdraw") {

                return console.log(`Withdraw Complete: ${tradeHisDoc.TradeID}, User: ${tradeHisDoc.SteamID}`);

            }

        });
        
    }

}

module.exports = {JackpotManager};