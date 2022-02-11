const router = require("express").Router();
const express = require('express');
const nunjucks = require("nunjucks");

const User = require("../models/user.model");
const app = express();

app.set('views', '../views')
app.set('view engine', 'html')

const { CoinFlipHandler, cfEvents, allCFGames } = require("../gammabets/handler/coinflip-handler")
const cfGameHandler = new CoinFlipHandler();

router.use("/coinflip/json", function(req, res, next) {

	res.json(allCFGames);
	next();

});

router.get("/coinflip", (req, res) => {

	let pageFormat = {
		pageName: "CoinFlip",
	}

	req.player.page = pageFormat;

	if (req.player.found != undefined) {
		res.render("coinflip",  req.player);
	}

	else {
		res.render("coinflip", req.player);
	}

});


module.exports = router;