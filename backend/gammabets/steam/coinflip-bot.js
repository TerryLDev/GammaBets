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

const {CoinFlipHandler, allCFGames} = require("../handler/coinflip-handler");

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

	async joiningActiveCFGame(steamID, skins, tradeURL, gameID) {
		try {
			let cfGame = await this.#checkIfCFGameIsOpen(gameID, steamID);

			if (await cfGame) {

				await this.#callJoinCFGameAndSendTrade(cfGame, steamID, skins, tradeURL);

			}

			else {
				console.log("User Tried to join a cf game but there was error")
			}
		}
		catch (err) {

			return console.log(err);

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

	#callNewCoinFlipTrade(steamID, skins, tradeURL, side, gameID) {

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

	#checkIfCFGameIsOpen(gameID, steamID) {

		let currentCFGame = allCFGames.find(cfGame => cfGame.gameID == gameID);

		if (currentCFGame.playerOne.userSteamId == steamID) {
			return false
		}

		else if (currentCFGame.secondPlayerJoining || currentCFGame.playerTwoTradeState != "none") {
			return false
		}

		else {
			return currentCFGame;
		}
	}

	// fix this mess, make it async
	#callJoinCFGameAndSendTrade(cfGame, steamID, skins, tradeURL) {
		
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
							GameID: cfGame.gameID,
							DateCreated: Date.now()

						})
							.then(async (result) => {

								try {

									await this.#cfOpponentJoiningLocal(cfGame, offer, steamID);

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

	#cfOpponentJoiningLocal(cfGame, tradeObj, steamID) {
		User.findOneAndUpdate({SteamID: steamID}, {$push: {Trades: tradeObj.id}}, {new: true}, (err, doc) => {
			if (err) {
				return console.log(err);
			}
			else {
				this.cfGameHandler.opponentJoiningGame(cfGame.gameID, steamID, doc.Username, TradeOfferManager.ETradeOfferState[tradeObj.state])
			}
		});
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