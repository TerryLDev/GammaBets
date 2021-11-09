const router = require('express').Router();
const nunjucks = require('nunjucks');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

const User = require('../models/user.model');
const TradeHistory = require('../models/tradehistory.model');
const Support = require('../models/support.model');
const MarketPrice = require('../models/marketprice.model');
const CoinFlipGame = require('../models/coinflipgame.model');
const JackpotGame = require('../models/jackpotgame.model');

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

app.set('views', '../views')
app.set('view engine', 'html')

router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
});

router.get('/', (req, res) => {
    
    req.session.isAuth = true;
    let userProfile;

    if (req.user == undefined || req.user == null) { 
        userProfile = "welcome";
        res.render('index.html', { user : userProfile });
    }

    else if (req.user != undefined || req.user != null) {
        User.findOne({"SteamID": req.user["_json"]["steamid"]}, (err, data)=> {
            if (err) userProfile = "welcome";
            userProfile = data;
            res.render('index.html', { user : userProfile });
        });

    }

    else {

        userProfile = "welcome";
        res.render('index.html', { user : userProfile });

    }

});

router.get('/coinflip', (req, res) => {

    req.session.isAuth = true;
    let userProfile;

    if (req.user == undefined || req.user == null) { 
        userProfile = "welcome";
        res.render('coinflip.html', { user : userProfile });
    }

    else if (req.user != undefined || req.user != null) {
        
        User.findOne({"SteamID": req.user["_json"]["steamid"]}, (err, data)=> {
            if (err) {
                userProfile = "welcome";
                res.render('coinflip.html', { user : userProfile });
            }

            else {
                userProfile = data;
                res.render('coinflip.html', { user : userProfile });
            }

        });

    }

})

module.exports = router;