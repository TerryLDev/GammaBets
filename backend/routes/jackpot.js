const router = require("express").Router();
const express = require('express');

const { highStakesActiveGame, highStakesHistory, highStakesTimer } = require("../gammabets/handler/high-stakes-handler");


// When user accesses the page, send the most recent pot info (pull array of people in pot)

router.post("/jackpot/highstakes", (req, res) => {

	const sender = {
		GameID: highStakesActiveGame.GameID,
    Players: highStakesActiveGame.Players,
    TotalPotValue: highStakesActiveGame.TotalPotValue,
    Winner: highStakesActiveGame.Winner,
	}
	
	console.log("Getting High Stakes Current Game");
	res.json(sender);

});

router.post("/jackpot/highstakes/timer", (req, res) => {

	const sender = {
		time: highStakesTimer.time
	}
	
	console.log("Getting High Stakes Current Time");
	res.json(sender);

});

router.post("/jackpot/highstakes/history", (req, res) => {

	const sender = {
		topGame: highStakesHistory.topGame,
		history: highStakesHistory.history,
	};
	
	console.log("Getting High Stakes History")
	res.json(sender);

});

module.exports = router;