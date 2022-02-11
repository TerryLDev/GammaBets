const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

require('dotenv').config(__dirname + '/.env');

const User = require('../../models/user.model');
const TradeHistory = require('../../models/tradehistory.model');
const Support = require('../../models/support.model');
const MarketPrice = require('../../models/marketprice.model');
const CoinFlipGame = require('../../models/coinflipgame.model');

const {CoinFlipHandler, cfEvents} = require("../handler/coinflip-handler");

const { SteamBot } = require("./steam-bot");
const { CoinFlipManager } = require("../manager/coinflip-manager");

class CoinFlipBot extends SteamBot{

    constructor(username, password, twoFactorCode, indentitySecret, sharedSecret, botID) {

        super(username, password, twoFactorCode, indentitySecret, sharedSecret, botID);

		this.cfManager = new CoinFlipManager(this.botID);
		this.cfGameHandler = new CoinFlipHandler();
		this.#cfSteamEventListners();

    }

	////////////////////////

	// Event Listeners

	async #cfSteamEventListners() {

		try {
			
			//////////////////////////////////
			//// NEED TO BE DONE TOMORROW ////
			//////////////////////////////////
			this.manager.on("sentOfferChanged", (offer, oldState) => {

				if (TradeOfferManager.ETradeOfferState[offer.state] == "Canceled") {

					console.log("Steam User: " + offer.partner + "\nCanceled Trade: " + offer.id);

					this.cfManager.tradeCanceled(offer, offer.id);

				}

				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Declined") {

					console.log("Steam User: " + offer.partner + "\nDeclined Trade: " + offer.id);

					this.cfManager.tradeDeclined(offer, offer.id);

				}

				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Accepted") {

					console.log("Steam User: " + offer.partner + "\nAccepted Trade: " + offer.id);

					this.cfManager.tradeAccepted(offer, offer.id, this.skins);

				}

			});

		}

		catch (err) {

			console.log(err);

		}

		// MAIN EVENT FOR GAME FUNCTIONS
		
	}

	////////////////////////

	// Main Methods

	async cancelOpponentCoinFlipTradeOffer(gameID) {

		try {
			await this.#callCancelOpponentCoinFlipTradeOffer(gameID);
		}

		catch(err) {

			console.log(err);

		}
	}

	async joinCFGameAndSendTrade(steamID, username, skins, tradeURL, gameID) {

		try {

			CoinFlipGame.findOne({GameID: gameID}, (err, game) => {
                
				if (err) return console.log(err);

				else if (game.PlayerTwoTradeState == "Active" || game.PlayerTwoTradeState == "Accepted") {

					// alert user with na error message
					console.log('User tried to join an already active game');

				}

				else {

					this.#callJoinCFGameAndSendTrade(game, steamID, username, skins, tradeURL);
					
				}
			})

		}

		catch(err) {

            console.error(err);

		}
			
	}

	// please for the love god fix this mess
	async newCoinFlipTrade(steamID, skins, tradeURL, side, gameID) {

		try {

			await this.#callNewCoinFlipTrade(steamID, skins, tradeURL, side, gameID);

		}

		catch(err) {

			// also alert User

			console.log("An error occurred while creating a new coin flip game");
			return console.log(err);

		}

	}

	////////////////////////

	// Private Methods

	#cfOpponentJoiningQuery(cfGameObj, tradeObj, steamID, username) {

		let pOneSide = "";

		if (cfGameObj.Red == cfGameObj.Players[0].userSteamId) {
			pOneSide = "red";
		}

		else if (cfGameObj.Black == cfGameObj.Players[0].userSteamId) {
			pOneSide = "black";
		}

		else {
			pOneSide = "fuck me";
			console.log("I give it");
		}

		console.log(pOneSide)

		if (pOneSide == "red") {

			CoinFlipGame.findOneAndUpdate(
				{ GameID: cfGameObj.GameID },
				{ $set:
					{PlayerTwoTradeState: TradeOfferManager.ETradeOfferState[tradeObj.state],
					PlayerTwoTradeID: tradeObj.id,
					Black: steamID,}
				}, { new : true }, (err, doc) => {
					if (err) return console.log(err)

					else {

						User.findOne({SteamID: steamID}, (err, user) => {

							if (err) return console.error(err);
							
							else {
								this.cfGameHandler.opponentJoiningGame(doc.GameID, user.SteamID, user.Username, TradeOfferManager.ETradeOfferState[tradeObj.state], user.ProfilePictureURL)
							}

						})
					}
				}
			);
		}

		else if (pOneSide == "black") {

			CoinFlipGame.findOneAndUpdate({ GameID: cfGameObj.GameID },
				{ $set:
					{PlayerTwoTradeState: TradeOfferManager.ETradeOfferState[tradeObj.state],
					PlayerTwoTradeID: tradeObj.id,
					Red: steamID,}
				}, { new: true }, (err, doc) => {
					if (err) return console.log(err)

					else {

						User.findOne({SteamID: steamID}, (err, user) => {
							if (err) return console.error(err);
							else {
								this.cfGameHandler.opponentJoiningGame(doc.GameID, user.SteamID, user.Username, TradeOfferManager.ETradeOfferState[tradeObj.state], user.ProfilePictureURL)
							}
						})
					}
				}
			);

		}

		else {
			console.log("AHHHHHH")
		}
	}

	////////////////////////

	// Calls

	#callNewCoinFlipTrade(steamID, skins, tradeURL, side, gameID) {

		console.log(steamID, skins, tradeURL, side, gameID);

		const offer = this.manager.createOffer(steamID);

		this.manager.getUserInventoryContents(steamID, 252490, 2, true, (err, inv) => {

			if (err) return console.error(err);

			else {

				let itemNames = []

				skins.forEach(desired => {

					const item = inv.find(item => item.assetid == desired);

					if(item) {
						offer.addTheirItem(item);
						itemNames.push(item.market_hash_name)
					}

					else{
						offer.cancel((err) => {
							if (err) return console.log(err)
						});
					}

				})

				let token = tradeURL.split('token=')[1]

				offer.setToken(token)

				offer.send((err, status) => {
					if (err) return console.error(err);

					else {

						console.log(status, offer.id);

						TradeHistory.create({
							TradeID: offer.id,
							SteamID: steamID,
							Items: skins,
							ItemNames: itemNames,
							TransactionType: 'Deposit',
							State: TradeOfferManager.ETradeOfferState[offer.state],
							GameMode: "Coin Flip",
							GameID: gameID,
							BotID: this.botID,
							DateCreated: Date.now()
						})
							.then((result) => {
								
								User.findOneAndUpdate({"SteamID": steamID}, {$push: {"Trades": offer.id} }, (err, doc) => {
									
									if (err) return console.error(err);

									else {

										if (side == 'red') {
											CoinFlipGame.create({
												GameID: gameID,
												PlayerOneTradeState: TradeOfferManager.ETradeOfferState[offer.state],
												PlayerOneTradeID: offer.id,
												Red: steamID,
												BotID: this.botID,
												Status: true,
												DateCreated: Date.now()
											})
											.then((result) => {
												console.log('New Coin Flip game activated Game ID: ' + gameID)
											})
											.catch((err) => {
												if (err) console.error(err);
											});

										}

										else {
											CoinFlipGame.create({
												GameID: gameID,
												PlayerOneTradeState: TradeOfferManager.ETradeOfferState[offer.state],
												PlayerOneTradeID: offer.id,
												Black: steamID,
												BotID: this.botID,
												Status: true,
												DateCreated: Date.now()
											})
											.then((result) => {
												console.log('New Coin Flip game activated Game ID: ' + gameID)
											})
											.catch((err) => {
												if (err) console.error(err);
											});
										}

									}
								});

							})
							.catch((err) => {
								console.error(err);
							});

					}
				})
			}
		})

	}

	// fix this mess, make it async
	#callJoinCFGameAndSendTrade(cfGame, steamID, username, skins, tradeURL) {
		
		const offer = this.manager.createOffer(steamID);

		this.manager.getUserInventoryContents(steamID, 252490, 2, true, (err, inv) => {

			if (err) return console.error(err);

			else {

				let itemNames = []

				skins.forEach(desired => {

					const item = inv.find(item => item.assetid == desired);

					if(item) {
						offer.addTheirItem(item);
						itemNames.push(item.market_hash_name)
					}

					else{
						offer.cancel((err) => {
							if (err) return console.log(err)
						});
					}

				})

				let token = tradeURL.split('token=')[1]

				offer.setToken(token)

				offer.send((err, status) => {
					if (err) return console.error(err);

					else {

						console.log(status, offer.id);

						TradeHistory.create({

							TradeID: offer.id,
							SteamID: steamID,
							BotID: this.botID,
							Items: skins,
							ItemNames: itemNames,
							TransactionType: 'Deposit',
							State: TradeOfferManager.ETradeOfferState[offer.state],
							GameMode: "Coin Flip",
							GameID: cfGame.GameID,
							DateCreated: Date.now()

						})
							.then(async (result) => {

								try {

									await this.#cfOpponentJoiningQuery(cfGame, offer, steamID, username);

								}

								catch (err) {
									
									console.log("An Error occurred while querying the active coin flip");
									console.log(err);

								}

							})

							.catch(err => {

								return console.log(err);

							});

					}
				})
			}
		})
	}

	#callCancelOpponentCoinFlipTradeOffer(gameID) {

		CoinFlipGame.findOne({"GameID": gameID}, (err, game) => {
			
			if (err) return console.error(err);

			else {

				this.manager.getOffer(game.PlayerTwoTradeID, (err, offer) => {

					if (err) return console.log(err)

					else {
						
						offer.cancel((err) => {

							if (err) return console.error(err);

							else {
								CoinFlipGame.updateOne({"GameID": gameID}, {$set: {PlayerTwoTradeState: undefined, PlayerTwoTradeID: undefined}}, { runValidators: true })

								TradeHistory.updateOne({"TradeID": offer.id}, {$set: {State: TradeOfferManager.ETradeOfferState[offer.state]}})
							}
						})
					}
				})
			}
		});
	}

}

module.exports = { CoinFlipBot };