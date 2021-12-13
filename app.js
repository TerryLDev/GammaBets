const express = require("express");
require("dotenv").config(__dirname + "/.env");
const nunjucks = require("nunjucks");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const passportSteam = require("passport-steam");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

const socket = require("socket.io");
const async = require("async");

const helmet = require("helmet");
const fs = require("fs");

const app = express();

// Models
const User = require("./models/user.model");
const TradeHistory = require("./models/tradehistory.model");
const Support = require("./models/support.model");
const MarketPrice = require("./models/marketprice.model");
const CoinFlipGame = require("./models/coinflipgame.model");
const JackpotGame = require("./models/jackpotgame.model");

// Router
const gameRoutes = require("./routes/games");
const supportRoutes = require("./routes/support");

// SteamBot
const SteamUser = require("steam-user");
const SteamTotp = require("steam-totp");
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require("steam-tradeoffer-manager");

const selectWinner = require("./serverScripts/jackpotwinner");

const community = new SteamCommunity();
const manager = new TradeOfferManager();
const client = new SteamUser();

const SteamBot = require("./steam/bot");

const updateValues = require("./serverScripts/updateskinvalues");
const coinFlipUpdater = require("./serverScripts/coinflipgame");

const DBScripts = require("./serverScripts/database")

mongo_uri = process.env.MONGO_URI;

// DB Pulls
let skins;
let allUsers;

// JP current game for server
let currentJPGame;

// Jackpot Timer Setup
let jpTimer = 10;
let readyToRoll = false;
let countDown = false;

mongoose.connect(
    mongo_uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
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

            /*
            Dev Purpose ONLY
            
            CoinFlipGame.find({}, (err, cfs) => {
                if(err) console.log(err);
                else {
                    cfs.forEach(cf => {
                        coinFlipUpdater.addNewActiveGame(cf.GameID)
                    })
                }
            })
            */
        }
    }
);

// Setting up cookies
app.use(
    session({
        secret: "this is gonna be kinda funny ya know",
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
const port = process.env.PORT || 3000;

// Set Up config for Steambots
const bot = new SteamBot({
    accountName: process.env.USERNAME,
    password: process.env.PASSWORD,
    twoFactorCode: SteamTotp.generateAuthCode(process.env.SHARED_SECRET),
});

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
                    ? "http://localhost:3000/auth/steam/return"
                    : `http://www.gammabets.com/auth/steam/return`,
            realm:
                process.env.DEV_ENV == "true"
                    ? "http://localhost:3000"
                    : `http://www.gammabets.com/`,
            apiKey:
                process.env.DEV_ENV == "true"
                    ? process.env.API_KEY_DEV
                    : process.env.API_KEY_PRO,
        },
        function (identifier, profile, done) {
            process.nextTick(function () {
                profile.identifier = identifier;

                let user = profile["_json"];
                console.log(user);

                User.exists({ SteamID: user["steamid"] })
                    .then((result) => {
                        if (result == false) {
                            User.create({
                                SteamID: user["steamid"],
                                Username: user["personaname"],
                                ProfilePictureURL: user["avatarfull"],
                                ProfileURL: user["profileurl"],
                                DateJoined: Date.now(),
                            })
                                .then((result) => {
                                    User.save()
                                        .then((result) => {
                                            console.log(result);
                                        })
                                        .catch((err) => {
                                            console.error(err);
                                        });
                                })
                                .catch((err) => {
                                    console.error(err);
                                });
                        }
                        else {
                            console.log("User Exists");
                            User.findOneAndUpdate({ SteamID: user["steamid"] }, {
									Username: user["personaname"],
									ProfilePictureURL: user["avatarfull"],
									ProfileURL: user["profileurl"],
								}, {upsert: true}, (err, doc) => {
                                    if(err) return console.log(err)
                                });
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });

                return done(null, profile);
            });
        }
    )
);

// Finalize passport with cookies
app.use(passport.initialize());
app.use(passport.session());

nunjucks.configure("views", {
    autoescape: true,
    express: app,
});

app.use("/static", express.static("static"));

app.set("views", "./views");
app.set("view engine", "html");

app.get("/auth/steam", passport.authenticate("steam"), function (req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
});

app.get(
    "/auth/steam/return",
    passport.authenticate("steam", { failureRedirect: "/" }),
    function (req, res) {
        // Successful authentication, redirect home
        req.session.isAuth = true;
        res.redirect("/");
    }
);

app.use("/", gameRoutes);
app.use("/support", supportRoutes);

const server = app.listen(port, (err) => {
    if (err) return console.error(err);
    console.log(`Port: ${port}, Server Running...`);
});

const io = socket(server);
app.set("socketio", io);

const messages = [];

let activeJPGameID;

io.on("connection", async (socket) => {
    socket.on("join", function (data) {
        if (data.steamID != "") {
            socket.join(data.steamID);
            console.log(`${data.steamID} Joined`);
        }
    });

    socket.on("leave", async function (data) {
        if (data.steamID != "") {
            socket.leave(data.steamID);
            console.log(`${data.steamID} Left`);
        }
    });

    socket.emit("chat", messages);

    socket.on("chat", async (data) => {
        messages.push(data);

        io.emit("chat", messages);
    });

    socket.on("jackpotWinner", async (data) => {
        console.log(data);
    });

    if (currentJPGame != null) {
        JackpotGame.findOne({ Status: true }, (err, game) => {
            if (err) return console.error(err);
            else {
                currentJPGame = game;
                socket.emit("jackpotLoader", game);
            }
        });
    }

    socket.on("addTradeURL", async (data) => {
        User.findOneAndUpdate(
            { SteamID: data.steamID },
            { TradeURL: data.trade },
            { upsert: true },
            function (err, data) {
                if (err) console.error(err);
                socket.emit("addTradeURL", "big peepee");
            }
        );
        // this still needs to pull their url and load the inventory
    });

    socket.on("getInventory", async (steamUser) => {
        // sends a request for the bot to check their inventory from rust

        MarketPrice.find({}, (err, skinsList) => {
            if (err) throw err;
            skins = skinsList;
        });

        User.find({}, (err, data) => {
            if (err) throw err;
            allUsers = data;
        });

        if (steamUser.steamID == null || steamUser.steamID == undefined || steamUser.steamID == "") {

            console.log("user needs to be logged in to get inventory")

        }

        else {
            User.findOne({ SteamID: steamUser.steamID }, (err, doc) => {
                if (err) return console.error(err);
                else if (doc["SteamID"] == null || doc["SteamID"] == undefined || doc["SteamID"] == "") {
                    console.log("You need to log this user to the db my guy");
                } else {
                    community.getUserInventoryContents(
                        doc["SteamID"],
                        252490,
                        2,
                        true,
                        (err, inv) => {
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
                                                imageURL: skin["SkinPictureURL"],
                                            });
                                        }
                                    });
                                });
    
                                userInv.sort((a, b) =>
                                    a.price < b.price ? 1 : -1
                                );
    
                                io.to(steamUser.steamID).emit(
                                    "getInventory",
                                    userInv
                                );
                            }
                        }
                    );
                }
            });
        }
    });

    socket.on("createNewCoinFlipGame", async (data) => {
        let gameID = Date.now();

        await bot.sendCoinFlipTradeOffer(
            data.user,
            data.skins,
            data.tradeURL,
            null,
            gameID
        );
    });

    socket.on("joinActiveCoinFlipGame", async (data) => {

        // verify data
        let verify = await DBScripts.verifyIDAndUsername(data.steamID, data.username)

        if(verify) {
            // also check if game has a second player already

            await bot.joinCFGameAndSendTrade(
				data.steaId,
				data.username,
				data.skins,
				data.tradeURL,
				data.gameID
			);

        }

        else {
            console.log(error)
        }

    });

    socket.on("makeJackpotDeposit", async (data) => {
        bot.sendJPDepositTradeOffer(data.user, data.skins, data.tradeURL);
    });
});

// SteamBot Events

bot.client.on("steamGuard", (domain, callback, lastCodeWrong) => {
    setTimeout(function () {
        if (lastCodeWrong) {
            console.log("Wrong Code for Bot 1");
            let code = SteamTotp.generateAuthCode(process.env.SHARED_SECRET);
            callback(code);
        }
    }, 1500);
});

bot.client.on("tradeResponse", (steamID, response) => {
    console.log(steamID);
    console.log(response);
});

bot.client.on("disconnected", (eresult, msg) => {
    setTimeout(function () {
        console.log(eresult);
        console.log(msg);

        bot.logOn({
            accountName: process.env.USERNAME,
            password: process.env.PASSWORD,
            twoFactorCode: SteamTotp.generateAuthCode(
                process.env.SHARED_SECRET
            ),
        });
    }, 1500);
});

bot.client.on("error", (err) => {
    if (err == "Error: RateLimitExceeded") {
        console.log("Bot 1 has exceeded its rate limit");
        bot.client.logOff();
    }
});

bot.manager.on("sentOfferChanged", (offer, oldState) => {
    if (TradeOfferManager.ETradeOfferState[offer.state] == "Declined") {
        TradeHistory.findOneAndUpdate(
            { TradeID: offer.id },
            { State: TradeOfferManager.ETradeOfferState[offer.state] },
            { upsert: true },
            (err, trade) => {
                if (err) return console.error(err);
                else if (trade == null || trade.SteamID == null) {
                    return console.log(
                        "Invalid TradeID Lookup or Manual Change"
                    );
                } else if (trade.TransactionType == "Withdraw") {
                    console.log(
                        `Withdraw Trade: ${offer.id} was declined, Please notify user ${trade.SteamID}`
                    );
                } else if (
                    trade.TransactionType == "Deposit" &&
                    GameMode == "Coin Flip"
                ) {
                    CoinFlipGame.findOne(
                        { GameID: trade.GameID },
                        (err, declinedCFGame) => {
                            if (err) console.error(err);
                            else {
                                if (
                                    declinedCFGame.PlayerOneTradeState ==
                                    "Accepted"
                                ) {
                                    CoinFlipGame.updateOne(
                                        { GameID: declinedCFGame.GameID },
                                        { PlayerTwoTradeState: null },
                                        (err, doc) => {
                                            if (err) return console.error(err);
                                            else {
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                    // take them off of active coin flip game so then someone else can join it
                } else {
                    console.log(offer.id + " Trade was Declined");
                    io.sockets.emit("jackpotDepositDeclined", trade);
                }
            }
        );
    }
    else if (TradeOfferManager.ETradeOfferState[offer.state] == "Accepted") {
        TradeHistory.findOneAndUpdate(
            { TradeID: offer.id },
            { State: TradeOfferManager.ETradeOfferState[offer.state] },
            { upsert: true },
            (err, trade) => {
                if (err) return console.error(err);
                else if (trade == null || trade.SteamID == null) {
                    return console.error(
                        "Invalid TradeID Lookup or Manual Change"
                    );
                }

                // Not a perm solution
                else if (trade.TransactionType == "Deposit" && trade.GameMode == "Jackpot") {
                    JackpotGame.findOne({ Status: true }, (err, game) => {
                        if (err) return console.error(err);
                        else if (game == null) {
                            activeJPGameID = Date.now();
                            let gameId = String(activeJPGameID);

                            let username;
                            let userPic;
                            let skinVals = [];
                            let skinPics = [];
                            let totalPot = 0;

                            allUsers.forEach((user) => {
                                if (user["SteamID"] == trade.SteamID) {
                                    username = user["Username"];
                                    userPic = user["ProfilePictureURL"];
                                }
                            });

                            trade.ItemNames.forEach((skin) => {
                                skins.forEach((val) => {
                                    if (skin == val["SkinName"]) {
                                        skinPics.push(val["SkinPictureURL"]);
                                        skinVals.push(val["Value"]);
                                        totalPot += val["Value"];
                                    }
                                });
                            });

                            let userBet = {
                                username: username,
                                userSteamId: trade["SteamID"],
                                userPicture: userPic,
                                skins: trade.ItemNames,
                                skinValues: skinVals,
                                skinIDs: trade.Items,
                                skinPictures: skinPics,
                            };

                            let fullBetList = [];

                            fullBetList.push(userBet);

                            JackpotGame.create(
                                {
                                    GameID: gameId,
                                    Players: fullBetList,
                                    TotalPotValue: totalPot,
                                    Status: true,
                                },
                                (err, jp) => {
                                    if (err) return console.error(err);
                                    else {
                                        currentJPGame = jp;
                                        io.emit("jackpotLoader", jp);
                                        console.log("New Jackpot Game");

                                        TradeHistory.findOneAndUpdate(
                                            { TradeID: trade["TradeID"] },
                                            { GameID: activeJPGameID },
                                            { upsert: true },
                                            (err, doc) => {
                                                if (err)
                                                    return console.error(err);
                                            }
                                        );
                                    }
                                }
                            );
                        } else {
                            let username;
                            let userPic;
                            let skinVals = [];
                            let skinPics = [];
                            let totalPot = game.TotalPotValue;

                            allUsers.forEach((user) => {
                                if (user["SteamID"] == trade.SteamID) {
                                    username = user["Username"];
                                    userPic = user["ProfilePictureURL"];
                                }
                            });

                            trade.ItemNames.forEach((skin) => {
                                skins.forEach((val) => {
                                    if (skin == val["SkinName"]) {
                                        skinPics.push(val["SkinPictureURL"]);
                                        skinVals.push(val["Value"]);
                                        totalPot += val["Value"];
                                    }
                                });
                            });

                            let userBet = {
                                username: username,
                                userSteamId: trade["SteamID"],
                                userPicture: userPic,
                                skins: trade.ItemNames,
                                skinValues: skinVals,
                                skinIDs: trade.Items,
                                skinPictures: skinPics,
                            };

                            JackpotGame.findOneAndUpdate(
                                { GameID: game["GameID"] },
                                {
                                    $push: { Players: userBet },
                                    $set: { TotalPotValue: totalPot },
                                },
                                { upsert: true },
                                (err, jp) => {
                                    if (err) return console.error(err);
                                    else {
                                        console.log(jp);
                                        io.emit("jackpotLoader", jp);

                                        if (countDown != true) {
                                            countDown = true;
                                        }

                                        TradeHistory.findOneAndUpdate(
                                            { TradeID: trade["TradeID"] },
                                            { GameID: activeJPGameID },
                                            { upsert: true },
                                            (err, doc) => {
                                                if (err)
                                                    return console.error(err);
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    });

                    console.log(offer.id + " Trade was Accepted");
                }

                else if (trade.TransactionType == "Deposit" && trade.GameMode == "Coin Flip") {
                    CoinFlipGame.findOne(
                        { GameID: trade.GameID },
                        (err, activeCFGame) => {
                            if (err) return console.error(err);
                            else if (activeCFGame == null) {
                                console.log(
                                    "Invlaid coin flip game look up or something I don't know"
                                );
                            } else if (
                                activeCFGame.Status == true &&
                                (activeCFGame.PlayerTwoTradeState == null ||
                                    activeCFGame.PlayerTwoTradeState ==
                                        undefined)
                            ) {
                                // pushes a new coin flip game to the website for people to join

                                let username;
                                let userPic;
                                let skinVals = [];
                                let skinPics = [];
                                let totalVal = 0;

                                allUsers.forEach((user) => {
                                    if (user["SteamID"] == trade.SteamID) {
                                        username = user["Username"];
                                        userPic = user["ProfilePictureURL"];
                                    }
                                });

                                if (username == undefined) {
                                    username = "Unknown";

                                    // probably should throw an error or something
                                }

                                trade.ItemNames.forEach((skin) => {
                                    skins.forEach((val) => {
                                        if (skin == val["SkinName"]) {
                                            skinPics.push(
                                                val["SkinPictureURL"]
                                            );
                                            skinVals.push(val["Value"]);
                                            totalVal += val["Value"];
                                        }
                                    });
                                });

                                let userBet = {
                                    username: username,
                                    userSteamId: trade["SteamID"],
                                    userPicture: userPic,
                                    skins: trade.ItemNames,
                                    skinValues: skinVals,
                                    skinIDs: trade.Items,
                                    skinPictures: skinPics,
                                };

                                let fullBetList = [];

                                fullBetList.push(userBet);

                                CoinFlipGame.findOneAndUpdate(
                                    { GameID: activeCFGame.GameID },
                                    {
                                        $set: {
                                            Players: fullBetList,
                                            TotalValue: totalVal,
                                            PlayerOneTradeState:
                                                TradeOfferManager
                                                    .ETradeOfferState[
                                                    offer.state
                                                ],
                                        },
                                    },
                                    (err, cf) => {
                                        if (err) return console.error(err);
                                        else {
                                            console.log(
                                                "New Coin Flip game was created: " +
                                                    cf.GameID
                                            );

                                            coinFlipUpdater.addNewActiveGame(
                                                cf.GameID
                                            );
                                        }
                                    }
                                );
                            }
                            else if (activeCFGame.Status == true && (activeCFGame.PlayerTwoTradeState != null ||activeCFGame.PlayerTwoTradeState != undefined)) {
                                // makes the player join the active coin flip game and starts the count down time for it about to flip

                                let username;
                                let userPic;
                                let skinVals = [];
                                let skinPics = [];
                                let totalVal = activeCFGame.TotalValue;

                                allUsers.forEach((user) => {
                                    if (user["SteamID"] == trade.SteamID) {
                                        username = user["Username"];
                                        userPic = user["ProfilePictureURL"];
                                    }
                                });

                                if (username == undefined) {
                                    username = "Unknown";
                                    // probably should throw an error
                                }

                                trade.ItemNames.forEach((skin) => {
                                    skins.forEach((val) => {
                                        if (skin == val["SkinName"]) {
                                            skinPics.push(
                                                val["SkinPictureURL"]
                                            );
                                            skinVals.push(val["Value"]);
                                            totalVal += val["Value"];
                                        }
                                    });
                                });

                                let userBet = {
                                    username: username,
                                    userSteamId: trade["SteamID"],
                                    userPicture: userPic,
                                    skins: trade.ItemNames,
                                    skinValues: skinVals,
                                    skinIDs: trade.Items,
                                    skinPictures: skinPics,
                                };

                                CoinFlipGame.findOneAndUpdate(
                                    { GameID: activeCFGame.GameID },
                                    {
                                        $push: { Players: userBet },
                                        $set: {
                                            TotalValue: totalVal,
                                            PlayerTwoTradeState:
                                                TradeOfferManager
                                                    .ETradeOfferState[
                                                    offer.state
                                                ],
                                        },
                                    },
                                    (err, cf) => {
                                        if (err) return console.error(err);
                                        else {
                                            console.log(
                                                username +
                                                    " Joined: " +
                                                    cf.GameID
                                            );

                                            coinFlipUpdater.opponentAcceptedTrade(cf);
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    }
});

// Jackpot Timer
let setIntervalDelay = 1000;

function jackpotTimer() {
    if (countDown && jpTimer > 0) {
        jpTimer -= 1;
        io.emit("jackpotCountDown", jpTimer);

        if (jpTimer == 0) {
            readyToRoll = true;
        }
    } else if (readyToRoll) {
        JackpotGame.findOne({ GameID: activeJPGameID }, (err, jpGame) => {
            if (err) return console.error(err);
            else {
                JackpotGame.findOneAndUpdate(
                    { GameID: activeJPGameID },
                    { Status: false },
                    { upsert: true },
                    (err, jpGame) => {
                        if (err) console.error(err);
                    }
                );

                countDown = false;
                readyToRoll = false;

                selectWinner.jackpotWinner(jpGame, (winner, error) => {
                    if (error) console.error(error);
                    else {
                        console.log(winner);

                        let person;

                        allUsers.forEach((user) => {
                            if (user["SteamID"] == winner) {
                                person = user;
                            }
                        });

                        io.emit("jackpotCountDown", person.Username);

                        selectWinner.takeJackpotProfit(
                            jpGame,
                            person,
                            skins,
                            (skinList, error) => {
                                if (error) console.error(error);
                                else {
                                    bot.sendWithdraw(
                                        skinList,
                                        person,
                                        (data, err) => {
                                            if (err) console.error(err);
                                            else {
                                                console.log(data);
                                            }
                                        }
                                    );
                                    currentJPGame = null;
                                    jpTimer = 120;
                                }
                            }
                        );
                    }
                });
            }
        });
    } else {
        io.emit("jackpotCountDown", "Waiting for Next Jackpot Game To Start");
    }
}

let serverJPTimer = setInterval(jackpotTimer, setIntervalDelay);

setInterval(async function () {
    await updateValues();

    MarketPrice.find({}, (err, skinsList) => {
        if (err) throw err;
        skins = skinsList;
    });
}, 1000 * 60 * 60 * 12);

//////////////////////////////////////////////////////////////
// im going to lose my mind it cant call this fucking function

// This is what pushes the updates to the frontend
const callCoinFlipUpdate = async () => {
    try {
        let modify = await coinFlipUpdater.coinFlipUpdates();

        io.emit("coinFlipLoader", modify);

        return modify;
    } catch (e) {
        return console.log(e);
    }
};

let updates;
const coinFlipTimer = setInterval(async function () {
    updates = await callCoinFlipUpdate();

    updates.forEach((gameObj) => {

        if (gameObj.playerTwoState == "cancel") {
            bot.cancelOpponentCoinFlipTradeOffer(gameObj.gameID);
        }

        if (gameObj.winner != "none") {
            console.log(gameObj.winner)
        }
    });
    
}, 1000);

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
