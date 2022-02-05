const router = require("express").Router();
const express = require('express');

const User = require("../models/user.model");
const app = express();
router.use((req, res, next) => {

    if (req.user == undefined || req.user == null) {
        req.player = {
            auth: false,
            data: false
        }
        next();
    }

    else {

        User.findOne({SteamID: req.user["_json"]["steamid"]}, (err, userProfile) => {
            
            if (err) {
                req.player = {
                    auth: false,
                    user: false
                }
                next();
            }

            else if(userProfile == undefined || userProfile == null) {
                req.player = {
                    auth: false,
                    user: false
                }
                next();
            }

            else {

                req.player = {
                    auth: true,
                    user: userProfile
                }

                next();
            }
        })

    }

})

router.get("/user", (req, res, next) => {
    console.log("getting user info");
    res.json(req.player);
    next();
})

module.exports = router;