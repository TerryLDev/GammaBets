const router = require("express").Router();
const express = require('express');
const path = require('path');

router.get("/", (req, res) => {
    res.sendFile(path.resolve('backend/public/index.html'));
});

router.get("/coinflip", (req, res) => {
    res.sendFile(path.resolve('backend/public/index.html'));
});

router.get("/tos", (req, res) => {
    res.sendFile(path.resolve('backend/public/index.html'));
});

router.get("/support", (req, res) => {
    res.sendFile(path.resolve('backend/public/index.html'));
});

module.exports = router;