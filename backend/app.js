const express = require("express");
require("dotenv").config(__dirname + "/.env");
const passport = require("passport");
const session = require("express-session");
const passportSteam = require("passport-steam");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const socket = require("socket.io");
const async = require("async");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Models
const User = require("./models/user.model");
const TradeHistory = require("./models/tradehistory.model");
const Support = require("./models/support.model");
const MarketPrice = require("./models/marketprice.model");
const CoinFlipGame = require("./models/coinflipgame.model");
const HighStakesJackpot = require("./models/highstakes.model");
const LowStakesJackpot = require("./models/lowstakes.model");

// Router
const mainRoutes = require("./routes/main");
const jackpotRoutes = require("./routes/jackpot");
const coinflipRoutes = require("./routes/coinflip");
const supportRoutes = require("./routes/support");
const productionRoutes = require("./routes/production");

// SteamBot
const SteamUser = require("steam-user");
const SteamTotp = require("steam-totp");
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require("steam-tradeoffer-manager");

const community = new SteamCommunity();
const manager = new TradeOfferManager();
const client = new SteamUser();

const serverProfitUtils = require("./gammabets/dbScripts/server-profit");
const JackpotDBScripts = require("./gammabets/dbScripts/jackpot-db");
const CoinFlipDBScripts = require("./gammabets/dbScripts/coinflip-db");

const { updateSkinPrices } = require("./gammabets/updateskinvalues");

// Importing and Setting up CoinFlip GameHandler
const { CoinFlipHandler, cfEvents, allCFGames, cfHistory, joiningQueue } = require("./gammabets/handler/coinflip-handler");
const cfGameHandler = new CoinFlipHandler();

// Importing and Setting up Jackpot GameHandler
const { highStakesEvents, HighStakesHandler } = require("./gammabets/handler/high-stakes-handler");
const { lowStakesEvents, LowStakesHandler } = require("./gammabets/handler/low-stakes-handler");

// Importing Alert Center
const {AlertCenter, alertEvents} = require("./gammabets/alertcenter")

// ^^^^^^^^^^^^^^ //
//// Needs Work ////
////////////////////

const { CoinFlipBot } = require("./gammabets/steam/coinflip-bot");
const { JackpotBot } = require("./gammabets/steam/jackpot-bot");

let lastUsedCFBot = "none";

let mongo_uri = process.env.MONGO_URI;

// DB Pulls
let skins;

// Connect to MongoDB
mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
	if (err) throw err;

	else {
		console.log("Connected to MongoDB...");

		MarketPrice.find({}, (err, skinsList) => {
			if (err) throw err;

			skins = skinsList;
			console.log("done: Skins");

		});
		
		CoinFlipGame.find({Status: true}, (err, cfs) => {

			if(err) console.log(err);

			else {

				cfs.forEach(cf => {

					cfGameHandler.createNewGame(cf);

				})

				console.log("done: Coinflip");
			}

		})

		HighStakesJackpot.findOne({Status: true}, (err, gameDoc) => {
			if (err) console.log(err);
			else {


				if (gameDoc != null && gameDoc != undefined) {
					const hsHandler = new HighStakesHandler;
					hsHandler.newGame(gameDoc);
				}
				
				console.log("done: High Stakes Pot")
			}
		});
		
	}
});

// Setting up cookies
app.use(
	session({
		secret: "gammabets more like gamma kill myself",
		store: MongoStore.create({
			mongoUrl: mongo_uri,
		}),
		name: "GammaBets",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24,
		},
	})
);

// Localhost port
const port = process.env.PORT || 4000;

// Login the steambots
// JP Bot(s)
const jpBotZero = new JackpotBot(process.env.JP_BOT_0_USERNAME, process.env.JP_BOT_0_PASSWORD, SteamTotp.generateAuthCode(process.env.JP_BOT_0_SHARED_SECRET), process.env.JP_BOT_0_IDENTITY_SECRET, process.env.JP_BOT_0_SHARED_SECRET, process.env.JP_BOT_0_SERVER_ID);;

// CF Bot(s)
const cfBotZero = new CoinFlipBot(process.env.CF_BOT_0_USERNAME, process.env.CF_BOT_0_PASSWORD, SteamTotp.generateAuthCode(process.env.CF_BOT_0_SHARED_SECRET), process.env.CF_BOT_0_IDENTITY_SECRET, process.env.CF_BOT_0_SHARED_SECRET, process.env.CF_BOT_0_SERVER_ID);

const cfBotOne = new CoinFlipBot(process.env.CF_BOT_1_USERNAME, process.env.CF_BOT_1_PASSWORD, SteamTotp.generateAuthCode(process.env.CF_BOT_1_SHARED_SECRET), process.env.CF_BOT_1_IDENTITY_SECRET, process.env.CF_BOT_1_SHARED_SECRET, process.env.CF_BOT_1_SERVER_ID);

// Authentcation startegy for Passport
const SteamStrategy = passportSteam.Strategy;

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

passport.use(
	new SteamStrategy(
		{
			returnURL:
				process.env.DEV_ENV == "true"
					? "http://localhost:4000/auth/steam/return"
					: `http://www.gammabets.com/auth/steam/return`,
			realm:
				process.env.DEV_ENV == "true"
					? "http://localhost:4000"
					: `http://www.gammabets.com/`,
			apiKey:
				process.env.DEV_ENV == "true"
					? process.env.API_KEY_DEV
					: process.env.API_KEY_PRO,
		},

		function(identifier, profile, done) {
			User.findOneAndUpdate({SteamID: profile.id}, {
				$set: {
					Username: profile.displayName,
					ProfilePictureURL: profile._json.avatarfull,
				}
			}, {upsert: true, new: true}, (err, doc) => {
				if (err) {
					console.error(err)
				}
				else {
					console.log("User Logged In: " + doc.SteamID)
				}
			})
			return done(null, profile);
		}
	)
);

// Finalize passport with cookies
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", mainRoutes, jackpotRoutes, coinflipRoutes, supportRoutes);

if (process.env.DEV_ENV == "false") {
	app.set('views', __dirname + "/public/");
	app.set('view engine', 'html');

	app.use(express.static(__dirname + "/public/"));

	app.use("/", productionRoutes);
}

app.get('/auth/steam',
  passport.authenticate('steam'),
  function(req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
  });

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
	if (process.env.DEV_ENV == "false") {
		res.redirect("/")
	}

	else {
		res.redirect('http://localhost:8080/');
	}
  });

const server = app.listen(port, (err) => {

	if (err) return console.error(err);
	console.log(`Port: ${port}, Server Running...`);

});

const io = socket(server, {cors: {
	origin: "http://localhost:8080"
}
});

app.set("socketio", io);

const messages = [];

app.post("/api/messages", (res, req) => {
	req.json(messages);
})

io.on("connection", (socket) => {

	socket.on("join", data => {

		const room = data

		if (room != "") {

			socket.join(room);
			console.log("User Has Joined: " + room)
			
		}

	});

	socket.on("gameRoom", data => {
		socket.join(data.gameRoom);
		console.log(data);
	});

	socket.on("message", async (data) => {

		/*
		username: localStorage.Username,
        profileURL: localStorage.ProfileURL,
        profilePictureURL: localStorage.ProfilePictureURL,
        message: messageVal,
		*/

		if (await messages.length == 100) {

			await messages.shift();

			await messages.push(data);

			io.emit("chat", await data);

		}

		else {

			await messages.push(data);

			io.emit("message", await data);

		}

	});

	////////////////
	// needs work //
	////////////////
	socket.on("addTradeURL", async (data) => {
		User.findOneAndUpdate(
			{ SteamID: data.steamID },
			{ TradeURL: data.trade },
			{ new: true },
			function (err, data) {
				if (err) console.error(err);
				socket.emit("addTradeURL", "big peepee");
			}
		);
		// this still needs to pull their url and load the inventory
	});

	socket.on("getInventory", (steamUser) => {

		console.log("Pulling " + steamUser.SteamID + "'s Inventory");

		// sends a request for the bot to check their inventory from rust
		if (steamUser.SteamID == null || steamUser.SteamID == undefined || steamUser.SteamID == "") {

			console.log("user needs to be logged in to get inventory");

		}

		else {

			User.findOne({ SteamID: steamUser.SteamID }, (err, doc) => {

				if (err) return console.error(err);

				else if (doc["SteamID"] == null || doc["SteamID"] == undefined || doc["SteamID"] == "") {
					console.log("You need to logged in");
				}

				else {
					community.getUserInventoryContents(doc["SteamID"], 252490, 2, true, (err, inv) => {

							if (err) console.error(err);

							else if (inv.length == 0 || inv == null || inv == undefined) {
								const data = {
									msg: "No Inventory",
								}
								socket.emit("getInventory", data);
							}
							
							else {

								let userInv = [];

								inv.forEach((item) => {

									skins.forEach((skin) => {

										if (item["name"] == skin["SkinName"]) {

											userInv.push({
												
												name: item["name"],
												id: item["id"],
												price: skin["Value"],
												imageURL: skin["SkinPictureURL"],

											});

										}
									});
								});

								userInv.sort((a, b) =>
									a.price < b.price ? 1 : -1
								);

								socket.emit("getInventory", userInv);
							}
						}
					);
				}
			});
		}
	});

	socket.on("createNewCoinFlipGame", async (data) => {

		/* data = {
			steamID: steamID,
			skins: listOfSkins,
			tradeURL: tradeURL,
			side: "red" or "black"
			gameID: gameId,
		};
		*/

		try {

			console.log("New Request: Coinflip");

			setTimeout(function() {

				console.log("Go");

				let gameID = cfGameHandler.createGameID();

				if (lastUsedCFBot == cfBotZero.botID) {

					cfBotOne.newCoinflip(data.steamID, data.skins, data.tradeURL, data.side, gameID);

					lastUsedCFBot = cfBotOne.botID;

				}

				else {

					cfBotZero.newCoinflip(data.steamID, data.skins, data.tradeURL, data.side, gameID);

					lastUsedCFBot = cfBotZero.botID;

				}

			}, 2000);

		}

		catch(err) {

			console.log(err);
			console.log("Error Occurred while creating a new game");

		}

	});

	socket.on("joinActiveCoinFlipGame", async data => {

		/* data = {
			steamID: steamID,
			skins: listOfSkins,
			tradeURL: tradeURL,
			gameID: gameId,
		};
		*/

		try {

			setTimeout(() => {

				let findBot = cfGameHandler.findCFBot(data.gameID);
	
				if (findBot == cfBotZero.botID) {
	
					cfBotZero.joiningActiveCFGame(data.steamID, data.skins, data.tradeURL, data.gameID);
	
				}
	
				else if (findBot == cfBotOne.botID) {
	
					cfBotOne.joiningActiveCFGame(data.steamID, data.skins, data.tradeURL, data.gameID);
	
				}
	
				else {
	
					console.log(findBot);
					console.log("Can't find Coin Flip bot");
	
				}
	
			}, 2000);

		}

		catch(err) {

			return console.log(err)

		}
		
	});

	// Socket Event for Player Joining High Stakes Jackpot
	socket.on("joinHighStakes", (data) => {

		console.log(`User: ${data.steamID}, is Joining High Stakes Jackpot`);

		/*
		data = {
			skins: [{skin obj},],
			steamID: **,
			tradeURL: **
		}
		*/

		if (jpBotZero.client.steamID == null) {
			jpBotZero.logIntoSteam()
			.then(() => {
				jpBotZero.joinHighStakesPot(data.steamID, data.tradeURL, data.skins);
			})
			.catch(err => {
				console.log(err);
			})
		}

		else {

			jpBotZero.joinHighStakesPot(data.steamID, data.tradeURL, data.skins);

		}

	});

	// Socket Event for Player Joining Low Stakes Jackpot
	socket.on("joinLowStakes", (data) => {

		console.log(`User: ${data.steamID}, is Joining Low Stakes Jackpot`);

		/*
		data = {
			skins: [{skin obj},],
			steamID: **,
			tradeURL: **
		}
		*/

		if (jpBotZero.client.steamID == null) {
			jpBotZero.logIntoSteam()
			.then(() => {
				jpBotZero.joinLowStakesPot(data.steamID, data.tradeURL, data.skins);
			})
			.catch(err => {
				console.log(err);
			})
		}

		else {

			jpBotZero.joinLowStakesPot(data.steamID, data.tradeURL, data.skins);

		}

	});

});

setInterval(async function () {

	await updateSkinPrices();
	
}, 1000 * 60 * 60 * 4); // 4 hours

setInterval(async function () {
	await jpBotZero.getSkins();
	await cfBotZero.getSkins();
	await cfBotOne.getSkins();
}, 1000 * 60 * 30); // 30 minutes

//////////////////////////////////////////////////////////////

// Alert Events
// these are messages that will be sent to the user
// trade offers, error messages, etc

/*

const alerts = new AlertCenter();

alertEvents.on("tradeLink", data => {
	io.to(data.steamID).emit("tradeLink", data);
});

*/

//////////////////////////////////////////////////////////////

// Coin flip events

// done - might be pretty hard on the server, but we'll see
cfEvents.on("cfTimer", (data) => {

	// returns the list of games timers
	io.emit("cfTimer", data);

});

cfEvents.on("updateJoiningQueue", data => {
	io.emit("updateJoiningQueue", data);
});

// done
cfEvents.on("newCFGame", (data) => {
	// returns the game object
	console.log(data);
	io.emit("newCFGame", data);
	
});

cfEvents.on("secondPlayerAccepctedTrade", data => {
	const newData = {
		game: data.game,
		timer: data.timer
	}
	console.log(newData);
	io.emit("secondPlayerAccepctedTrade", newData);
});

cfEvents.on("secondPlayerJoiningGame", data => {
	const newData = {
		game: data.game,
		timer: data.timer
	}
	io.emit("secondPlayerJoiningGame", newData);
});

cfEvents.on("callCancelCFTrade", async (data) => {

	// data format
	// data = {GameID: **, TradeID: **};

	try {

		// bot cancels trade
		let cfBot = cfGameHandler.findCFBot(data.GameID);

		console.log(await cfBot);

		if (await cfBot == cfBotOne.botID) {

			cfBotOne.cancelOpponentCoinFlipTradeOffer(data.TradeID);

		}

		else {

			cfBotZero.cancelOpponentCoinFlipTradeOffer(data.TradeID);

		}

	}
	
	catch (err) {
		return console.error(err);
	}

});

// This is called after the trade hass been cancels, cf game object has been updated, and its ready to push an update to the frontend
cfEvents.on("secondPlayerTradeCanceled", (data) => {

	// data = {GameID: **}

	const cfIndex = allCFGames.findIndex(game => game.game.gameID == data.GameID);
	let gameObject = {

		game: allCFGames[cfIndex].game,
		timer: allCFGames[cfIndex].timer

	};

	// Looks for the playerTwo's tradeID
	const tradeID = joiningQueue.findTradeID(data.GameID);
	
	// checks if it's a valid TradeID
	if(tradeID != false) {

		let cfBot = cfGameHandler.findCFBot(data.GameID);

		console.log(cfBot);

		if (cfBot == cfBotOne.botID) {

			cfBotOne.cancelOpponentCoinFlipTradeOffer(tradeID);

		}

		else {

			cfBotZero.cancelOpponentCoinFlipTradeOffer(tradeID);

		}

		console.log("Player Two did not accept trade in time, playerTwo trade CANCELED for: " + data.GameID);

	}

	else {
		console.log("Player Two did not accept trade in time, AND COULD NOT CANCEL TRADE: " + data.GameID);
	}

	io.emit("secondPlayerTradeCanceled", gameObject);

	joiningQueue.removeSelectedQueue(data.GameID);

});

cfEvents.on("cfWinner", (data) => {
	/*
	const data = {
		game: allCFGames[gameIndex].game,
		timer: allCFGames[gameIndex].timer
	}
	*/
	
	io.emit("cfWinner", data);
	
});

cfEvents.on("chooseCFWinner", (innerGameObj) => {
	cfGameHandler.chooseWinner(innerGameObj);
});

cfEvents.on("withdrawWinnings", (data) => {

	/*
	const data = {
		botID: chosenGame.game.bot,
		gameID: gameID,
		serverProfit: highestAttempt.skins,
		playerWinnings: pWinnings, [array of skin names]
		winnerSteamID: chosenGame.game.winner,
	};
	*/

	// Find the bot for this game and send winnings
	// Also find user db object
	// Log the server profit

	User.findOne({SteamID: data.winnerSteamID}, (err, user) => {

		if (err) {
			return console.error(err);
		}

		else if (user == null || user == undefined) {
			return console.log("User doesn't exist");
		}

		else {

			if (data.botID == cfBotZero.botID) {

				cfBotZero.sendWithdraw(data.playerWinnings, "Coinflip", data.gameID, user);

			}

			else if (data.botID == cfBotOne.botID) {

				cfBotZero.sendWithdraw(data.playerWinnings, "Coinflip", data.gameID, user);

			}

			else {
				return console.log("steam bot does not exist or was not entered correctly");
			}

		}

	})

	if (data.serverProfit.length > 0) {

		serverProfitUtils.logProfit(data.serverProfit, data.gameID, data.botID);

	}

});

// update cf history here
cfEvents.on("cfHistory", data => {

	// data is the whole cfHistory object
	const socketData = {
		topGame: data.topGame,
		history: data.history,
	}

	io.emit("cfHistoryUpdate", socketData);

});

cfEvents.on("removeCFGame", data => {
	// data = {GameID: **}
	io.emit("removeCFGame", data);
});

cfEvents.on("updatePastCFSides", data => {
	/*
	const data = {
		past: pastCFSides
	};
	*/
	io.emit("pastCFSides", data);
});

//////////////////////////////////////////////////////////////

// High Stakes Events

//////////////////////////////////////////////////////////////

highStakesEvents.on("newHighStakesGame", data => {
	/*
	const data = {
		GameID: highStakesActiveGame.GameID,
		Players: highStakesActiveGame.Players,
		TotalPotValue: highStakesActiveGame.TotalPotValue,
		Winner: highStakesActiveGame.Winner
	};
	*/

	io.emit("newHighStakesGame", data);
});

highStakesEvents.on("newHighStakesPlayer", data => {

	/*
	const data = {
		Player: playerBet,
		TotalPotValue: highStakesActiveGame.TotalPotValue
	};
	*/
	console.log(data.Player.username, "NEW BET");

	io.emit("newHighStakesPlayer", data);

});

highStakesEvents.on("highStakesTimer", data => {

	/*
	data = {time: num}
	*/

	io.emit("highStakesTimer", data);

});

highStakesEvents.on("highStakesHistoryUpdate", data => {

	/*
	const data = {
		topGame: this.topGame,
		history: this.history
	}
	*/

	io.emit("highStakesHistory", data);

});

highStakesEvents.on("highStakesWinner", data => {
	
	/*
	const winnerData = {
		winner: potWinner
	}
	*/

	io.emit("highStakesWinner", data);

});

highStakesEvents.on("highStakesServerProfit", data => {

	/*
	const data = {
		serverProfit: serverProfit, // array of skins
		playerWinnings: allSkinsInPot, // array of skins
		winner: this.Winner,
		botID: this.BotID,
		gameID: this.GameID
	};
	*/

	User.findOne({SteamID: data.winner}, (err, user) => {

		if (err) return console.log(err);

		else {

			if (data.botID == jpBotZero.botID) {

				jpBotZero.sendWithdraw(data.playerWinnings, "High Stakes", data.gameID, user);
			
			}

			else {

				return console.log("CAN NOT FIND JP BOT");

			}

			serverProfitUtils.logProfit(data.serverProfit, data.gameID, data.botID);
			JackpotDBScripts.updateWinnerHS(data.gameID, data.winner);

		}

	});

});

//////////////////////////////////////////////////////////////

// Low Stakes Events

//////////////////////////////////////////////////////////////

lowStakesEvents.on("newLowStakesGame", data => {
	/*
	const data = {
		GameID: lowStakesActiveGame.GameID,
		Players: lowStakesActiveGame.Players,
		TotalPotValue: lowStakesActiveGame.TotalPotValue,
		Winner: lowStakesActiveGame.Winner
	};
	*/

	io.emit("newLowStakesGame", data);
});

lowStakesEvents.on("newLowStakesPlayer", data => {

	/*
	const data = {
		Player: playerBet,
		TotalPotValue: lowStakesActiveGame.TotalPotValue
	};
	*/
	console.log(data.Player.username, "NEW BET");

	io.emit("newLowStakesPlayer", data);

});

lowStakesEvents.on("lowStakesTimer", data => {

	/*
	data = {time: num}
	*/

	io.emit("lowStakesTimer", data);

});

lowStakesEvents.on("lowStakesHistoryUpdate", data => {

	/*
	const data = {
		topGame: this.topGame,
		history: this.history
	}
	*/

	io.emit("lowStakesHistory", data);

});

lowStakesEvents.on("lowStakesWinner", data => {
	
	/*
	const winnerData = {
		winner: potWinner
	}
	*/

	io.emit("lowStakesWinner", data);

});

lowStakesEvents.on("lowStakesServerProfit", data => {

	/*
	const data = {
		serverProfit: serverProfit, // array of skins
		playerWinnings: allSkinsInPot, // array of skins
		winner: this.Winner,
		botID: this.BotID,
		gameID: this.GameID
	};
	*/

	User.findOne({SteamID: data.winner}, (err, user) => {

		if (err) return console.log(err);

		else {

			if (data.botID == jpBotZero.botID) {

				jpBotZero.sendWithdraw(data.playerWinnings, "Low Stakes", data.gameID, user);
			
			}

			else {

				return console.log("CAN NOT FIND JP BOT");

			}

			serverProfitUtils.logProfit(data.serverProfit, data.gameID, data.botID);
			JackpotDBScripts.updateWinnerLS(data.gameID, data.winner);

		}

	});

});

module.exports = {skins};