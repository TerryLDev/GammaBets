const axios = require('axios');
require("dotenv").config(__dirname + "/.env");
const MarketPrice = require("../models/marketprice.model");
const mainApp = require("../app");

function updateMainAppSkins() {
	MarketPrice.find({}, (err, allSkins) => {
		if(err) return console.error(err);

		else {
			mainApp.skins = allSkins;
		}
	});
}

function updateSkinPrices() {

	console.log("Updating prices of skins...");

	// get list of skins from api
	axios.get(`https://api.steamapis.com/market/items/252490?api_key=${process.env.STEAM_APIS_KEY}`)
	.then(res => {

		let listOfSkins = res.data.data;

		listOfSkins.forEach(skin => {
			updatePrice(skin);
		});

		console.log("Logged All Skins");

		updateMainAppSkins();
		
	})
	.catch(err => {
		console.log(err);
	});
}

function updatePrice(skin) {


	MarketPrice.exists({ SkinName: skin["market_hash_name"] })
	.then((result) => {

		if (result) {

			MarketPrice.findOneAndUpdate(
				{ SkinName: skin["market_hash_name"] },
				{ Value: skin.prices.safe },
				{ upsert: true }, (err, data) => {
					if (err) return console.error(err);
				});
		}
		
		else {

			console.log("New Skin Found: " + skin["market_hash_name"]);
			MarketPrice.create({
					SkinName: skin["market_hash_name"],
					SkinPictureURL: skin.image,
					Value: skin.prices.safe,
				}, (err, data) => {
					if (err) return console.error(err);
				});
		}
	})
	.catch(err => {
		return console.error(err);
	});

}

module.exports = {updateSkinPrices};

