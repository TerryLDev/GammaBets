const router = require("express").Router();
const express = require('express');

const mainApp = require("../app");

// When user accesses the page, send the most recent pot info (pull array of people in pot)

router.post("/jackpot/highstakes", (req, res) => {
	
	res.json(mainApp.highStakesActiveGame);

});

/* push the history of highstakes
router.post("/jackpot/highstakes/history", (req, res) => {
	
	res.json(mainApp.highStakesActiveGame);

});
*/

module.exports = router;