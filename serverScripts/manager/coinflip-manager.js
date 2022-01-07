const TradeOfferManager = require('steam-tradeoffer-manager');

const cfGames = require("../revisedcoinflip");
const cfGameHandler = new cfGames.ActiveCoinFlipGame();

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const CoinFlipGame = require('../../models/coinflipgame.model');
const User = require('../../models/user.model');
const MarketPrice = require('../../models/marketprice.model');

const { GameManager } = require('./game-manager');

class CoinFlipManager extends GameManager {

    constructor(botID) {

        super(botID);
        
    }

    // Second Opponent accepted their trade and is joining the active coin flip
    joiningGame() {

    }

    // (call) Player is creating a new coin flip game
    async callNewGame(tradeDBObject, dbSkins) {

        // ahhhhhh
        // let user = await this.getPlayerAndSlot(tradeDBObject, dbSkins);

        let fullBetList = [];

        fullBetList.push(userBet);

        CoinFlipGame.findOneAndUpdate(
            { GameID: activeCFGame.GameID },
            {
                $set: {
                    Players: fullBetList,
                    TotalValue: totalVal,
                    PlayerOneTradeState: TradeOfferManager.ETradeOfferState[offer.state]
                },
            }, { new: true }, (err, cf) => {

                if (err) return console.error(err);

                else {

                    console.log("New Coin Flip game was created: " + cf.GameID);

                    cfGameHandler.createNewGame(cf);

                }
            }
        );

    }

    // async method to to wait for all details
    newGame(tradeDBObject, dbSkins) {

        this.callNewGame(tradeDBObject, dbSkins);

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
                            this.joiningGame()

                        }

                        else if (gameDoc.PlayerTwoTradeState == "Accepted" && gameDoc.PlayerTwoTradeID == offerID) {

                            // Error

                        }

                        else {

                            // Someone is create a new game
                            this.newGame(tradeDoc, dbSkins);

                        }

                    }

                });

            }

            else if (tradeDoc.TransactionType == "Withdraw") {

                console.log("Withdrawal was successfully received \nTradeID: " + offerID + "\nUser: " + tradeOfferObject.partner);

            }

        });

    }
    
}

module.exports = {CoinFlipManager};