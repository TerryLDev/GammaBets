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
const JackpotGame = require('../../models/jackpotgame.model');

const coinFlipUpdater = require('../coinflipgame');

const cfGames = require("../revisedcoinflip");
const cfGameHandler = new cfGames.ActiveCoinFlipGame();

class SteamBot {

	loginAttempts = 0;

	constructor(username, password, twoFactorCode) {
		this.username = username;
		this.password = password;
		this.twoFactorCode = twoFactorCode;

		this.client = new SteamUser();
		this.community = new SteamCommunity();
		this.manager = new TradeOfferManager({
			steam: this.client,
			community: this.community,
			language: 'en'
		});

		this.logIntoSteam();
	}

	logIntoSteam() {

		this.client.logOn({accountName: this.username, password: this.password, twoFactorCode: this.twoFactorCode});
		this.loginAttempts++;

		this.client.on('loggedOn', () => {
			console.log('Steam User Logged In')
		});

		this.client.on('webSession', (sessionid, cookies) => {
			this.manager.setCookies(cookies);

			this.community.setCookies(cookies)
			this.community.startConfirmationChecker(3000, process.env.IDENTITY_SECRET);
		})

	}

	sendJPDepositTradeOffer(steamid, itemArray, tradeurl) {

		const offer = this.manager.createOffer(steamid);

		this.manager.getUserInventoryContents(steamid, 252490, 2, true, (err, inv) => {
			if (err) return console.error(err);

			else {
				let itemNames = []

				itemArray.forEach(desired => {
					// might break

					////////////////////////////////
					// double check this in future// 
					////////////////////////////////
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

				let token = tradeurl.split('token=')[1]

				offer.setToken(token)

				offer.send((err, status) => {

					if (err) return console.error(err);

					else {
						
						console.log(status, offer.id);

						// Should log the trade offer to the server
						TradeHistory.create({
							TradeID: offer.id,
							SteamID: steamid,
							BotID: '1',
							Items: itemArray,
							ItemNames: itemNames,
							TransactionType: 'Deposit',
							State: TradeOfferManager.ETradeOfferState[offer.state],
							GameMode: "Jackpot",
							DateCreated: Date.now()
						})
							.then((result) => {
								User.updateOne({"SteamID": steamid}, {$push: {"Trades": offer.id} }, (err, doc) => {
									if (err) return console.error(err);
								});
							})
							.catch((err) => {
								console.error(err);
							});
					}
				});
			}
		})

	}

	sendCoinFlipTradeOfferPlayerOne(steamID, skins, tradeURL, side, gameID) {

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
							BotID: '2',
							Items: skins,
							ItemNames: itemNames,
							TransactionType: 'Deposit',
							State: TradeOfferManager.ETradeOfferState[offer.state],
							GameMode: "Coin Flip",
							GameID: gameID,
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

	cfOpponentJoiningQuery(cfGameObj, tradeObj, steamID, username) {

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
								cfGameHandler.opponentJoiningGame(doc.GameID, user.SteamID, user.Username, TradeOfferManager.ETradeOfferState[tradeObj.state], user.ProfilePictureURL)
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
								cfGameHandler.opponentJoiningGame(doc.GameID, user.SteamID, user.Username, TradeOfferManager.ETradeOfferState[tradeObj.state], user.ProfilePictureURL)
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

	// called from where?
	// your mom
	cancelOpponentCoinFlipTradeOffer(gameID) {

		try {
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
			})
		}

		catch(err) {
			console.log(err);
		}
	}

	// fix this mess, make it async
	sendOpponentTradeOffer(cfGame, steamID, username, skins, tradeURL) {
		
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
							BotID: '2',
							Items: skins,
							ItemNames: itemNames,
							TransactionType: 'Deposit',
							State: TradeOfferManager.ETradeOfferState[offer.state],
							GameMode: "Coin Flip",
							GameID: cfGame.GameID,
							DateCreated: Date.now()

						})
							.then(async (result) => {

								this.cfOpponentJoiningQuery(cfGame, offer, steamID, username);

							})

							.catch(err => {

								return console.log(err);

							});

					}
				})
			}
		})
	}
	
	async joinCFGameAndSendTrade(steamID, username, skins, tradeURL, gameID) {

		try {

			CoinFlipGame.findOne({GameID: gameID}, (err, game) => {
				if (err) return console.log(err);

				else {
					this.sendOpponentTradeOffer(game, steamID, username, skins, tradeURL);
					
				}
			})

		}

		catch(err) {

		}
			
	}

	sendWithdraw(skins, user, callback) {
		const offer = this.manager.createOffer(user.SteamID);

		this.manager.getInventoryContents(252490, 2, true, (err, inv) => {
			if (err) return console.error(err);

			let skinIDs = [];
			let skinNames = [];

			skins.forEach(skin => {
				const item = inv.find(item => item.name == skin);

				if (item) {
					skinIDs.push(item.id);
					skinNames.push(item.name);
					offer.addMyItem(item);
				}

				else {
					offer.cancel((err) => {
						if (err) return callback(err)
					});

					return callback(`Could not find ${skin} in Bot Inventory`)
				}

			});

			let token = user.TradeURL.split('token=')[1]

			offer.setToken(token);

			offer.send((err, status) => {

				if (err) return callback(err);

				else if (status == 'pending') {

					TradeHistory.create({
						TradeID: offer.id,
						SteamID: user['SteamID'],
						BotID: '2',
						Items: skinIDs,
						ItemNames: skinNames,
						TransactionType: 'Withdraw',
						State: TradeOfferManager.ETradeOfferState[offer.state],
						GameMode: 'Jackpot',
						DateCreated: Date.now()
					})
						.then((result) => {

							User.findOneAndUpdate({"SteamID": user.SteamID}, {$push: {"Trades": offer.id} }, 
							(err, doc) => {
								if (err) return callback(err);
							});

							console.log(`Offer #${offer.id} sent, but requires confirmation. Status: ${status}`);

							let idSecret = process.env.IDENTITY_SECRET;

							this.community.acceptConfirmationForObject(idSecret, offer.id, (err) => {
								if (err) return callback(err);

								else {
									return callback(`Withdraw has been sent to ${user.Username}`)
								}
							})
						})
						.catch((err) => {
							if(err) return callback(err);
						});

				}

			})
			
		});
	}
}

module.exports = SteamBot;