let router = require("express").Router();


router.use(function timeLog(req, res, next) {
	console.log("Time: ", Date.now());
	next();
});

router.get("/support", (req, res) => {
	res.send("This page does not exist yet");
});

module.exports = router;
