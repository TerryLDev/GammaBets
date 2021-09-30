const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config(__dirname + '/.env');
const nunjucks = require('nunjucks');
const path = require('path');

const app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

app.use(express.static('static'));

app.set('views', './views')
app.set('view engine', 'html')

app.get('/', (req, res) => {
    res.render('index', {test: "This is not a test"})
});

port = 5000
app.listen(5000, (err) => {
    if (err) return console.error(err);
    console.log(`Port: ${port}, Server Running...`)
});