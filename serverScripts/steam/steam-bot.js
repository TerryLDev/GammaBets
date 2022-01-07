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

class SteamBot {

	loginAttempts = 0;

	constructor(username, password, twoFactorCode, botID) {

		this.username = username;
		this.password = password;
		this.twoFactorCode = twoFactorCode;
		this.botID = botID;

		this.client = new SteamUser();
		this.community = new SteamCommunity();
		this.manager = new TradeOfferManager({
			steam: this.client,
			community: this.community,
			language: 'en'
		});

		this.logIntoSteam();
		this.runEventListeners();
		this.skins = this.getSkins();

	}

	logIntoSteam() {

		this.client.logOn({accountName: this.username, password: this.password, twoFactorCode: this.twoFactorCode});

		this.loginAttempts++;
		console.log("Login Attempts: " + this.loginAttempts)

	}

	getSkins() {

		MarketPrice.find({}, (err, skins) => {
			if (err) return console.log(err);

			else {
				console.log("Skins Loaded");
				return skins
			}
		});

		setInterval(function() {

			console.log("Reloading skins");

			MarketPrice.find({}, (err, skins) => {
				if (err) return console.log(err);
	
				else {
					console.log("Skins Loaded");
					return skins
				}
			});

		}, 1000 * 60 * 60 * 6);
	}

	runEventListeners() {

		this.client.on('loggedOn', () => {
			console.log('Steam User Logged In: ' + this.username)
		});

		this.client.on('webSession', (sessionid, cookies) => {
			this.manager.setCookies(cookies);

			this.community.setCookies(cookies)
			this.community.startConfirmationChecker(3000, process.env.IDENTITY_SECRET);
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
	
			setTimeout(function () {

				if (lastCodeWrong) {

					console.log("Wrong Code for Bot: " + this.botID);
					let code = SteamTotp.generateAuthCode(process.env.SHARED_SECRET);
					callback(code);

				}

			}, 1500);
		
		});

		this.client.on("tradeResponse", (steamID, response) => {

			console.log(steamID);
			console.log(response);
		
		});

		this.client.on("disconnected", (eresult, msg) => {

			setTimeout(function () {

				console.log(eresult);
				console.log(msg);

				this.logIntoSteam();

			}, 1500);

		});
		
	}

	sendWithdraw(skins, userObject, callback) {

		const offer = this.manager.createOffer(userObject.SteamID);

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

			let token = userObject.TradeURL.split('token=')[1]

			offer.setToken(token);

			offer.send((err, status) => {

				if (err) return callback(err);

				else if (status == 'pending') {

					TradeHistory.create({
						TradeID: offer.id,
						SteamID: userObject['SteamID'],
						BotID: '2',
						Items: skinIDs,
						ItemNames: skinNames,
						TransactionType: 'Withdraw',
						State: TradeOfferManager.ETradeOfferState[offer.state],
						GameMode: 'Jackpot',
						DateCreated: Date.now()
					})
						.then((result) => {

							User.findOneAndUpdate({"SteamID": userObject.SteamID}, {$push: {"Trades": offer.id} }, 
							(err, doc) => {
								if (err) return callback(err);
							});

							console.log(`Offer #${offer.id} sent, but requires confirmation. Status: ${status}`);

							let idSecret = process.env.IDENTITY_SECRET;

							this.community.acceptConfirmationForObject(idSecret, offer.id, (err) => {
								if (err) return callback(err);

								else {
									return callback(`Withdraw has been sent to ${userObject.Username}`)
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

module.exports = {SteamBot};