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

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});

mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("Connected to MongoDB..."))
    .catch(err => console.log(err.reason));


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
const port = 80;

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

io.on('connection', (socket) => {
    io.sockets.emit('chat', messages);

    socket.on('chat', (data) => {

        messages.push(data);

        io.sockets.emit('chat', messages);

    });

    socket.on('jackpot-deposit', (data) =>{
        // add a function that sends a request to the bots to make a trade and return a trade link
        // wait to see if the trade link is successful
        // if so send the trade link
        // else send an error message
    });

    socket.on('jackpot', (data) => {
        io.sockets.emit('jackpot', data);
    });

    socket.on('addTradeURL', (data) => {

        User.findOneAndUpdate({"SteamID" : data.steamID}, {"TradeURL" : data.trade}, {upsert: true}, function(err, data) {
            if(err) console.error(err);
            io.sockets.emit('addTradeURL', "big peepee");
        });
        // this still needs to pull their url and load the inventory 
    })

    socket.on('getInventory', (data) => {
        // sends a request for the bot to check their inventory from rust
        
        User.findOne({"SteamID": data.steamID}, (err, doc) => {
            if (err) return console.error(err);

            community.getUserInventoryContents(doc['SteamID'], 252490, 2, true, (err, inv) => {
                
                if (err) console.error(err);
                
                else { 
                    io.sockets.emit('getInventory', inv)
                }
            });
        });
    });

    socket.on('makeJackpotDeposit', (data) => {

    });

});