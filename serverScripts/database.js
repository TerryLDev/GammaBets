const User = require("../models/user.model");
const TradeHistory = require("../models/tradehistory.model");
const Support = require("../models/support.model");
const MarketPrice = require("../models/marketprice.model");
const CoinFlipGame = require("../models/coinflipgame.model");
const JackpotGame = require("../models/jackpotgame.model");

const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

function verifyIDAndUsername(steamID, username) {
    User.exists({"SteamID": steamID, "Username": username})
        .then(result => {
            if (result == false) {
                return false
            }
            else {
                return true
            }
        })
        .catch(err => {
            if (err) return false
        });
}

module.exports = {verifyIDAndUsername};