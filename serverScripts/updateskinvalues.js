async function updateSkinPrices() {
	console.log("Updating prices of skins...");

	try {
		const community = new SteamCommunity();

		community.marketSearch({ appid: 252490 }, (err, items) => {
			if (err) return console.error(err);

			items.forEach((item) => {
				MarketPrice.exists({ SkinName: item["market_hash_name"] })
					.then((result) => {
						if (result) {
							MarketPrice.findOneAndUpdate(
								{ SkinName: item["market_hash_name"] },
								{ Value: item["price"] },
								{ upsert: true },
								(err, data) => {
									if (err) return console.error(err);
									console.log(data);
								}
							);
						} else {
							MarketPrice.create(
								{
									SkinName: item["market_hash_name"],
									SkinPictureURL: item["image"],
									Value: item["price"],
									DateLogged: Date.now(),
								},
								(err, data) => {
									if (err) return console.error(err);
								}
							);
						}
					})

					.catch((err) => {
						return console.error(err);
					});
			});
		});
	} catch (err) {
		throw new Error(err);
	}
}

module.exports = updateSkinPrices;
