const express = require("express");
require("dotenv").config(__dirname + "/.env");
const nunjucks = require("nunjucks");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const passportSteam = require("passport-steam");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const socket = require("socket.io");
const async = require("async");
const helmet = require("helmet");
const fs = require("fs");
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
const JackpotGame = require("./models/jackpotgame.model");
const HighStakesJackpot = require("./models/highstakes.model");
const LowStakesJackpot = require("./models/lowstakes.model")

// Router
const mainRoutes = require("./routes/main");
const jackpotRoutes = require("./routes/jackpot");
const coinflipRoutes = require("./routes/coinflip");
const supportRoutes = require("./routes/support");

// SteamBot
const SteamUser = require("steam-user");
const SteamTotp = require("steam-totp");
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require("steam-tradeoffer-manager");

const community = new SteamCommunity();
const manager = new TradeOfferManager();
const client = new SteamUser();

const selectWinner = require("./gammabets/jackpotwinner");

const { updateSkinPrices } = require("./gammabets/updateskinvalues");

// Importing and Setting up CoinFlip GameHandler
const { CoinFlipHandler, cfEvents, allCFGames, cfHistory } = require("./gammabets/handler/coinflip-handler");
const cfGameHandler = new CoinFlipHandler();

// Importing and Setting up Jackpot GameHandler
const {HighStakesHandler, highStakesEvents} = require("./gammabets/handler/high-stakes-handler");

// ^^^^^^^^^^^^^^ //
//// Needs Work ////
////////////////////

const { CoinFlipBot } = require("./gammabets/steam/coinflip-bot");
const { JackpotBot } = require("./gammabets/steam/jackpot-bot");

let lastUsedCFBot = "none";

let mongo_uri = process.env.MONGO_URI;

// DB Pulls
let skins;
let allUsers;


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

		User.find({}, (err, data) => {
			if (err) throw err;

			allUsers = data;
			console.log("done: User");
		});

		/* reworking jackpot
		JackpotGame.findOne({ Status: true }, (err, jp) => {
			
			if (err) throw err;

			else if (jp != null) {

				currentJPGame = jp;
				activeJPGameID = jp.GameID;

				if (jp.Players.length > 1) {
					countDown = true;
				}
			}

			console.log("done: JP");
		});

		*/
		
		CoinFlipGame.find({}, (err, cfs) => {

			if(err) console.log(err);

			else {
				cfs.forEach(cf => {

					cfGameHandler.createNewGame(cf);

				})
			}

		})
		
		
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

/*

// Intialize Bots
// Random Login Time to avoid request Errors

const randomOne = (Math.floor(Math.random() * 10) + 1) * 1000;
const randomTwo = (Math.floor(Math.random() * 10) + 1) * 1000;
const randomThree = (Math.floor(Math.random() * 10) + 1) * 1000;

// JP Bot(s)
let jpBotZero;

// CF Bot(s)
let cfBotZero;
let cfBotOne;

setTimeout(() => {

	jpBotZero = new JackpotBot(process.env.JP_BOT_0_USERNAME, process.env.JP_BOT_0_PASSWORD, SteamTotp.generateAuthCode(process.env.JP_BOT_0_SHARED_SECRET), process.env.JP_BOT_0_IDENTITY_SECRET, process.env.JP_BOT_0_SHARED_SECRET, process.env.JP_BOT_0_SERVER_ID);

}, randomOne);

setTimeout(() => {

	cfBotZero = new CoinFlipBot(process.env.CF_BOT_0_USERNAME, process.env.CF_BOT_0_PASSWORD, SteamTotp.generateAuthCode(process.env.CF_BOT_0_SHARED_SECRET), process.env.CF_BOT_0_IDENTITY_SECRET, process.env.CF_BOT_0_SHARED_SECRET, process.env.CF_BOT_0_SERVER_ID);

}, randomTwo);

setTimeout(() => {

	cfBotOne = new CoinFlipBot(process.env.CF_BOT_1_USERNAME, process.env.CF_BOT_1_PASSWORD, SteamTotp.generateAuthCode(process.env.CF_BOT_1_SHARED_SECRET), process.env.CF_BOT_1_IDENTITY_SECRET, process.env.CF_BOT_1_SHARED_SECRET, process.env.CF_BOT_1_SERVER_ID);


}, randomThree);
*/

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
			console.log(identifier);
			console.log(profile);
			return done(null, profile);
		}
	)
);

// Finalize passport with cookies
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", mainRoutes, jackpotRoutes, coinflipRoutes, supportRoutes);

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
    res.redirect('http://localhost:8080/');
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

app.get("/api/messages", (res, req) => {
	req.json(messages);
})

io.on("connection", (socket) => {

	socket.on("join", data => {

		console.log(data);
		const room = data.steamID

		if (room != "") {

			socket.join(room);
			console.log("User Has Joined: " + room)
			
		}

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
							
							else {

								let userInv = [];

								inv.forEach((item) => {
									skins.forEach((skin) => {
										if (item["name"] == skin["SkinName"]) {
											userInv.push({
												name: item["name"],
												id: item["id"],
												price: skin["Value"],
												imageURL:
													skin["SkinPictureURL"],
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

		try {

			console.log("New Request: New CoinFlip")

			setTimeout(function() {

				let gameID = cfGameHandler.createGameID();

				if (lastUsedCFBot == "CF0") {

					cfBotOne.newCoinFlipTrade(data.steamID, data.skins, data.tradeURL, data.side, gameID);

					lastUsedCFBot = cfBotOne.botID;

				}

				else {

					cfBotZero.newCoinFlipTrade(data.steamID, data.skins, data.tradeURL, data.side, gameID);

					lastUsedCFBot = cfBotZero.botID;

				}

			}, 1000);

		}

		catch(err) {

			console.log(err);
			console.log("Error Occurred while creating a new game");

		}

	});

	socket.on("joinActiveCoinFlipGame", async data => {

		/* data = {
			steamID: steamID,
			username: user,
			skins: listOfSkins,
			tradeURL: tradeURL,
			gameID: gameId,
		};
		*/

		setTimeout(function() {

			let findBot = cfGameHandler.findCFBot(data.gameID);

			if (findBot == process.env.CF_BOT_0_SERVERID) {

				cfBotZero.joinCFGameAndSendTrade(data.steamID, data.username, data.skins, data.tradeURL, data.gameID);

			}

			else if (findBot == process.env.CF_BOT_1_SERVERID) {

				cfBotOne.joinCFGameAndSendTrade(data.steamID, data.username, data.skins, data.tradeURL, data.gameID);

			}

			else {

				console.log(findBot);
				console.log("Can't find Coin Flip bot");

			}

		}, 1000);
		
	});

	socket.on("jackpotDeposit", async (data) => {

		/*
		data = {

			SteamID: **,
			Skins: **,
			TradeURL: **,
			PotType: **,

		}
		*/

		setTimeout(function() {
			
			if (data.PotType == "high") {

				jpBotZero.sendJPDepositTradeOffer(data.SteamID, data.Skins, data.TradeURL, data.PotType);

			}

			else {

				jpBotZero.sendJPDepositTradeOffer(data.SteamID, data.Skins, data.TradeURL, data.PotType);

			}
		}, 1000);

	});

});

setInterval(async function () {

	updateSkinPrices()
	.then(result => {

		MarketPrice.find({}, (err, skinsList) => {
			if (err) throw err;
			skins = skinsList;
		});
	
		jpBotZero.getSkins();
		cfBotZero.getSkins();
		cfBotOne.getSkins();

	})
	.catch(error => {

		return console.error(error);
		
	});
	
}, 1000 * 60 * 60 * 6);

//////////////////////////////////////////////////////////////

// sends to certain user

const sendMsg = async (steamID, msg) => {
	io.to(steamID).emit("tradeLink", msg);
};

setInterval(function () {
	let steamID = "76561198072093858";
	let msg = "Test was successful " + steamID;

	sendMsg(steamID, msg);
}, 5000);

//////////////////////////////////////////////////////////////

// Coin flip events

// Coin Flip Timer
setInterval(function () {

	cfGameHandler.timer();

}, 1000);

// done
cfEvents.on("cfTimer", (data) => {

	// data format (array)
	// data = [{GameID: **, CurrentTime: **, State: ""}]

	io.emit("cfTimer", data);

});

// done
cfEvents.on("newCFGame", (data) => {
	
	// data format
	// data = GameObject (game obejct from the json file)

	io.emit("newCFGame", data);
	
});

// done
cfEvents.on("secondPlayerJoiningCFGame", (data) => {
	
	// data format
	/* data = {
		SteamID: steamID,
		Username: username,
		GameID: gameID,
		TradeState: tradeState,
		UserPicURL: userPicURL,
		PlayerTwoSide: "red" or "black"
	}
	*/

	io.emit("secondPlayerJoiningCFGame", data);

});

// need more work
cfEvents.on("secondPlayerDeclinedTrade", (data) => {

	// 

});

// done I think
cfEvents.on("secondPlayerAccepctedTrade", (data) => {

	// data format
	/*  data.GameID = gameObject.GameID;
    	data.PlayerTwoSkins = gameObject.Players[1].skins;
		data.PlayerTwoSkinValues = gameObject.Players[1].skinValues;
		data.PlayerTwoSkinPictures = gameObject.Players[1].skinPictures;
		data.PlayerTwoSide = gameObject.playerTwoSide;
	*/

	io.emit("secondPlayerAccepctedTrade", data);

});

// need more work
///////////////////////
//// It might work ////
///////////////////////
cfEvents.on("cancelCFGame", async (data) => {

	// data format
	// data = {GameID: **};

	try {

		// bot cancels trade
		let cfBot = cfGameHandler.findCFBot(data.GameID);

		console.log(await cfBot);

		if (await cfBot == process.env.CF_BOT_1_SERVERID) {

			cfBotOne.cancelOpponentCoinFlipTradeOffer(data.GameID);

		}

		else {

			cfBotZero.cancelOpponentCoinFlipTradeOffer(data.GameID);

		}

		// handler updates json file and returns the {gameobject} from the json file
		const update = await cfGameHandler.cancelOpponentTrade(data.GameID);

		// socket pushes update to front end
		io.emit("cancelCFGame", await update);
	}
	
	catch (err) {
		return console.error(err);
	}

});

// need more work
cfEvents.on("decideWinner", async (data) => {
	// given data format
	// data = {GameID: **, GameState: ** (just false)}

	// returned winnerObj format
	// winnerObj = {GameID: gameID, SteamID: winner}

	try {

		// updates the json file to change gameState to false
		cfGameHandler.updateJsonGameState(data.GameState);

		// gets the winner
		const winnerObj = await cfGameHandler.decideWinner(data.GameID);

		// pushes winner to frontend
		io.emit("cfWinner", await winnerObj);

		// updates the winner in json file
		cfGameHandler.updateJsonWinner(await winnerObj);

		// push game state update
		let dataGS = {GameState: data.GameState};

		io.emit("updateGameState", dataGS);

	}

	catch (err) {

		return console.log(err);

	}

});

// need more work
cfEvents.on("removeCFGame", (data) => {

});

//////////////////////////////////////////////////////////////

// High Stakes Events and Variables

//////////////////////////////////////////////////////////////

const hsHandler = new HighStakesHandler();

exports.highStakesActiveGame = {GameID: "", Players: [{username:"Daddy Disappointment",userSteamId:"76561198072093858",userPicture:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/34/343dab39597de5d25d02eab2b2fe48d8dde6ae0e_full.jpg",skins:["Black Hoodie"],skinValues:[0.5],skinIDs:["3509994123859633414"],skinPictures:["https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WXMfCk4nReh8DEiv5daPqk5q7IxRv2_CuOfQ1k/"]},{username:"Daddy Disappointment",userSteamId:"76561198072093858",userPicture:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/34/343dab39597de5d25d02eab2b2fe48d8dde6ae0e_full.jpg",skins:["Epidemic Roadsign Vest"],skinValues:[0.82],"skinIDs":["3509994123859633419"],skinPictures:["https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fc7GLCfCk4nReh8DEiv5dYO6k6pLU-Q_28hhmLJOc/"]}], TotalPotValue: 1.30, Time: parseFloat(process.env.JACKPOT_TIMER)};
/* ^ Format ^
{
    GameID: **
    Players: [{object from db}, {}, {}],
    TotalPotValue: **,
}
*/

exports.highStakesQueue = {};
/* ^ Format ^
{
    GameID: **
    Players: [{object from db}, {}, {}],
    TotalPotValue: **,
}
*/

exports.highStakesHistory = [];
exports.isHighStakesSpinning = false;
exports.isThereAnActiveHighStakesGame = false;

// High Stakes Events
highStakesEvents.on("newHighStakesPot", data => {
	//data = {GameID: "", Players: [], TotalPotValue: 0};

	io.emit("newHighStakesPot", data);

});

highStakesEvents.on("newHighStakesPlayer", data => {
	/*
	const data = {
		Player: playerBet,
		TotalPotValue: highStakesActiveGame.TotalPotValue
	}
	*/

	io.emit("newHighStakesPlayer", data);

});

highStakesEvents.on("startHighStakesTimer", data => {

	io.emit("startHighStakesTimer", data);

});