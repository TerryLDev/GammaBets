const router = require("express").Router();
const express = require('express');
const nunjucks = require("nunjucks");

const User = require("../models/user.model");
const app = express();

const mainApp = require("../app");

app.set('views', '../views');
app.set('view engine', 'html');

// When user accesses the page, send the most recent pot info (pull array of people in pot)

router.get("/highstakes/pot.json", (req, res) => {

	res.json(JSON.stringify(mainApp.highStakesActiveGame));

});

router.get("/", (req, res) => {

	let pageFormat = {
		potMin: "$1.00",
		pageName: "High Stakes",
		potMax: "No Limit",
	}

	req.player.page = pageFormat;

	if (req.player.found != undefined) {
		console.log(req.player);
		res.render("index",  req.player);
	}

	else {
		res.render("index", req.player);
	}

});

router.get("/lowstakes", (req, res) => {

	let pageFormat = {
		potMin: "$1.00",
		pageName: "Low Stakes",
		potMax: "$20.00",
	}

	req.player.page = pageFormat;

	if (req.player.found != undefined) {

		res.render("index",  req.player);
	}

	else {
		res.render("index", req.player);
	}

});

module.exports = router;