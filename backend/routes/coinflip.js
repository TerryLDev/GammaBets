const router = require("express").Router();
const express = require('express');
const nunjucks = require("nunjucks");

const User = require("../models/user.model");
const app = express();

app.set('views', '../views')
app.set('view engine', 'html')

const { CoinFlipHandler, cfEvents, allCFGames, cfHistory } = require("../gammabets/handler/coinflip-handler")
const cfGameHandler = new CoinFlipHandler();

router.get("/coinflip/active", (req, res) => {

	console.log("grabbing current games")
	res.json(allCFGames);

});

router.get("/coinflip/history", (req, res) => {
	
	console.log("grabbing current cf history")
	res.json(cfHistory);

});


module.exports = router;