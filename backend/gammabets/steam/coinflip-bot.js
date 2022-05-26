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

const {CoinFlipHandler, allCFGames, creatingQueue, joiningQueue} = require("../handler/coinflip-handler");

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
			
			this.manager.on("sentOfferChanged", (offer, oldState) => {

				// Trade sent was canceled
				if (TradeOfferManager.ETradeOfferState[offer.state] == "Canceled") {

					console.log("Steam User: " + offer.partner + "\nCanceled Trade: " + offer.id);

					this.cfManager.tradeCanceled(offer, offer.id);

				}

				// Trade sent was declined
				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Declined") {

					console.log("Steam User: " + offer.partner + "\nDeclined Trade: " + offer.id);

					this.cfManager.tradeDeclined(offer, offer.id);

				}

				// Trade sent was accepted
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

	// Skin List

	#makeSkinIDList(skins) {
		let skinIDs = [];

		skins.forEach(skin => skinIDs.push(skin.id));

		return skinIDs;
	}

	// Main Methods

	async cancelOpponentCoinFlipTradeOffer(tradeID) {

		try {

			await this.#callCancelOpponentCoinFlipTradeOffer(tradeID);

		}

		catch(err) {

			console.log(err);

		}
	}

	joiningActiveCFGame(steamID, skins, tradeURL, gameID) {
		try {

			let cfGame = this.#checkCFGame(gameID, steamID);

			if (cfGame) {

				const skinIDs = this.#makeSkinIDList(skins);

				this.sendDeposit("Coinflip", cfGame.game.gameID, skinIDs, steamID, tradeURL, "Joining");

				User.findOne({SteamID: steamID}, (err, user) => {
					if (err) return console.error(err);

					else if (user == undefined || user == null) {
						return console.log("User doesn't exsist in DB");
					}
					
					else {
						this.cfGameHandler.opponentJoiningGame(gameID, steamID, user.Username, user.ProfilePictureURL);
					}
				});

			}

			else {
				console.log("User Tried to join a cf game but there was error")
			}
		}
		catch (err) {

			return console.log(err);

		}
	}

	// please for the love god fix this mess - I think it's better
	async newCoinflip(steamID, skins, tradeURL, side, gameID) {

		try {

			const skinIDs = await this.#makeSkinIDList(skins);

			await this.sendDeposit("Coinflip", gameID, skinIDs, steamID, tradeURL, "Creating");

			creatingQueue.addToQueue(gameID, steamID, side);

		}

		catch(err) {

			// also alert User

			console.log("An error occurred while creating a new coin flip game");
			return console.log(err);

		}

	}

	////////////////////////

	// Private Methods

	#checkCFGame(gameID, steamID) {

		let checkQueue = joiningQueue.checkSelectedQueue(gameID);
		
		if (checkQueue) {
			let currentCFGame = allCFGames.find(game => game.game.gameID == gameID);

			if (currentCFGame.game.playerOne.userSteamId == steamID) {
				console.log("User tried to join his own coinflip");
				return false;
			}
			else {
				return currentCFGame;
			}
		}

		else {
			return false;
		}
	}

	#callCancelOpponentCoinFlipTradeOffer(tradeID) {

		this.manager.getOffer(tradeID, (err, offer) => {

			if (err) return console.log(err)

			else {
				
				offer.cancel((err) => {

					if (err) {
						console.log("An error while tring to cancel trade offer");
						return console.error(err);
					}

					else {

						TradeHistory.updateOne({"TradeID": offer.id}, {$set: {State: TradeOfferManager.ETradeOfferState[offer.state]}});

					}
				})
			}
		});
	}

}

module.exports = { CoinFlipBot };