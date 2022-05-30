const router = require("express").Router();
const express = require('express');

const { highStakesActiveGame, highStakesHistory, highStakesTimer } = require("../gammabets/handler/high-stakes-handler");

const { lowStakesActiveGame, lowStakesHistory, lowStakesTimer } = require("../gammabets/handler/low-stakes-handler");

// When user accesses the page, send the most recent pot info (pull array of people in pot)

// High Stakes

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

// Low Stakes

router.post("/jackpot/lowstakes", (req, res) => {

	const sender = {
		GameID: lowStakesActiveGame.GameID,
    Players: lowStakesActiveGame.Players,
    TotalPotValue: lowStakesActiveGame.TotalPotValue,
    Winner: lowStakesActiveGame.Winner,
	}
	
	console.log("Getting Low Stakes Current Game");
	res.json(sender);

});

router.post("/jackpot/lowstakes/timer", (req, res) => {

	const sender = {
		time: lowStakesTimer.time
	}
	
	console.log("Getting Low Stakes Current Time");
	res.json(sender);

});

router.post("/jackpot/lowstakes/history", (req, res) => {

	const sender = {
		topGame: lowStakesHistory.topGame,
		history: lowStakesHistory.history,
	};
	
	console.log("Getting Low Stakes History")
	res.json(sender);

});

module.exports = router;