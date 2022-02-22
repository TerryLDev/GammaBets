const router = require("express").Router();
const express = require('express');
const nunjucks = require("nunjucks");

const User = require("../models/user.model");
const app = express();

app.set('views', '../views')
app.set('view engine', 'html')

const { CoinFlipHandler, allCFGames, cfHistory, joiningQueue } = require("../gammabets/handler/coinflip-handler")
const cfGameHandler = new CoinFlipHandler();

router.post("/coinflip/active", (req, res) => {

	console.log("grabbing current games")
	res.json(allCFGames);

});

router.post("/coinflip/history", (req, res) => {
	
	console.log("grabbing current cf history")
	res.json(cfHistory);

});

router.post("/coinflip/joining-queue", (req, res) => {
	
	console.log("grabbing current cf joining queue")
	res.json(joiningQueue.queue);

});

module.exports = router;