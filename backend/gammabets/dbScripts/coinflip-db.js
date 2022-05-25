const CoinFlipGame = require("../../models/coinflipgame.model");
const TradeOfferManager = require("steam-tradeoffer-manager");

function withdrawSentAndConfirmed(gameID, tradeID, status) {

  CoinFlipGame.updateOne({GameID: gameID}, {WinningsSent: status,
  WinningsTradeID: tradeID, Status: false}, (err, doc) => {
    if (err) return console.error(err);
    else {
      return console.log(doc);
    }
  });

}


module.exports = {withdrawSentAndConfirmed,};