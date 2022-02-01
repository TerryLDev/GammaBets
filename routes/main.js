const router = require("express").Router();
const express = require('express');
const nunjucks = require("nunjucks");

const User = require("../models/user.model");
const app = express();

app.set('views', '../views')
app.set('view engine', 'html')

router.use((req, res, next) => {

    if (req.user == undefined || req.user == null) {
        req.player = {
            found: false,
            data: false
        }
        next();
    }

    else {

        User.findOne({SteamID: req.user["_json"]["steamid"]}, (err, userProfile) => {
            
            if (err) {
                req.player = {
                    found: false,
                    data: false
                }
                next();
            }

            else if(userProfile == undefined || userProfile == null) {
                req.player = {
                    found: false,
                    data: false
                }
                next();
            }

            else {
                const data = {steam: req.user, user: userProfile}

                req.player = {
                    found: true,
                    data: data
                }

                next();
            }
        })

    }

})

router.use("/user.json", (req, res, next) => {
    res.json(req.player);
    next();
})

module.exports = router;