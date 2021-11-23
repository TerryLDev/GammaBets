require('dotenv').config(__dirname + '/.env');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const async = require('async');

// Models
const User = require('../models/user.model');
const MarketPrice = require('../models/marketprice.model');
const CoinFlipGame = require('../models/coinflipgame.model');

// SteamBot
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const community = new SteamCommunity;
const manager = new TradeOfferManager;
const client = new SteamUser;

const SteamBot = require("../steam/bot");

const fs = require('fs');

function decideCoinFlipWinner(cfGammID) {

    try {

        CoinFlipGame.findOne({"GameID": cfGammID}, (err, cf) => {
            if (err) return console.error(err)
    
            else {
    
                try {

                    let listOfPlayers = []
                    
                    cf.Players.forEach(player => { 
                        
                        let playerTotalVal = 0;
            
                        player['skinValues'].forEach(val => {
                            playerTotalVal += val
                        })
            
                        for(let i = 0; i < playerTotalVal; i++){
                            listOfPlayers.push(player.userSteamId);
                        }
            
                    });
            
                    const shuffled = listOfPlayers.sort(() => Math.random - 0.5)
            
                    let randomWinner = Math.floor(Math.random()*shuffled.length);
            
                    return shuffled[randomWinner]

                }
            
                catch (error) {
                    return error
                }
            }
        });
    }
    catch(e) {
        return e
    }
}

function addNewActiveGame(cfGame) {

    try {

        let activeGames;

        let newEntry = {
            gameID: cfGame.GameID,
            playerOneState: cfGame.PlayerOneTradeState,
            playerTwoState: "none",
            timer: false,
            gameState: cfGame.Status,
            winner: "none",
            wait: process.env.COIN_FLIP_ENDING_WAIT_TIME
        }

        let json = fs.readFileSync(`${__dirname}/cfgames.json`, {encoding:"utf-8"})

        activeGames = JSON.parse(json)

        activeGames.push(newEntry)

        fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(activeGames));

    }

    catch(e) {
        console.log(e)
    }
}

/*
let newEntry = {
            gameID: cfGame.GameID,
            playerOneState: cfGame.PlayerOneTradeState,
            playerTwoState: "none",
            timer: false,
            gameState: cfGame.Status,
            winner: "none",
            wait: 10
        }
*/

// changes playerTwoState form "none" to "sent" or changes it to "Accepted"
async function opponentChangeStateCFGame(cfGame) {

    try {

        let json = await fs.readFileSync(`${__dirname}/cfgames.json`, {encoding: "utf-8"})

        let modify = JSON.parse(json)

        modify.forEach(obj => {
            if (obj.gameID == cfGame.GameID) {
                obj.playerTwoState = cfGame.PlayerTwoTradeState;
            }
        })

        fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(modify))
    }

    catch(err) {
        return console.log(err)
    }

}

// changes playerTwoState form "sent" to "none" if the user declined the trade offer sent to them
async function opponentDeclinedTrade(cfGame) {

    try {

        let json = await fs.readFileSync(`${__dirname}/cfgames.json`, {encoding: "utf-8"})

        modify = JSON.parse(json)

        modify.forEach(obj => {
            if (obj.gameID == cfGame.GameID) {
                obj.playerTwoState = "none";
                obj.timer = false;
            }
        })

        fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(modify))
    }

    catch(err) {
        return console.log(err)
    }

}

// changes playerTwoState from "sent" to "none" if the user has ran of time to accept the trade sent to them
// have the bot cancel the trade that was sent to the person
function tradeCountDownExpired(cfGame) {

    // call a function that cancels the trade


}

// after a certain amount of time a user can cancel their active game 
// 5 mins?
// worry about this later tbh
function requestCancelActiveCFGame(cfGame) {

}

// IT FUCKING WORKSSSSSSS FUCKING FINALLY
const coinFlipUpdates = async () => {

    try {

        let json = fs.readFileSync(`${__dirname}/cfgames.json`, {encoding: "utf-8"})

        modify = JSON.parse(json);

        modify.forEach(gameObj => {

            if(gameObj.gameState == true) {

                // checks if an opponent was sent a trade
                if(gameObj["playerOneState"] == "Accepted" && gameObj["playerTwoState"] == "sent" && gameObj["timer"] === false) {
                    gameObj["timer"] = process.env.COIN_FLIP_OPPONENT_JOINING_TIME;
                }

                // changes the timer while waiting for the opponent to join
                else if(gameObj["playerOneState"] == "Accepted" && gameObj["playerTwoState"] == "sent" && gameObj["timer"] >= 1) {
                    gameObj["timer"] = gameObj["timer"] - 1;

                }

                // should send a request to the server and website that the opponent failed ot accept the trade in time
                else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "sent" && gameObj.timer == 0) {
                    console.log(`Canel opponent's trade with GameID: ${gameObj.gameID}`)

                    gameObj.timer = false;
                    gameObj.playerTwoState = "cancel";
                }

                // change the timer from a countdown for the trade to about to flip
                else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "Accepted" && gameObj.timer > 0) {
                    gameObj.timer = `Flipping in... ${process.env.COIN_FLIP_COUNTDOWN_TIME}`;
                }
                
                // change the flipping timer
                else if(parseInt(gameObj.timer.split("Flipping in... ")[1]) >= 1) {

                    let currentFlipTimer = "Flipping in... " + (parseInt(gameObj.timer.split("Flipping in... ")[1]) - 1)

                    gameObj.timer = currentFlipTimer;
                    
                }

                // this should send a request to the server and website that it's time ot flip
                // this decides the winner
                else if(parseInt(gameObj.timer.split("Flipping in... ")[1]) == 0) {

                    console.log("Flipping!!!" + gameObj.gameID)

                    // call a function that decides a winner
                    let cfWinner = decideCoinFlipWinner(gameObj.gameID)

                    gameObj.winner = cfWinner;

                    gameObj.gameState = false;

                }


                else if (gameObj.winner != "none" && gameObj.wait <= process.env.COIN_FLIP_ENDING_WAIT_TIME && gameObj.wait != 0) {
                    gameObj.wait -= 1;
                }

                else if (gameObj.wait == 0) {

                    let gameIndex = modify.findIndex(slicer => {
                        if (slicer.gameID == gameObj.gameID) {
                            return obj
                        }
                    })

                    modify.splice(gameIndex, 1);

                }

                else if (gameObj.playerTwoState == "cancel") {
                    gameObj.playerTwoState = "none";
                }
                
            }
        })

        fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(modify))

        return modify;

    }

    catch (err) {
        return err
    }

}

module.exports = {decideCoinFlipWinner, addNewActiveGame, coinFlipUpdates, opponentChangeStateCFGame, opponentDeclinedTrade}
