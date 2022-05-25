const ServerProfit = require("../../models/serverprofit.model");

function logProfit(skins, gameID, botID) {

  const query = {
    GameID: gameID,
    SkinIDs: skins,
    BotID: botID
  }

  ServerProfit.create(query)
  .then((res) => {

    console.log("Profit Logged:", gameID);

  })
  .catch((err) => {

    return console.error(err);

  })

}

module.exports = {logProfit};