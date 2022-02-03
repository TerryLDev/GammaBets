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
                    data: false
                }
                next();
            }

            else if(userProfile == undefined || userProfile == null) {
                req.player = {
                    auth: false,
                    data: false
                }
                next();
            }

            else {
                const data = {steam: req.user, user: userProfile}

                req.player = {
                    auth: true,
                    data: data
                }

                next();
            }
        })

    }

})

router.use("/api/user", (req, res, next) => {
    res.json(req.player);
    next();
})

module.exports = router;