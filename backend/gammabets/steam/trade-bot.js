const { SteamBot } = require("./steam-bot");
const TradeManager = require("../manager/trade-manager");
const User = require("../../models/user.model");
const TradeHistory = require("../../models/tradehistory.model");
const TradeService = require("../../models/tradeservice.model");
const TradeOfferManager = require("steam-tradeoffer-manager");

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
		// send trade offer to creator
		// if any error, send alert

		try {

			const userDB = await User.findOne({SteamID: listingObject.steamID});
			const validateOffer = await this.trManager.validateNewListing(listingObject, this.skins, await userDB);

			if (await validateOffer) {

				const totalValue = this.trManager.getListingValue(listingObject.listingSkins, this.skins);

				const listingID = await this.trManager.generateNewListingID();

				// send trade offer to creator
				// log to db
				const offer = await this.manager.createOffer(listingObject.tradeURL);
				this.manager.getUserInventoryContents(listingObject.steamID, 252490, 2, true, (err, inv) => {

					let allSkinsFound = true;

					if (err) {
						return console.error(err);
					}

					else {

						const items = [];

						listingObject.skins.forEach(listSkin => {
							const item = inv.find(item => item.id == listSkin.id);

							if (item) {
								items.push({name: item.market_hash_name, id: item.id});
								offer.addTheirItem(item);
							}

							else {
								allSkinsFound = false;
								return console.log(`Could not find ${desired} in Player's Inventory`);
							}

						});

						offer.setMessage(`Creating Trade Listing on GammaBets.com with ID: ${listingID}`);

						if (allSkinsFound) {
							
							offer.getUserDetails((err, details) => {
								
								// if the getUserDeails function returns an error, return the error and alert the user
								if (err) {
									// alert user
									return console.error(err);
								}
								
								// if the getUserDeails function returns no error, continue
								offer.send((err, status) => {

									if (err) {
										// alert user
										return console.error(err);
									}

									console.log(status, offer.id);

									// log to TradeHistory
									const queryTradeHist = {
										TradeID: offer.id,
										SteamID: listingObject.steamID,
										Skins: items,
										TransactionType: 'Deposit',
										State: TradeOfferManager.ETradeOfferState[offer.state],
										GameMode: "Trade Service",
										GameID: listingID,
										BotID: this.botID,
										Action: "Creating",
									};

									TradeHistory.create(queryTradeHist)
									.then(() => {
										return console.log(`Logged Trade History with ID: ${listingID}`);
									})
									.catch(err => {
										return console.error(err);
									});

									// log to TradeService
									const queryService = {
										ListingID: listingID,
										TradeID: offer.id,
										CreatorSteamID: listingObject.steamID,
										BotID: this.botID,
										ExpiradeAfterDays: listingObject.expireAfterDays,
										ListingMessage: listingObject.message,
										ListingValue: totalValue,
										ListingSkins: items,
										WantedSkins: listingObject.wantedSkins,
										ListingStatus: "Waiting",
									};
									
									TradeService.create(queryService)
									.then(() => {
										return console.log(`Logged Trade Listing with ID: ${listingID}`);
									})
									.catch(err => {
										return console.error(err);
									});

									// push tradeoffer to User
									User.updateOne({SteamID: listingObject.steamID}, {$push: {Trades: offer.id}}, {new: true}, (err, result) => {
										if(err){
											return console.error(err);
										}
										else {
											if(result == null || result == undefined) {
												return console.log("User Doesn't Exist");
											}

											else {
												return console.log(`Pushed New Trade Offer to User with ID: ${offer.id}`);
											}
										}
									});

								});
							});
						}

						else {
							// send alert
							return console.log("Could not find all skins in Player's Inventory");
						}

					}

				});
			}

			else {
				console.log("Listing Failed Validation");
				return false;
			}
		}
		catch(err) {

			return console.error(err);

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