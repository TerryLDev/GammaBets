const TradeOfferManager = require('steam-tradeoffer-manager');

const { CoinFlipHandler } = require("../handler/coinflip-handler");

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const CoinFlipGame = require('../../models/coinflipgame.model');
const User = require('../../models/user.model');

const { GameManager } = require('./game-manager');

class CoinFlipManager extends GameManager {

    constructor(botID) {

        super(botID);
        this.cfGameHandler = new CoinFlipHandler();
        
    }

    // Second Opponent accepted their trade and is joining the active coin flip
    #joiningGame(tradeDBObject, offerObject, dbSkins, gameDoc) {

        // needs more work
        User.findOne({SteamID: tradeDBObject.SteamID}, (err, user) => {

            if (err) {

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

                console.log(userBet);
                console.log(TradeOfferManager.ETradeOfferState[offerObject.state]);
                console.log(totalVal);

                CoinFlipGame.findOneAndUpdate({ GameID: gameDoc.GameID }, { $push: { Players: userBet }, $set: {
                    TotalValue: totalVal,
                    PlayerOneTradeState: TradeOfferManager.ETradeOfferState[offerObject.state]
                }}, { new: true }, (err, cf) => {

                    if (err) return console.error(err);

                    else {

                        console.log(cf);

                        console.log("Player Joined a Coin Flip: " + cf.GameID);

                        this.cfGameHandler.opponentAcceptedTrade(cf);

                    }
                });

            }

        });

    }

    // this should create a cfGameDoc and send the game to the handler
    #newGame(tradeDBObject, dbSkins) {

        // gets what side those from the trade offer
        const wSide = this.cfGameHandler.getWaitSide(tradeDBObject.GameID, tradeDBObject.SteamID);

        if (wSide) {

            User.findOneAndUpdate({SteamID: tradeDBObject.SteamID}, {$push : {GamesPlayed: wSide.GameID}}, {new: true}, (err, user) => {

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

                    if (wSide.Side == "red") {
                        query.Red = tradeDBObject.SteamID;
                    }
                    else {
                        query.Black = tradeDBObject.SteamID;
                    }

                    CoinFlipGame.create(query)
                    .then(doc => {
                        this.cfGameHandler.createNewGame(doc);
                        this.cfGameHandler.removeWaitSide(doc.GameID, tradeDBObject.SteamID);
                    })
                    .catch(err => {
                        return console.log(err);
                    });
                }
            });

        }

        else {
            console.log("could not find waitingSide");
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
                    this.#joiningGame()
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