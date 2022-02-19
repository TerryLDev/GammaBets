const emitter = require('events').EventEmitter;
const alertEvents = new emitter();

class AlertCenter {

    sentTradeLink(steamID, tradeID, gameID = "") {
        const link = "https://steamcommunity.com/tradeoffer/" + tradeID;

        const data = {
            tradeLink: link,
            steamID: steamID,
            gameID: gameID,
        }

        alertEvents.emit("tradeLink", data)
    }

    failedTradeOffer(steamID) {
        const data = {steamID: steamID};

        alertEvents.emit("tradeLink", data);
    }
}

module.exports = {AlertCenter, alertEvents};