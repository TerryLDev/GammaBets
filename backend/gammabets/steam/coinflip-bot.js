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

				await this.sendDeposit("Coinflip", await cfGame.gameID, skins, steamID, tradeURL, "Joining");

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

		this.cfGameHandler.addWaitSide(gameID, steamID, side);

		this.sendDeposit("Coinflip", gameID, skins, steamID, tradeURL, "Creating");
		
	}

	#checkIfCFGameIsOpen(gameID, steamID) {

		let currentCFGame = allCFGames.find(cfGame => cfGame.gameID == gameID);
		/*
		if (currentCFGame.playerOne.userSteamId == steamID) {
			console.log("User is trying to join their own game");
			return false
		}

		else if (currentCFGame.secondPlayerJoining || currentCFGame.playerTwoTradeState != "none") {
			return false
		}

		else {
			return currentCFGame;
		}
		*/
		return currentCFGame;
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