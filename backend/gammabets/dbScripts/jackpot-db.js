const HighStakesJackpot = require("../../models/highstakes.model");

function withdrawSentAndConfirmedHS(gameID, withdrawState, winningsTradeID) {

  HighStakesJackpot.updateOne({GameID: gameID}, {WinningsSent: withdrawState, WinningsTradeID: winningsTradeID}, (err) => {
    if (err) return console.log(err);
    else {
      console.log("Winnings Trade State:", withdrawState);
      return console.log("I think this should work");
    }
  });

}

function updateWinnerHS(gameID, winnerSteamID) {
  HighStakesJackpot.updateOne({GameID: gameID}, {Winner: winnerSteamID, Status: false}, (err) => {

    if (err) return console.log(err);

    else {
      return console.log(`Updated HS Game with Winner: ${winnerSteamID}`);
    }

  });
}

module.exports = {updateWinnerHS, withdrawSentAndConfirmedHS};