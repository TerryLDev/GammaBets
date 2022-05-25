const TradeOfferManager = require('steam-tradeoffer-manager');

const {HighStakesHandler, highStakesEvents} = require("../handler/high-stakes-handler");
// const {} = require("../handler/low-stakes-handler");

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const HighStakesJackpot = require("../../models/highstakes.model");
const User = require('../../models/user.model');

const { GameManager } = require('./game-manager');

class JackpotManager extends GameManager {
    constructor(botID) {

        super(botID);
        this.highStakesHandler = new HighStakesHandler();

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

                if (tradeDoc.GameMode == "High Stakes") {

                    this.#acceptedHighStakesGame(tradeDoc, userBet);

                }

                else if (tradeDoc.GameMode == "Low Stakes") {

                    // come back to this later
                    // this.#acceptedLowStakesGame();

                }

            }

        })

    }

    #acceptedHighStakesGame(tradeDoc, userBet) {

        // get the total value of the players deposit
        const userTotal = this.userTotalValue(userBet.skinValues);

        // if the pot is spinning, add them to the queue
        if (mainApp.isHighStakesSpinning) {

            // if true, add them to the current queue
            if (this.highStakesHandler.checkQueue()) {

                const queueGameID = mainApp.highStakesQueue.GameID;
                const newQueueTotal = mainApp.highStakesQueue.TotalPotValue + userTotal;

                HighStakesJackpot.findOneAndUpdate({GameID: queueGameID}, { $push: {Players: userBet}, $set: {TotalPotValue: newQueueTotal}}, {new : true}, (err, queuePot) => {
                    if (err) {
                        console.log("Error Occurred while adding player to queue");
                        return console.log(err);
                    }

                    else {
                        this.highStakesHandler.addPlayerToQueue(newQueueTotal, userBet);

                        this.#updatePlayerTradeHistory(tradeDoc.TradeID, queueGameID);
                    }
                });

            }

            // if false, start a new queue and generate a new game in the db
            else {
                //
                const newGameID = this.highStakesHandler.createGameID();
                let playerList = [];
                playerList.push(userBet);

                HighStakesJackpot.create({
                    GameID: newGameID,
                    Players: playerList,
                    TotalPotValue: userTotal,
                    Status: true,
                })
                .then(newQueue => {

                    this.highStakesHandler.createNewQueue(newQueue);

                    this.#updatePlayerTradeHistory(tradeDoc.TradeID, newGameID);

                })
                .catch(err => {

                    return console.log(err);

                });
            }

        }
        
        // if it's not spinnning, check if there's an active game or not
        else {

            // if the game is active, add them to the pot
            if (mainApp.isThereAnActiveHighStakesGame) {

                const newPotValue = mainApp.highStakesActiveGame.TotalPotValue + userTotal;

                HighStakesJackpot.findOneAndUpdate({GameID: mainApp.highStakesActiveGame.GameID}, { $push: {Players: userBet}, $set: {TotalPotValue: newPotValue} }, { new : true }, (err, currentPot) => {

                    if (err) {
                        return console.log(err);
                    }

                    else {
                        console.log(currentPot);
                        this.highStakesHandler.addPlayerToPot(newPotValue, userBet);

                        this.#updatePlayerTradeHistory(tradeDoc.TradeID, mainApp.highStakesActiveGame.GameID);
                    }

                });

            }
            
            // done (maybe)
            // if not, create a new game
            else {

                const newGameID = this.highStakesHandler.createGameID();
                let playerList = [];
                playerList.push(userBet);

                // oof
                HighStakesJackpot.create({
                    GameID: newGameID,
                    TotalPotValue: userTotal,
                    Players: playerList,
                    Status: true
                })
                .then(newPot => {

                    console.log(newPot);

                    this.highStakesHandler.createNewGame(newPot);

                    this.#updatePlayerTradeHistory(tradeDoc.TradeID, newGameID);

                })
                .catch(err => {
                    return console.log(err);
                }) 

            }

        }

    }

    #acceptedLowStakesGame() {

    }

    #updatePlayerTradeHistory(tradeID, gameID) {

        TradeHistory.updateOne({TradeID: tradeID}, {GameID: gameID}, {}, (err, result) => {

            if (err) {
                console.log("Error Occured while updating user's trade history");
                return console.log(err);
            }

            else {
                console.log(result);
            }

        });

    }

    tradeAccepted(offerID, dbSkins) {

        TradeHistory.findOne({TradeID: offerID}, (err, tradeHisDoc) => {

            if (err) {
                return console.log(err);
            }

            else if (tradeHisDoc == null || tradeHisDoc == undefined) {

                return console.log("Invalid TradeID Lookup or Manual Change");
            }

            else {

                this.#callTradeAccepted(tradeHisDoc, dbSkins)

            }

        });
        
    }

}

module.exports = {JackpotManager};