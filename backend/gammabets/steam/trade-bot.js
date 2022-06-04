const { SteamBot } = require("./steam-bot");
const { TradeService } = require("../models/tradeservice.model");
const TradeManager = require("../manager/trade-manager");

class TradeBot extends SteamBot {
  constructor(username, password, twoFactorCode, indentitySecret, sharedSecret, botID) {

    super(username, password, twoFactorCode, indentitySecret, sharedSecret, botID);

		this.trManager = new TradeManager();

    this.#cfSteamEventListners();

  }

  async #cfSteamEventListners() {

		try {

			this.manager.on('newOffer', (offer) => {
				console.log("New Offer Received");
				console.log("Is Offer Sent by Bot:", offer.isOurOffer);
				this.declineTradeOffer(offer);
			});
			
			this.manager.on("sentOfferChanged", (offer, oldState) => {

				// Trade sent was canceled
				if (TradeOfferManager.ETradeOfferState[offer.state] == "Canceled") {

					console.log("Steam User: " + offer.partner + "\nCanceled Trade: " + offer.id);

				}

				// Trade sent was declined
				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Declined") {

					console.log("Steam User: " + offer.partner + "\nDeclined Trade: " + offer.id);

				}

				// Trade sent was accepted
				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Accepted") {

					console.log("Steam User: " + offer.partner + "\nAccepted Trade: " + offer.id);

					this.cfManager.tradeAccepted(offer, offer.id, this.skins);

				}

				// Trade sent was countered
				else if (TradeOfferManager.ETradeOfferState[offer.state] == "Countered") {
					console.log("Steam User: " + offer.partner + "\nCountered Trade: " + offer.id);
					TradeHistory.updateOne({TradeID: offer.id}, {State: TradeOfferManager.ETradeOfferState[offer.state]}, (err) => {
						if (err) {
							console.error(err);
						}
					});
				}

			});

		}

		catch (err) {

			console.log(err);

		}
		
	}

  async newListing(listingObject) {
		// validate listing
		// push listing to listing queue
		// send trade offer to creator
		// if any error, send alert

		try {
			const validateOffer = await this.trManager.validateNewListing(listingObject);

			if (await validateOffer) {

			}
		}
		catch(err) {

		}
	}

	async acceptOffer() {
		// validate offer 
		// log offerdata to db
		// send trade offer to second user
		// if any error, send alert
	}

}

module.exports = {TradeBot}