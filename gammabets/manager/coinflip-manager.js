const TradeOfferManager = require('steam-tradeoffer-manager');

const { CoinFlipHandler, cfEvents } = require("../handler/coinflip-handler");

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const CoinFlipGame = require('../../models/coinflipgame.model');
const User = require('../../models/user.model');
const MarketPrice = require('../../models/marketprice.model');

const { GameManager } = require('./game-manager');

class CoinFlipManager extends GameManager {

    constructor(botID) {

        super(botID);
        this.cfGameHandler = new CoinFlipHandler();
        
    }

    // Second Opponent accepted their trade and is joining the active coin flip
    #joiningGame(tradeDBObject, dbSkins, gameDoc) {

        // needs more work
        User.findOne({SteamID: tradeDBObject.SteamID}, (err, user) => {

            if(err) {
                console.log('an error');
                console.log(err);
                return false;
            }

            else if (user == null || user == undefined) {

                console.log('no user found');
                return false;

            }

            else {

                let userBet = this.userBetArraySlot(tradeDBObject, dbSkins, user);

                let totalVal = gameDoc.TotalValue;

                userBet.skinValues.forEach(val => {

                    totalVal += val;

                });

                CoinFlipGame.findOneAndUpdate({ GameID: gameDoc.GameID }, { $push: { Players: userBet }, $set: {
                    TotalValue: totalVal,
                    PlayerOneTradeState: tradeDBObject.State
                }}, { new: true }, (err, cf) => {

                    if (err) return console.error(err);

                    else {

                        console.log("New Coin Flip game was created: " + cf.GameID);

                        this.cfGameHandler.opponentAcceptedTrade(cf);

                    }
                });

            }

        });

    }

    // async method to to wait for all details
    #newGame(tradeDBObject, dbSkins, gameDoc) {

        User.findOne({SteamID: tradeDBObject.SteamID}, (err, user) => {

            if(err) {
                console.log('an error');
                console.log(err);
                return false;
            }

            else if (user == null || user == undefined) {

                console.log('no user found');
                return false;

            }

            else {

                let userBet = this.userBetArraySlot(tradeDBObject, dbSkins, user);

                let fullBetList = [];
                fullBetList.push(userBet);

                let totalVal = 0;

                userBet.skinValues.forEach(val => {

                    totalVal += val;

                });

                CoinFlipGame.findOneAndUpdate({ GameID: gameDoc.GameID }, { $set: {
                        Players: fullBetList,
                        TotalValue: totalVal,
                        PlayerOneTradeState: tradeDBObject.State
                    }}, { new: true }, (err, cf) => {

                        if (err) return console.error(err);

                        else {

                            console.log("New Coin Flip game was created: " + cf.GameID);

                            this.cfGameHandler.createNewGame(cf);

                        }
                    }
                );

            }

        });

    }

    tradeCanceled(tradeOfferObject, offerID) {

        console.log(tradeOfferObject);
        console.log(offerID);
        
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

                return console.error("Invalid TradeID Lookup or Manual Change");

            }

            else if (tradeDoc.TransactionType == "Deposit") {

                CoinFlipGame.findOne({GameID: tradeDoc.GameID}, (err, gameDoc) => {

                    if (err) {

                        console.log("An Error Occurred when looking up Coin Flip DB game");
                        return console.log(err);

                    }

                    else if (gameDoc.Status == true) {

                        // check if it's an active game
                        if ((gameDoc.PlayerTwoTradeState == "Active" || gameDoc.PlayerTwoTradeState == "Sent") && gameDoc.PlayerTwoTradeID == offerID) {

                            // oof
                            this.#joiningGame(tradeDoc, dbSkins, gameDoc);

                        }

                        else if (gameDoc.PlayerTwoTradeState == "Accepted" && gameDoc.PlayerTwoTradeID == offerID) {

                            // Error

                        }

                        else {

                            // Someone is create a new game
                            this.#newGame(tradeDoc, dbSkins, gameDoc);

                        }

                    }

                });

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