const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

require('dotenv').config(__dirname + '/.env');

const User = require('../models/user.model');
const TradeHistory = require('../models/tradehistory.model');
const Support = require('../models/support.model');
const MarketPrice = require('../models/marketprice.model');
const CoinFlipGame = require('../models/coinflipgame.model');
const JackpotGame = require('../models/jackpotgame.model');


class SteamBot {

	constructor(logOnOptions) {
		this.client = new SteamUser();
		this.community = new SteamCommunity();
		this.manager = new TradeOfferManager({
		steam: this.client,
		community: this.community,
		language: 'en'
		});

		this.logOn(logOnOptions);
	}

	logOn(logOnOptions) {

		this.client.logOn(logOnOptions);

		this.client.on('loggedOn', () => {
			console.log('Steam User Logged In')
		});

		this.client.on('webSession', (sessionid, cookies) => {
			this.manager.setCookies(cookies);

			this.community.setCookies(cookies)
			this.community.startConfirmationChecker(3000, process.env.IDENTITY_SECRET);
		})

		// Function called to get the prices for all the skins in rust that are tradable on the market place

		///////////////////////////
		// REMEMBER TO UNCOMMENT //
		///////////////////////////

		/*
		
		this.community.marketSearch({appid: 252490}, (err, items) => {
			if (err) return console.error(err);

			items.forEach(item => {

				MarketPrice.exists({SkinName: item['market_hash_name']})
					.then((result) => {

						if (result) {
							MarketPrice.findOneAndUpdate({SkinName: item['market_hash_name']}, {Value: item['price']}, {upsert: true}, (err, data) => {
								if(err) return console.error(err);
							});
						}

						else {

							MarketPrice.create({
								SkinName: item['market_hash_name'],
								SkinPictureURL: item['image'],
								Value: item['price'],
								DateLogged: Date.now()
							}, (err, data) => {
								if(err) return console.error(err);
							});
						}
					})

					.catch((err) => {
						return console.error(err);
					});
			});
			
		});
		*/

	}

	sendJPDepositTradeOffer(steamid, itemArray, tradeurl) {

		const offer = this.manager.createOffer(steamid);

		this.manager.getUserInventoryContents(steamid, 252490, 2, true, (err, inv) => {
			if (err) return console.error(err);

			else {
				let itemNames = []

				itemArray.forEach(desired => {
					const item = inv.find(item => item.assetid == desired);

					if(item) {
						offer.addTheirItem(item);
						itemNames.push(item.market_hash_name)
					}

					else{
						offer.cancel();
						return console.log('error');
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
							BotID: '2',
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
// trade gets sent but it doesn't get logged to the server, also it does create a new coinflip game in the CoinFlipGame db
// brain brokey come back to this later

	sendCoinFlipTradeOffer(steamID, skins, tradeURL, side, gameID) {

		const isActiveGame = this.checkForActiveCFGame(gameID);

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
						offer.cancel();
						return console.log('error');
					}

				})

				let token = tradeURL.split('token=')[1]

				offer.setToken(token)

				offer.send(err, status => {
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
							
							User.updateOne({"SteamID": steamID}, {$push: {"Trades": offer.id} }, (err, doc) => {
								
								if (err) return console.error(err);

								else if (isActiveGame) {
									
									let query;

									if (side == 'heads') {
										
										query = {
											PlayerTwoTradeState: TradeOfferManager.ETradeOfferState[offer.state],
											Heads: steamID,
										}

									}

									else {

										query = {
											PlayerTwoTradeState: TradeOfferManager.ETradeOfferState[offer.state],
											Tails: steamID,
										}

									}

									CoinFlipGame.findOneAndUpdate({GameID: gameID}, query, {upsert: true}, (err, doc) => {
										if (err) console.log(err);
									})
								}

								else {
									let query;

									if (side == 'heads') {
										query = {
											GameID: gameID,
											PlayerOneTradeState: TradeOfferManager.ETradeOfferState[offer.state],
											Heads: steamID,
											Status: true,
											DateCreated: Date.now()
										}
									}

									else {
										query = {
											GameID: gameID,
											PlayerOneTradeState: TradeOfferManager.ETradeOfferState[offer.state],
											Tails: steamID,
											Status: true,
											DateCreated: Date.now()
										}
									}

									CoinFlipGame.create(query)
									.catch((err) => {
										if (err) console.error(err);
									});

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

	checkForActiveCFGame(cfGameID) {

		CoinFlipGame.find({GameID: cfGameID}, (err, doc) => {
			if (err) return console.error(err);

			else {
				if (doc != null) {
					return true
				}
				else {
					return false
				}
			}
		})

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
					offer.cancel();
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
							User.updateOne({"SteamID": user.SteamID}, {$push: {"Trades": offer.id} }, (err, doc) => {
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