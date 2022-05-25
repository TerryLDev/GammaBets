const TradeOfferManager = require('steam-tradeoffer-manager');

const mongoose = require("mongoose");
const TradeHistory = require('../../models/tradehistory.model');
const CoinFlipGame = require('../../models/coinflipgame.model');
const User = require('../../models/user.model');
const MarketPrice = require('../../models/marketprice.model');

class GameManager {
    
    constructor(botID) {

        this.botID = botID;

    }

    userBetArraySlot(tradeDBObject, dbSkins, userDB) {

        let errorOccured = false;

        let skins = [];

        tradeDBObject.Skins.forEach((skin) => {

            const dbSkinIndex = dbSkins.findIndex(val => skin.name == val["SkinName"]);

            if (dbSkinIndex != undefined && dbSkinIndex > -1) {

                let entry = {
                    name: dbSkins[dbSkinIndex]["SkinName"],
                    id: skin.id,
                    value: dbSkins[dbSkinIndex]["Value"],
                    imageURL: dbSkins[dbSkinIndex]["SkinPictureURL"]
                };

                skins.push(entry);

            }

            else {
                console.log("Index found:", dbSkinIndex)
                console.log("PLEASE FIX THIS PROBLEM");
                console.log("Skin doesn't exsist in our Database");
                errorOccured = true;
            }
        });

        let userBet = {
            username: userDB.Username,
            steamID: tradeDBObject["SteamID"],
            userPicture: userDB.ProfilePictureURL,
            skins: skins,
        };

        if (errorOccured) {
            return false;
        }

        return userBet;

    }

    getCFGameTotal(playerOneSkins, playerTwoSkins) {
        let total = 0;

        playerOneSkins.forEach(skin => {
            total += skin.value
        });
        playerTwoSkins.forEach(skin => {
            total += skin.value
        });
        
        return total;
    }

}

module.exports = {GameManager}