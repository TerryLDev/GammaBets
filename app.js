const express = require('express');
require('dotenv').config(__dirname + '/.env');
const nunjucks = require('nunjucks');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const socket = require('socket.io');
const async = require('async');

const helmet = require('helmet');

const app = express();

// Models
const User = require('./models/user.model');
const TradeHistory = require('./models/tradehistory.model');
const Support = require('./models/support.model');
const MarketPrice = require('./models/marketprice.model');
const CoinFlipGame = require('./models/coinflipgame.model');
const JackpotGame = require('./models/jackpotgame.model');

// Router
const gameRoutes = require('./routes/games');
const supportRoutes = require('./routes/support');

// SteamBot
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const community = new SteamCommunity;
const manager = new TradeOfferManager;
const client = new SteamUser;

const SteamBot = require("./steam/bot");
const { response } = require('express');

mongo_uri = process.env.MONGO_URI;

let skins;
let allUsers;

mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) throw err;
    else {
        console.log('Connected to MongoDB...')

        MarketPrice.find({}, (err, skinsList) => {
            if (err) throw err;
            skins = skinsList;
        });

        User.find({}, (err, data) => {
            if (err) throw err;
            allUsers = data;
        });
    }
});

// Setting up cookies
app.use(session({
    secret: 'this is gonna make people big poor',
    store: MongoStore.create({
        mongoUrl: mongo_uri,
    }),
    name: 'RustSite',
    resave: false,
    saveUninitialized: false,
    cookie : {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Localhost port
const port = process.env.PORT;

// Set Up config for Steambots
const bot = new SteamBot({
    accountName: 'bigstonkdaddy',
    password: 'If#219jZ1!',
    twoFactorCode: SteamTotp.generateAuthCode("nDvhKfTBcAGGJyxCNSTYcaMh+0s="),

});

// Authentcation startegy for Passport
const SteamStrategy = passportSteam.Strategy;

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new SteamStrategy({
    returnURL: `http://localhost:${port}/auth/steam/return`,
    realm: `http://localhost:${port}/`,
    apiKey: '04CC7E23FCFEEDED67B7928E6EAB2E58'
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
        profile.identifier = identifier;
        
        let user = profile['_json'];
        console.log(user);

        User.exists({SteamID: user["steamid"]})
            .then((result) =>{
                if (result == false) {
                    User.create({
                        SteamID: user['steamid'],
                        Username: user['personaname'],
                        ProfilePictureURL: user['avatar'],
                        ProfileURL: user['profileurl'],
                        DateJoined: Date.now()
                    })
                        .then((result) => {
                            User.save()
                                .then((result)=>{
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
                    console.log('User Exists');
                }
            })
            .catch((err) => {
                console.error(err);
            });

        return done(null, profile);
    });
  }
));

// Finalize passport with cookies
app.use(passport.initialize());
app.use(passport.session());

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

app.use("/static", express.static('static'));

app.set('views', './views')
app.set('view engine', 'html')

app.get('/auth/steam',
  passport.authenticate('steam'),
  function(req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
  });

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home
    req.session.isAuth = true;
    res.redirect('/');
  });
  
app.use('/', gameRoutes);
app.use('/support', supportRoutes);

const server = app.listen(port, (err) => {
    if (err) return console.error(err);
    console.log(`Port: ${port}, Server Running...`)

});

const io = socket(server);
const messages = []

let activeJPGameID;

io.on('connection', (socket) => {

    socket.emit('chat', messages);

    socket.on('chat', (data) => {

        messages.push(data);

        io.emit('chat', messages);

    });

    socket.on('addTradeURL', (data) => {

        User.findOneAndUpdate({"SteamID" : data.steamID}, {"TradeURL" : data.trade}, {upsert: true}, function(err, data) {
            if(err) console.error(err);
            socket.emit('addTradeURL', "big peepee");
        });
        // this still needs to pull their url and load the inventory 
    })

    socket.on('getInventory', (data) => {
        // sends a request for the bot to check their inventory from rust

        MarketPrice.find({}, (err, skinsList) => {
            if (err) throw err;
            skins = skinsList;
        });

        User.find({}, (err, data) => {
            if (err) throw err;
            allUsers = data;
        });
        
        User.findOne({"SteamID": data.steamID}, (err, doc) => {
            if (err) return console.error(err);

            community.getUserInventoryContents(doc['SteamID'], 252490, 2, true, (err, inv) => {

                if (err) console.error(err);
                
                else {

                    let userInv = []
                    
                    inv.forEach(item => {

                        skins.forEach(skin => {

                            if (item['name'] == skin['SkinName']) {
                                
                                userInv.push({
                                    name: item['name'],
                                    id: item['id'],
                                    price: skin['Value'],
                                    imageURL: skin['SkinPictureURL']
                                });
                            }
                            
                        });
                    });

                    socket.emit('getInventory', userInv)
                }
            });
        });
    });

    socket.on('makeJackpotDeposit', (data) => {
        bot.sendDepositTradeOffer(data.user, data.skins, data.tradeURL, 'j');
    });

    socket.on('jackpotGame', (data) => {

    });

});

// SteamBot Events
bot.client.on('tradeResponse', (steamID, response) => {
    console.log(steamID);
    console.log(response);
});

bot.manager.on('sentOfferChanged', (offer, oldState) => {
    
    if (TradeOfferManager.ETradeOfferState[offer.state] == 'Declined') {
            TradeHistory.findOneAndUpdate({"TradeID": offer.id}, {"State": TradeOfferManager.ETradeOfferState[offer.state]}, {upsert: true}, (err, data) => {
                if (err) return console.error(err);
                console.log(offer.id + ' Trade was Declined');
                io.sockets.emit('jackpotDepositDeclined', doc);
            });
    }

    else if (TradeOfferManager.ETradeOfferState[offer.state] == 'Accepted') {
        
        TradeHistory.findOneAndUpdate({"TradeID": offer.id}, {"State": TradeOfferManager.ETradeOfferState[offer.state]}, {upsert: true}, (err, doc) => {
            
            if (err) return console.error(err);

            else {

                JackpotGame.findOne({"Status": true}, (err, game) => {
                    console.log(game);
                    if (err) return console.error(err);
                    
                    else if(game == null) {

                        activeJPGameID = Date.now();
                        let gameId = String(activeJPGameID);

                        let username;

                        allUsers.forEach(user => {
                            if (user['SteamID'] == doc.SteamID) {
                                username = user['Username'];
                            }
                        });
                        
                        let userBet = {
                            username: username,
                            userSteamId: doc.SteamID,
                            skins: doc.ItemNames,
                            skinIDs: doc.Items
                        };

                        let fullBetList = [];

                        fullBetList.push(userBet);

                        JackpotGame.create({
                            GameID: gameId,
                            Players: fullBetList,
                            Status: true
                        }, (err, data) => {
                            if (err) return console.error(err);

                            else {
                                io.emit('jackpotDepositAccepted', doc);
                            }
                        })
                    }

                    else {
                        let username;

                        allUsers.forEach(user => {
                            if (user['SteamID'] == doc.SteamID) {
                                username = user['Username'];
                            }
                        });
                        
                        let userBet = {
                            username: username,
                            userSteamId: doc.SteamID,
                            skins: doc.ItemNames,
                            skinIDs: doc.Items
                        };

                        JackpotGame.findOneAndUpdate({'GameID': game['GameID']}, {$push: {Players: userBet}}, (err, data) => {
                            if (err) return console.error(err);
                            else {
                                io.emit('jackpotDepositAccepted', doc);
                            }
                        })

                        // Update theri trade to show the gameId of the jackpot they joined

                    }
                });

                console.log(offer.id + ' Trade was Accepted');

            }

        });
    }
});