require('dotenv').config(__dirname + '/.env');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const async = require('async');

const socket = require('socket.io');

// Models
const User = require('../models/user.model');
const TradeHistory = require('../models/tradehistory.model');
const Support = require('../models/support.model');
const MarketPrice = require('../models/marketprice.model');
const CoinFlipGame = require('../models/coinflipgame.model');
const JackpotGame = require('../models/jackpotgame.model');

// SteamBot
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const community = new SteamCommunity;
const manager = new TradeOfferManager;
const client = new SteamUser;

const SteamBot = require("../steam/bot");

const fs = require('fs');

function decideCoinFlipWinner(cfGammID, callback) {
    
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
        
                return callback(shuffled[randomWinner])
            }
        
            catch (error) {
                return callback(error)
            }
        }
    });
}

async function addNewActiveGame(cfGame) {
    let activeGames;

    let newEntry = {
        gameID: cfGame.GameID,
        playerOneState: cfGame.PlayerOneTradeState,
        playerTwoState: "none",
        timer: false,
        gameState: cfGame.Status,
    }

    fs.readFile(`${__dirname}/cfgames.json`, "utf-8", (err, data) => {
        if (err) console.log(err)

        else {
            activeGames = JSON.parse(data)

            activeGames.push(newEntry)

            fs.writeFile("./test.json", JSON.stringify(activeGames), (err) => {
                if(err) console.log(err);
            });
        }
    })
}

// IT FUCKING WORKSSSSSSS FUCKING FINALLY
function coinFlipUpdates() {

    let modify;

    fs.readFile(`${__dirname}/cfgames.json`, "utf-8", (err, data) => {

        if(err) return console.error(err)

        else {

            modify = JSON.parse(data);

            return modify;

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
                    }
    
                    // change the timer from a countdown for the trade to about to flip
                    else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "Accepted" && gameObj.timer > 0) {
                        gameObj.timer = `Flipping in... ${process.env.COIN_FLIP_COUNTDOWN_TIME}`;
                    }
                    
                    // change the flipping timer
                    else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "Accepted" && parseInt(gameObj.timer.split("Flipping in... ")[1]) >= 1) {
    
                        let currentFlipTimer = "Flipping in... " + (parseInt(gameObj.timer.split("Flipping in... ")[1]) - 1)
    
                        gameObj.timer = currentFlipTimer;
                        
                    }
    
                    // this should send a request to the server and website that it's time ot flip
                    else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "Accepted" && parseInt(gameObj.timer.split("Flipping in... ")[1]) == 0) {
    
                        console.log("Flipping!!!" + gameObj.gameID)
    
                        let gameIndex = modify.findIndex(obj => {
                            if (obj.gameID == gameObj.gameID) {
                                return obj
                            }
                        })
    
                        modify.splice(gameIndex, 1);
    
                        // call a function that decides a winner
                        decideCoinFlipWinner(gameObj.gameID)
    
                    }
                    
                }
            })
    
            fs.writeFile(`${__dirname}/cfgames.json`, JSON.stringify(modify), (err) => {
                if (err) return console.error(err);

                else {
                    console.log(modify);
                    return modify;
                }
            })

        }
        
    })

}

module.exports = {decideCoinFlipWinner, addNewActiveGame, coinFlipUpdates}
