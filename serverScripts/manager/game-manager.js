const TradeOfferManager = require('steam-tradeoffer-manager');

const cfGames = require("../revisedcoinflip");
const cfGameHandler = new cfGames.ActiveCoinFlipGame();

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const CoinFlipGame = require('../../models/coinflipgame.model');
const User = require('../../models/user.model');
const MarketPrice = require('../../models/marketprice.model');

class GameManager {
    constructor(botID) {
        this.botID = botID;
    }

    getPlayerAndSlot(tradeDBObject, dbSkins) {

        User.findOne({SteamID: userSteamID}, (err, user) => {

            if(err) {
                return false;
            }

            else if (user == null || user == undefined) {

                return false;

            }

            else {

                let username = user.Username;
                let userPic = user.ProfilePictureURL;
                let skinVals = [];
                let skinPics = [];

                tradeDBObject.ItemNames.forEach((skin) => {

                    dbSkins.forEach((val) => {

                        if (skin == val["SkinName"]) {

                            skinPics.push(val["SkinPictureURL"]);
                            skinVals.push(val["Value"]);

                        }

                    });
                });

                let userBet = {
                    username: username,
                    userSteamId: tradeDBObject["SteamID"],
                    userPicture: userPic,
                    skins: tradeDBObject.ItemNames,
                    skinValues: skinVals,
                    skinIDs: tradeDBObject.Items,
                    skinPictures: skinPics,
                };

                return userBet;
            }

        });
        
    }

}

module.exports = {GameManager}