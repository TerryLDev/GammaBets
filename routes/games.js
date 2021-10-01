const router = require('express').Router();
const nunjucks = require('nunjucks');
const express = require('express');
const session = require('express-session');

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
    res.render('index');
});

module.exports = router