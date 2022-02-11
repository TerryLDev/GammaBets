require("dotenv").config(__dirname + "/.env");
const fs = require("fs");

const JackpotGame = require('../../models/jackpotgame.model');
const User = require("../../models/user.model");

class JackpotHandler {

    jpTimer = process.env.JACKPOT_TIMER;

    // Calls
	#callCreateNewGame() {

	}

    #callAddPlayerToPot() {

    }

    #callAddToHistory() {

    }

	#callAddPlayerToQueue() {

	}

    #startTimer() {

    }

    // Async Methods
    async addPlayerToPot() {
    }

    async addToHistory() {
    }
    
}

module.exports = {JackpotHandler};

// SteamBot Events
/*
bot.manager.on("sentOfferChanged", (offer, oldState) => {

	if (TradeOfferManager.ETradeOfferState[offer.state] == "Declined") {
		
		TradeHistory.findOneAndUpdate(
			{ TradeID: offer.id },
			{ State: TradeOfferManager.ETradeOfferState[offer.state] },
			{ new: true },
			(err, trade) => {
				if (err) return console.error(err);
				else if (trade == null || trade.SteamID == null) {
					return console.log(
						"Invalid TradeID Lookup or Manual Change"
					);
				} else if (trade.TransactionType == "Withdraw") {
					console.log(
						`Withdraw Trade: ${offer.id} was declined, Please notify user ${trade.SteamID}`
					);
				}
				else if (trade.TransactionType == "Deposit" && trade.GameMode == "Coin Flip") {
					CoinFlipGame.findOne(
						{ GameID: trade.GameID },
						(err, declinedCFGame) => {
							if (err) console.error(err);
							// do somethign with the error
							else {
								if (declinedCFGame.PlayerOneTradeState == "Accepted") {
									coinFlipUpdater.opponentDeclinedTrade(declinedCFGame);

									// let the front end know that it was declined

									let query = {
										PlayerTwoTradeState: undefined,
										PlayerTwoTradeID: undefined,
									};

									if (declinedCFGame.Red == trade.SteamID) {
										query["Red"] = trade.SteamID;
									} else {
										query["Black"] = trade.SteamID;
									}

									CoinFlipGame.updateOne(
										{ GameID: declinedCFGame.GameID },
										{ $set: query },
										(err, doc) => {
											if (err) return console.error(err);
											else {
												console.log(
													"Trade was declined:" +
														trade.id +
														", Game Mode: " +
														declinedCFGame.GameID
												);
											}
										}
									);
								} else {
									console.log(
										"there was an error with a declined trade"
									);
								}
							}
						}
					);
					// take them off of active coin flip game so then someone else can join it
				} else {
					console.log(offer.id + " Trade was Declined");
					io.sockets.emit("jackpotDepositDeclined", trade);
				}
			}
		);
	}

	else if (TradeOfferManager.ETradeOfferState[offer.state] == "Canceled") {
		console.log("Trade was cancel " + offer.id);
		console.log("PLEASE DO SOMETHING WITH THE EVENT");
	}

	else if (TradeOfferManager.ETradeOfferState[offer.state] == "Accepted") {
		
		TradeHistory.findOneAndUpdate(
			{ TradeID: offer.id },
			{ State: TradeOfferManager.ETradeOfferState[offer.state] },
			{ new: true },
			(err, trade) => {

				if (err) return console.error(err);
				
				else if (trade == null || trade.SteamID == null) {
					return console.error(
						"Invalid TradeID Lookup or Manual Change"
					);
				}

				// Not a perm solution 
				// checks if it's a jackpot
				else if (trade.TransactionType == "Deposit" && trade.GameMode == "Jackpot") {

					JackpotGame.findOne({ Status: true }, (err, game) => {
						if (err) return console.error(err);
						else if (game == null) {
							activeJPGameID = Date.now();
							let gameId = String(activeJPGameID);

							let username;
							let userPic;
							let skinVals = [];
							let skinPics = [];
							let totalPot = 0;

							allUsers.forEach((user) => {
								if (user["SteamID"] == trade.SteamID) {
									username = user["Username"];
									userPic = user["ProfilePictureURL"];
								}
							});

							trade.ItemNames.forEach((skin) => {
								skins.forEach((val) => {
									if (skin == val["SkinName"]) {
										skinPics.push(val["SkinPictureURL"]);
										skinVals.push(val["Value"]);
										totalPot += val["Value"];
									}
								});
							});

							let userBet = {
								username: username,
								userSteamId: trade["SteamID"],
								userPicture: userPic,
								skins: trade.ItemNames,
								skinValues: skinVals,
								skinIDs: trade.Items,
								skinPictures: skinPics,
							};

							let fullBetList = [];

							fullBetList.push(userBet);

							JackpotGame.create(
								{
									GameID: gameId,
									Players: fullBetList,
									TotalPotValue: totalPot,
									Status: true,
								},
								(err, jp) => {
									if (err) return console.error(err);
									else {
										currentJPGame = jp;
										io.emit("jackpotLoader", jp);
										console.log("New Jackpot Game");

										TradeHistory.findOneAndUpdate(
											{ TradeID: trade["TradeID"] },
											{ GameID: activeJPGameID },
											{ new: true },
											(err, doc) => {
												if (err)
													return console.error(err);
											}
										);
									}
								}
							);
						}
						
						else {
							let username;
							let userPic;
							let skinVals = [];
							let skinPics = [];
							let totalPot = game.TotalPotValue;

							allUsers.forEach((user) => {
								if (user["SteamID"] == trade.SteamID) {
									username = user["Username"];
									userPic = user["ProfilePictureURL"];
								}
							});

							trade.ItemNames.forEach((skin) => {
								skins.forEach((val) => {
									if (skin == val["SkinName"]) {
										skinPics.push(val["SkinPictureURL"]);
										skinVals.push(val["Value"]);
										totalPot += val["Value"];
									}
								});
							});

							let userBet = {
								username: username,
								userSteamId: trade["SteamID"],
								userPicture: userPic,
								skins: trade.ItemNames,
								skinValues: skinVals,
								skinIDs: trade.Items,
								skinPictures: skinPics,
							};

							JackpotGame.findOneAndUpdate(
								{ GameID: game["GameID"] },
								{
									$push: { Players: userBet },
									$set: { TotalPotValue: totalPot },
								},
								{ new: true },
								(err, jp) => {
									if (err) return console.error(err);
									else {
										console.log(jp);
										io.emit("jackpotLoader", jp);

										if (countDown != true) {
											countDown = true;
										}

										TradeHistory.findOneAndUpdate(
											{ TradeID: trade["TradeID"] },
											{ GameID: activeJPGameID },
											{ new: true },
											(err, doc) => {
												if (err)
													return console.error(err);
											}
										);
									}
								}
							);
						}
					});

					console.log(offer.id + " Trade was Accepted");
				}

				else if (trade.TransactionType == "Deposit" && trade.GameMode == "Coin Flip") {

					CoinFlipGame.findOne({ GameID: trade.GameID }, (err, activeCFGame) => {

						if (err) return console.error(err);
						
						else if (activeCFGame == null) {

							console.log("Invlaid coin flip game look up or something I don't know");

						}

						else if (activeCFGame.Status == true && (activeCFGame.PlayerTwoTradeState == null || activeCFGame.PlayerTwoTradeState == undefined)) {

							// pushes a new coin flip game to the website for people to join

							let username;
							let userPic;
							let skinVals = [];
							let skinPics = [];
							let totalVal = 0;

							allUsers.forEach((user) => {
								if (user["SteamID"] == trade.SteamID) {
									username = user["Username"];
									userPic = user["ProfilePictureURL"];
								}
							});

							if (username == undefined) {
								username = "Unknown";

								// probably should throw an error or something
							}

							trade.ItemNames.forEach((skin) => {
								skins.forEach((val) => {
									if (skin == val["SkinName"]) {
										skinPics.push(
											val["SkinPictureURL"]
										);
										skinVals.push(val["Value"]);
										totalVal += val["Value"];
									}
								});
							});

							let userBet = {
								username: username,
								userSteamId: trade["SteamID"],
								userPicture: userPic,
								skins: trade.ItemNames,
								skinValues: skinVals,
								skinIDs: trade.Items,
								skinPictures: skinPics,
							};

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
							else if (activeCFGame.Status == true &&(activeCFGame.PlayerTwoTradeState != null || activeCFGame.PlayerTwoTradeState != undefined)) {
								// makes the player join the active coin flip game and starts the count down time for it about to flip

								let username;
								let userPic;
								let skinVals = [];
								let skinPics = [];
								let totalVal = activeCFGame.TotalValue;

								allUsers.forEach((user) => {
									if (user["SteamID"] == trade.SteamID) {
										username = user["Username"];
										userPic = user["ProfilePictureURL"];
									}
								});

								if (username == undefined) {
									username = "Unknown";
									// probably should throw an error
								}

								trade.ItemNames.forEach((skin) => {
									skins.forEach((val) => {
										if (skin == val["SkinName"]) {
											skinPics.push(
												val["SkinPictureURL"]
											);
											skinVals.push(val["Value"]);
											totalVal += val["Value"];
										}
									});
								});

								let userBet = {
									username: username,
									userSteamId: trade["SteamID"],
									userPicture: userPic,
									skins: trade.ItemNames,
									skinValues: skinVals,
									skinIDs: trade.Items,
									skinPictures: skinPics,
								};

								CoinFlipGame.findOneAndUpdate(
									{ GameID: activeCFGame.GameID },
									{
										$push: { Players: userBet },
										$set: {
											TotalValue: totalVal,
											PlayerTwoTradeState:
												TradeOfferManager
													.ETradeOfferState[
													offer.state
												],
										},
									}, { new: true },
									(err, cf) => {

										if (err) return console.error(err);
										else {
											console.log(username + " Joined: " + cf.GameID);

											coinFlipUpdater.opponentAcceptedTrade(cf);
										}
									}
								);
							}
						}
					);
				}
			}
		);
	}
});
*/