const CoinFlipGame = require("../../models/coinflipgame.model");
const TradeOfferManager = require("steam-tradeoffer-manager");

function withdrawSentAndConfirmed(gameID, tradeID, status) {

  CoinFlipGame.updateOne({GameID: gameID}, {WinningsSent: status,
  WinningsTradeID: tradeID}, (err, doc) => {
    if (err) return console.error(err);
    else {
      return console.log(doc);
    }
  });

}

function updateWinner(gameID, winnerSteamID) {
  CoinFlipGame.updateOne({GameID: gameID}, {Winner: winnerSteamID, Status: false}, (err) => {
    if (err) return console.error(err);
    else {
      return console.log("Winner: " + winnerSteamID + "\nGameID: " + gameID + "\nDB Update Complete")
    }
  })
}


module.exports = {withdrawSentAndConfirmed, updateWinner};