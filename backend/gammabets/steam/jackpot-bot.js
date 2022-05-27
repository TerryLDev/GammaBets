const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

require('dotenv').config(__dirname + '/.env');

const User = require('../../models/user.model');
const TradeHistory = require('../../models/tradehistory.model');
const Support = require('../../models/support.model');
const MarketPrice = require('../../models/marketprice.model');
const JackpotGame = require('../../models/jackpotgame.model');

const {SteamBot} = require('./steam-bot');

const {JackpotManager} = require("../manager/jackpot-manager");

class JackpotBot extends SteamBot {

	constructor(username, password, twoFactorCode, indentitySecret, sharedSecret, botID) {

    super(username, password, twoFactorCode, indentitySecret, sharedSecret, botID);
		this.jpManager = new JackpotManager();

		this.#cfSteamEventListners();

  }

	// Main Listener

	async #cfSteamEventListners() {

		try {
			
			this.manager.on("sentOfferChanged", (offer, oldState) => {

				if (TradeOfferManager.ETradeOfferState[offer.state] == "Canceled") {

					console.log("Steam User: " + offer.partner + "\nCanceled Trade: " + offer.id);

				}

				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Declined") {

					console.log("Steam User: " + offer.partner + "\nDeclined Trade: " + offer.id);

				}

				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Accepted") {

					console.log("Steam User: " + offer.partner + "\nAccepted Trade: " + offer.id);

					this.jpManager.tradeAccepted(offer, this.skins);

				}

			});

		}

		catch (err) {

			console.log(err);

		}

		// MAIN EVENT FOR GAME FUNCTIONS
		
	}

	////////////////////////////////

	// finds the total value and determines if its meets the pot requirements
	#validateHighStakes(playerSkins) {

		let playerTotal = 0

		playerSkins.forEach(skin => {
			const skinIndex = this.skins.findIndex(botSkin => skin.name == botSkin["SkinName"]);
			playerTotal += this.skins[skinIndex]["Value"];
		})

		if (playerTotal > 1) {
			return true
		}

		else {
			return false
		}

	}

	async joinHighStakesPot(steamID, tradeURL, skins) {

		try {

			if (await this.#validateHighStakes(skins)) {
				this.sendDeposit("High Stakes", "none", skins, steamID, tradeURL, "Joining");
			}

			else {
				return console.log("Can not validate skins player has selected")
			}

		}
		catch (err) {
			return console.error(err);
		}
	}

}

module.exports = {JackpotBot};