const TradeOfferManager = require('steam-tradeoffer-manager');

const { CoinFlipHandler, joiningQueue, creatingQueue, allCFGames } = require("../handler/coinflip-handler");

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const CoinFlipGame = require('../../models/coinflipgame.model');
const User = require('../../models/user.model');

const { GameManager } = require('./game-manager');
const { SteamID } = require('steam-tradeoffer-manager');

class CoinFlipManager extends GameManager {

    constructor(botID) {

        super(botID);
        this.cfGameHandler = new CoinFlipHandler();
        
    }

    // Second Opponent ACCEPTED their trade and is joining the active coin flip
    #joiningGame(tradeDBObject, skins, gameID) {

        const currentQueue = joiningQueue.getSelectedQueue(gameID);
        const currentGame = allCFGames.find(game => game.game.gameID == gameID);

        if (currentQueue.SteamID == tradeDBObject.SteamID) {
            // this is good

            User.findOneAndUpdate({SteamID: tradeDBObject.SteamID}, {$push: {GamesPlayed: gameID}}, (err, user) => {
                if (err) {
                    return console.error(err);
                }
                
                else if (user == undefined || user == null) {
                    return console.log("User doesn't exist in the DB");
                }

                else {

                    let userBet = this.userBetArraySlot(tradeDBObject, skins, user);

                    const cfTotal = this.getCFGameTotal(currentGame.game.playerOne.skinValues, userBet.skinValues);

                    let query = {
                        $push : {
                            Players: userBet
                        },
                        $set : {
                            PlayerTwoTradeState: tradeDBObject.State,
                            PlayerTwoTradeID: tradeDBObject.TradeID,
                            TotalValue: cfTotal,
                        }
                    }

                    if (currentGame.game.playerTwoSide == "red") {
                        query.$set.Red = tradeDBObject.SteamID;
                    }
                    else {
                        query.$set.Black = tradeDBObject.SteamID;
                    }

                    CoinFlipGame.findOneAndUpdate({GameID: gameID}, query, {new: true}, (err, cfGame) => {
                        if (err) return console.error(err);

                        else {
                            this.cfGameHandler.opponentAcceptedTrade(cfGame);
                        }
                    });

                }
            });
        }

        else {
            return console.log("This user is not apart of the current joining queue");
            // send offer back to them and display an error or something
        }

    }

    // this should create a cfGameDoc and send the game to the handler
    #newGame(tradeDBObject, dbSkins) {

        // gets what side those from the trade offer
        const queue = creatingQueue.getQueue(tradeDBObject.GameID, tradeDBObject.SteamID);

        if (queue) {

            User.findOneAndUpdate({SteamID: tradeDBObject.SteamID}, {$push : {GamesPlayed: queue.GameID}}, {new: true}, (err, user) => {

                if(err) {
                    return console.error(err);
                }

                else {

                    let userBet = this.userBetArraySlot(tradeDBObject, dbSkins, user);
                    const playerArray = [userBet];

                    let query = {
                        GameID: tradeDBObject.GameID,
                        Players: playerArray,
                        PlayerOneTradeState: tradeDBObject.State,
                        PlayerOneTradeID: tradeDBObject.TradeID,
                        BotID: tradeDBObject.BotID,
                        Status: true
                    }

                    if (queue.Side == "red") {
                        query.Red = tradeDBObject.SteamID;
                    }
                    else {
                        query.Black = tradeDBObject.SteamID;
                    }

                    CoinFlipGame.create(query)
                    .then(doc => {
                        this.cfGameHandler.createNewGame(doc);
                        creatingQueue.removeQueue(doc.GameID, tradeDBObject.SteamID);
                    })
                    .catch(err => {
                        return console.log(err);
                    });
                }
            });

        }

        else {
            console.log("could not find queue in creatingQueue");
            // please do something here
        }

    }
    
    tradeCanceled(tradeOfferObject, offerID) {

        // this should update the coin flip in db
        TradeHistory.findOneAndUpdate({TradeID: offerID}, {State: TradeOfferManager.ETradeOfferState[tradeOfferObject.state]}, {new: true}, (err, tradeDoc) => {
            if (err) console.log(err);

            else {
                CoinFlipGame.updateOne({GameID: tradeDoc.GameID}, {$unset : {
                    PlayerTwoTradeID: "",
                    PlayerTwoTradeState: ""
                }}, (err, doc) => {
                    if (err) console.log(err);
                });
            }
        });
        
    }

    tradeDeclined(tradeOfferObject, offerID) {

    }

    tradeAccepted(tradeOfferObject, offerID, dbSkins) {

        TradeHistory.findOneAndUpdate({TradeID: offerID}, {State: TradeOfferManager.ETradeOfferState[tradeOfferObject.state]}, {new: true}, (err, tradeDoc) => {

            if (err) {

                console.log("Could not find trade in DB");
                return console.log(err);

            }

            else if (tradeDoc == null || tradeDoc.SteamID == null) {

                return console.log("Invalid TradeID Lookup or Manual Change");

            }

            else if (tradeDoc.TransactionType == "Deposit") {      
                
                // check if they are joining a game
                if (tradeDoc.Action == "Creating") {
                    this.#newGame(tradeDoc, dbSkins);
                }
                else if (tradeDoc.Action == "Joining") {
                    this.#joiningGame(tradeDoc, dbSkins, tradeDoc.GameID)
                }
            }

            else if (tradeDoc.TransactionType == "Withdraw") {

                console.log("Withdrawal was successfully received \nTradeID: " + offerID + "\nUser: " + tradeOfferObject.partner);

            }

            else {
                console.log("Some error IDK");
            }

        });

    }
    
}

module.exports = {CoinFlipManager};