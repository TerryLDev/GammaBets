const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

require('dotenv').config(__dirname + '/.env');

const User = require('../../models/user.model');
const TradeHistory = require('../../models/tradehistory.model');
const MarketPrice = require('../../models/marketprice.model');

const {CoinFlipHandler, allCFGames, joiningQueue} = require("../handler/coinflip-handler");
const CoinFlipGame = require('../../models/coinflipgame.model');
const CoinFlipDBScripts = require("../dbScripts/coinflip-db");
const JackpotDBScripts = require("../dbScripts/jackpot-db");

class SteamBot {

	loginAttempts = 0;

	constructor(username, password, twoFactorCode, identitySecret, sharedSecret, botID) {

		this.username = username;
		this.password = password;
		this.twoFactorCode = twoFactorCode;
		this.identitySecret = identitySecret;
		this.sharedSecret = sharedSecret;
		this.botID = botID;
		this.skins;

		this.cfGameHandler = new CoinFlipHandler();

		this.client = new SteamUser();
		this.community = new SteamCommunity();
		this.manager = new TradeOfferManager({
			steam: this.client,
			community: this.community,
			language: 'en'
		});

		this.logIntoSteam();
		this.runEventListeners();
		this.getSkins();

	}

	logIntoSteam() {

		this.client.logOn({accountName: this.username, password: this.password, twoFactorCode: this.twoFactorCode});

		this.loginAttemptsCounter(1);

	}

	// get skins and update their values
	getSkins() {

		MarketPrice.find({}, (err, skins) => {

			if (err) return console.log(err);

			else {
				console.log("Skins Loaded: " + this.botID);
				this.skins = skins;
			}

		});

	}

	runEventListeners() {

		this.client.on('loggedOn', () => {
			console.log('Steam User Logged In: ' + this.username)
		});

		this.client.on('webSession', (sessionid, cookies) => {
			this.manager.setCookies(cookies);

			this.community.setCookies(cookies)
			this.community.startConfirmationChecker(3000, this.identitySecret);
		})

		this.client.on("error", (err) => {

			if (err == "Error: RateLimitExceeded") {

				console.log("Bot 1 has exceeded its rate limit");
				this.client.logOff();

			}
		
			if (err == "Error: InvalidPassword") {
		
				if (this.loginAttempts < 5) {
		
					setTimeout(function() {
		
						bot.logIntoSteam();
						console.log("Error: InvalidPassword");
						console.log("Logging in again");
		
					}, 2000);
		
				}
		
				else {

					console.log("Too many 'Error: InvalidPassword' attempts");

				}

			}
		
			else {
				console.log(err)
				console.log("Rip")
			}
			
		});

		this.client.on("steamGuard", (domain, callback, lastCodeWrong) => {

			if (lastCodeWrong) {

				let shared = this.sharedSecret;
				let bot = this.botID;
				console.log("Wrong Code for Bot: " + bot);

				this.loginAttemptsCounter(1);

				setTimeout(function () {

					let code = SteamTotp.generateAuthCode(shared);
					callback(code);
	
				}, 1000 * 30);

			}
		
		});

		this.client.on("tradeResponse", (steamID, response) => {

			console.log(steamID);
			console.log(response);
		
		});

		this.client.on("disconnected", (eresult, msg) => {

			console.log(eresult);
			console.log(msg);

			setTimeout(this.logIntoSteam(), 1500);

		});
		
	}

	loginAttemptsCounter(num) {

		this.loginAttempts+=num;
		console.log("Login Attempts: " + this.loginAttempts + " Bot: " + this.botID);

	}

	// return the trade object
	sendDeposit(gameMode = "", gameID = "", skins, steamID, tradeURL, action) {

		let allSkinsFound = true;

		// acceptable gameMode's = "Coinflip", "High Stakes", "Low Stakes"

		const accpetedGameModes = ["Coinflip", "High Stakes", "Low Stakes"]
		const acceptedActions = ["Joining", "Creating"]

		if (accpetedGameModes.includes(gameMode) == false || acceptedActions.includes(action) == false) {

			console.log("gameMode entered:", gameMode)
			console.log("action entered:", action)
			throw "Either the action or gamemode is invalid";

		}

		const offer = this.manager.createOffer(tradeURL);

		this.manager.getUserInventoryContents(steamID, 252490, 2, true, (err, inv) => {
			
			if (err)  {
				console.log(err);
				return false;
			}

			else {

				let items = []; // an array of skin objects 

				// skins is an array of skin ids
				skins.forEach(desired => {

					const item = inv.find(item => item.id == desired);

					if(item) {

						let entry = {
							name: item.market_hash_name,
							id: item.id
						}

						items.push(entry);

						offer.addTheirItem(item);
					}

					else{
						allSkinsFound = false;
						return console.log(`Could not find ${skin} in Bot Inventory`); // ERROR
					}

				});

				// checks if theres any errors in the trade
				offer.getUserDetails((err, details) => {

					if (err) {
						return console.error(err);
					}

					// checks if all the skins was found
					else if (allSkinsFound) {

						offer.send((err, status) => {
							if (err) {
								console.log(err);
								return false
							}
		
							else {
		
								console.log(status, offer.id);
		
								TradeHistory.create({
									TradeID: offer.id,
									SteamID: steamID,
									Skins: items,
									TransactionType: 'Deposit',
									State: TradeOfferManager.ETradeOfferState[offer.state],
									GameMode: gameMode,
									GameID: gameID,
									BotID: this.botID,
									Action: action,
								})
									.then((result) => {
										
										if (gameMode == "Coinflip" && action == "Joining") {

											joiningQueue.updateTradeID(offer.id, gameID);

										}
		
										User.updateOne({SteamID: steamID}, {$push: {Trades: offer.id}}, {upsert: false}, (err, res) => {
											
											if(err) {
												return console.log(err);
											}
											else {
												console.log(res);
											}
										});
									})
									.catch(err => {
										console.log(err);
										return false;
									})
							}
						});

					}

					else {
						// send alert message to user too
						return console.log("Could not find all items in inventory");
					}
				})
			}
		});

	}

	sendWithdraw(skins, gameMode, gameID, userObject) {

		// const accpetedGameModes = ["Coinflip", "High Stakes", "Low Stakes"]

		let allSkinsFound = true;

		const offer = this.manager.createOffer(userObject.TradeURL);

		this.manager.getInventoryContents(252490, 2, true, (err, inv) => {
			
			if (err) {

				return console.error(err);

			}

			console.log(skins);

			let items = [];

			skins.forEach(skin => {

				const itemIndex = inv.findIndex(item => item.market_hash_name == skin.name);

				if (itemIndex != undefined && itemIndex != -1) {

					let entry = {
						name: inv[itemIndex].market_hash_name,
						id: inv[itemIndex].id
					}

					items.push(entry);

					offer.addMyItem(inv[itemIndex]);

				}

				else {

					allSkinsFound = false;
					return console.log(`Could not find ${skin} in Bot Inventory`); // ERROR

				}

			});

			// checks if theres any errors in the trade
			offer.getUserDetails((err, details) => {

				if (err) {
					return console.error(err);
				}

				else if (allSkinsFound == false && skins.length > 0) {

					return console.log("Could not find all skins for Withdraw Trade Offer");

				}

				else {

					offer.send((err, status) => {

						if (err) return console.error(err);
		
						else {
		
							console.log(status, offer.id);
		
							TradeHistory.create({
								TradeID: offer.id,
								SteamID: userObject['SteamID'],
								BotID: this.botID,
								Skins: items,
								TransactionType: 'Withdraw',
								State: TradeOfferManager.ETradeOfferState[offer.state],
								GameMode: gameMode,
								GameID: gameID,
							})
								.then((result) => {
		
									User.updateOne({"SteamID": userObject.SteamID}, {$push: {Trades: offer.id} }, 
									(err, doc) => {
										if (err) return console.error(err);
									});
		
									console.log(`Offer #${offer.id} sent, but requires confirmation. Status: ${status}`);
		
									this.community.acceptConfirmationForObject(this.identitySecret, offer.id, (err) => {
										if (err) {

											// check if it went through
											this.manager.getOffer(offer.id, (err, tradeOffer) => {

												if (err) {

													if (gameMode == "Coinflip") {

														CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, offer.id, "Error")

													}

													else if (gameMode == "High Stakes") {

														JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, offer.id, "Error");

													}

													return console.error(err);
												}

												else {

													if (TradeOfferManager.ETradeOfferState[tradeOffer.state] == "CreatedNeedsConfirmation") {

														try {

															// try to confirm it again after 30 seconds
															setTimeout(function() {

																this.community.acceptConfirmationForObject(this.identitySecretm, tradeOffer.id, (err) => {

																	if (gameMode == "Coinflip") {

																		if (err) {
																			CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, tradeOffer.id, "Error");
																		}
		
																		else {
																			CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, tradeOffer.id, "Sent");
																		}

																	}

																	else if (gameMode == "High Stakes") {

																		if (err) {
																			JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, tradeOffer.id, "Error");
																		}
		
																		else {
																			JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, tradeOffer.id, "Sent");
																		}

																	}
	
																})
	
															}, 30000);

														}

														catch (err) {

															return console.error(err);
															
														}
														
													}

													else if (TradeOfferManager.ETradeOfferState[tradeOffer.state] == "Active") {

														if (gameMode == "Coinflip") {

															CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, offer.id, "Sent");

														}

														else if (gameMode == "High Stakes") {

															JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, offer.id, "Sent");

														}
														
													}

													else if (TradeOfferManager.ETradeOfferState[tradeOffer.state] == "Accepted") {

														if(gameMode == "Coinflip") {

															CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, offer.id, "Accepted");

														}

														else if (gameMode == "High Stakes") {

															JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, offer.id, "Accepted");

														}

													}

													else {

														if(gameMode == "Coinflip") {

															CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, offer.id, "Error");

														}

														else if (gameMode == "High Stakes") {

															JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, offer.id, "Error");

														}

													}

												}

											});

										}
		
										else {

											if(gameMode == "Coinflip") {
												CoinFlipDBScripts.withdrawSentAndConfirmed(gameID, offer.id, "Sent");
											}

											else if (gameMode == "High Stakes") {
												JackpotDBScripts.withdrawSentAndConfirmedHS(gameID, offer.id, "Sent");
											}

										}

									})
								})
								.catch((err) => {
									if(err) return console.error(err);
								});
		
						}
		
					});

				}

			});
			
		});
	}
}

module.exports = {SteamBot};