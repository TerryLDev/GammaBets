const router = require("express").Router();
const express = require('express');

const { allCFGames, cfHistory, joiningQueue } = require("../gammabets/handler/coinflip-handler")

router.post("/coinflip/active", (req, res) => {

	const sender = [];

	allCFGames.forEach(obj => {
		const entry = {
			game: obj.game,
			timer: obj.game
		}

		sender.push(entry);
	});

	res.json(sender);

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