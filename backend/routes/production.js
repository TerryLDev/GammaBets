const router = require("express").Router();
const express = require('express');

router.get("/", (req, res) => {
    res.send(__dirname + "/public/index.html");
});

router.get("/coinflip", (req, res) => {
    res.send(__dirname + "/public/index.html");
});

module.exports = router;