const TradeOfferManager = require('steam-tradeoffer-manager');

const {HighStakesHandler, highStakesActiveGame} = require("../handler/high-stakes-handler");
// const {} = require("../handler/low-stakes-handler");
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

    #acceptedLowStakesGame() {

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