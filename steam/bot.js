const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});

const makeNewTrade = (steamid, items) => {
    return null
}

function getInventory(steamid, tradeURL, callback){
	
	community.getUserInventoryContents(steamid, 252490, 2, true, (err, inv) => {
		if (err) return callback(err);
		return callback(inv);
	});
}

module.exports = {getInventory};