const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

require('dotenv').config(__dirname + '/config.env');

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
			this.community.startConfirmationChecker(10000, process.env.IDENTITY_SECRET);
		})

	}

	sendDepositTradeOffer(steamid, itemArray, tradeurl, gameid) {

		const offer = this.manager.createOffer(steamid);

		this.manager.getUserInventoryContents(steamid, 252490, 2, true, (err, inv) => {
			if (err) return console.error(err);

			else {
				itemArray.forEach(desired => {
					const item = inv.find(item => item.assetid == desired);

					if(item) {
						offer.addTheirItem(item);
					}

					else{
						offer.cancel();
						console.log('error');
					}
				})
				offer.setMessage('Test trade');

				let token = tradeurl.split('token=')[1]
				console.log(token);

				offer.setToken(token)

				offer.send((err, status) => {
					if (err) return console.error(err);
					console.log(status, offer.id);

					// Should log the trade offer to the server
					TradeHistory.create({
						TradeID: offer.id,
						SteamID: steamid,
						BotID: '2',
						Items: itemArray,
						TransactionType: 'Deposit',
						State: TradeOfferManager.ETradeOfferState[offer.state],
						GameID: /* need to randomly generate one */ "Jackpot",
						DateCreated: Date.now()
					})
					.then((result) => {
						console.log(result);
					})
					.catch((err) => {
						console.error(err);
					});

				});
			}
		})

	}

}

module.exports = SteamBot;