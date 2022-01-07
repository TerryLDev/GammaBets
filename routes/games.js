const router = require("express").Router();
const express = require('express');
const nunjucks = require("nunjucks");

const User = require("../models/user.model");
const app = express();

app.set('views', '../views')
app.set('view engine', 'html')

const cfGame = require("../serverScripts/revisedcoinflip")

const cfGameHandler = new cfGame.ActiveCoinFlipGame();


router.use(function timeLog(req, res, next) {
	console.log("Time: ", Date.now());
	next();
});

router.use("/coinflip/json", function(req, res, next) {

	const allCFGameJson = JSON.stringify(cfGameHandler.gameJson());

	res.json(allCFGameJson)
	next();

});

router.get("/", (req, res) => {
	req.session.isAuth = true;
	let userProfile;

	if (req.user == undefined || req.user == null) {
		userProfile = "welcome";
		res.render("index.html", { user: userProfile });
	}
	else if (req.user != undefined || req.user != null) {
		User.findOne({ SteamID: req.user["_json"]["steamid"] }, (err, data) => {
			if (err) userProfile = "welcome";
			userProfile = data;
			res.render("index.html", { user: userProfile });
		});
	}
	else {
		userProfile = "welcome";
		res.render("index.html", { user: userProfile });
	}
});

router.get("/coinflip", (req, res) => {
	req.session.isAuth = true;
	let userProfile;

	if (req.user == undefined || req.user == null) {
		userProfile = "welcome";
		res.render("coinflip.html", { user: userProfile });
	} else if (req.user != undefined || req.user != null) {
		User.findOne({ SteamID: req.user["_json"]["steamid"] }, (err, data) => {
			if (err) {
				userProfile = "welcome";
				res.render("coinflip.html", { user: userProfile });
			} else {
				userProfile = data;
				res.render("coinflip.html", { user: userProfile });
			}
		});
	}
});

module.exports = router;
