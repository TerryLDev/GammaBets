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
            if (err) return err;
    
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

async function addNewActiveGame(cfID) {

    try {

        CoinFlipGame.findOne({"GameID": cfID}, (err, cfGame) => {
            
            if (err) return console.log(err);

            else {

                let json = fs.readFileSync(`${__dirname}/cfgames.json`, {encoding:"utf-8"})

                let activeGames = JSON.parse(json)

                let newEntry = {
                    gameID: cfGame.GameID,
                    playerOneUser: cfGame.Players[0].username,
                    playerOneId: cfGame.Players[0].userSteamId,
                    playerOnePicture: cfGame.Players[0].userPicture,
                    playerOneSkins: cfGame.Players[0].skins,
                    playerOneSkinValues: cfGame.Players[0].skinValues,
                    playerOneSkinPictures: cfGame.Players[0].skinPictures,
                    playerOneState: cfGame.PlayerOneTradeState,
                    playerOneSide: "none",
                    playerTwoUser: "none",
                    playerTwoId: "none",
                    playerTwoPicture: "none",
                    playerTwoSkins: "none",
                    playerTwoSkinValues: "none",
                    playerTwoSkinPictures: "none",
                    playerTwoState: "none",
                    playerTwoSide: 'none',
                    totalValue: cfGame.TotalValue,
                    timer: false,
                    gameState: cfGame.Status,
                    winner: "none",
                    wait: parseInt(process.env.COIN_FLIP_ENDING_WAIT_TIME),
                    slicerDelay: 3
                }

                if (cfGame.Red == "" || cfGame.Red == undefined) {

                    newEntry.playerOneSide = "black";
                    newEntry.playerTwoSide = "red";

                }

                else {
                    newEntry.playerOneSide = "red";
                    newEntry.playerTwoSide = "black";
                }

                activeGames.push(newEntry)
                // check if game alreayd exist 

                fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(activeGames));

            }
        })

    }

    catch(e) {
        console.log(e)
    }
}

// changes playerTwoState form "none" to "Active" or changes it to "Accepted"
async function opponentAcceptedTrade(cfGame) {

    try {

        let json = await fs.readFileSync(`${__dirname}/cfgames.json`, {encoding: "utf-8"})

        let modify = JSON.parse(json)

        modify.forEach(obj => {
            if (obj.gameID == cfGame.GameID) {
                obj.playerTwoSkins = cfGame.Players[1].skins;
                obj.playerTwoSkinValues = cfGame.Players[1].skinValues;
                obj.playerTwoSkinPictures = cfGame.Players[1].skinPictures;
                obj.playerTwoState = cfGame.PlayerTwoTradeState;
            }
        })

        fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(modify))
    }

    catch(err) {
        return console.log(err)
    }

}

async function opponentJoiningGame(gameID, username, userPicURL, steamID, tradeState) {

    try {
		let json = await fs.readFileSync(`${__dirname}/cfgames.json`, {
			encoding: "utf-8",
		});

		let modify = JSON.parse(json);

		modify.forEach((obj) => {
			if (obj.gameID == gameID) {
				obj.playerTwoTradeState = tradeState;
                obj.playerTwoId = steamID;
                obj.playerTwoUser = username;
                obj.playerTwoPicture = userPicURL;
			}
		});

		fs.writeFileSync(`${__dirname}/cfgames.json`, JSON.stringify(modify));
	} catch (err) {
		return console.log(err);
	}

}

// changes playerTwoState form "sent" to "none" if the user declined the trade offer sent to them
async function opponentDeclinedTrade(cfGame) {

    try {

        let json = await fs.readFileSync(`${__dirname}/cfgames.json`, {encoding: "utf-8"})

        modify = JSON.parse(json)

        modify.forEach(obj => {
            if (obj.gameID == cfGame.GameID) {
                obj.playerTwoUser =  "none"
                obj.playerTwoId = "none"
                obj.playerTwoPicture = "none"
                obj.playerTwoSkins = "none"
                obj.playerTwoSkinValues = "none"
                obj.playerTwoSkinPictures = "none"
                obj.playerTwoState = "none"
                obj.playerTwoSide = 'none'
                obj.totalValue = cfGame.TotalValue
                obj.timer = false
                obj.gameState = cfGame.Status
                obj.wait = parseInt(process.env.COIN_FLIP_ENDING_WAIT_TIME)
                obj.slicerDelay = 3
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

async function sendWithdrawAndTakeProfit (jsonGame, winnerId, botId) {
    // should return a list of what skins go to the winner
    try {
        await MarketPrice.find({}, (err, dbSkins) => {
            if (err) return console.log(err);

            let username;
            let percent = 0.1;

            if (jsonGame.playerOneId = winnerId) {
                username = jsonGame.playerOneUser;
            }
            else {
                username = jsonGame.playerTwoUser;
            }

            if (username.includes("gammabets")) {
                percent = 0.05;
            }

            let listOfPlayerSkins = [];
            let listOfSkinsValues = [];

            let totalValue = 0;

            jsonGame.playerTwoSkins.forEach(skin => {
                dbSkins.forEach(dbSkin => {
                    if (dbSkin.SkinName == skin) {
                        listOfPlayerSkins.push(dbSkin.SkinName);
                        listOfSkinsValues.push(dbSkin.Value);
                        totalValue += dbSkin.Value;
                    }
                })
            })

            let maxProfit = totalValue * percent;

            let profitAttempts = [];

            /* let attempt = {"value of attempt": [list of skins]} */
            
            for(let x = 0; x < 50; x++) {
                let shuffledList = listOfPlayerSkins.sort(() => Math.random - 0.5)

                let newAttempt = [];
                let attemptValue;

                shuffledList.forEach(shuffleSkin => {
                    dbSkins.forEach(dbSkin => {
                        if (dbSkin.SkinName == shuffleSkin) {

                            attemptValue += dbSkin.Value

                            if(attemptValue <= maxProfit) {

                                newAttempt.push(shuffleSkin);

                            }

                            else {
                                attemptValue -= dbSkin.Value;
                            }
                        }
                    })
                })

                valueRatio = totalValue / newAttempt.length;

                let attemptEntry = {
                    valueRatio: valueRatio,
                    skins: newAttempt,
                }

                profitAttempts.push(attemptEntry)
            }

            let withdrawSkins;
            let currentHigh = 0;
            let valueRatio = 0;

            profitAttempts.forEach(attempt => {

                if(attempt.total > currentHigh) {
                    
                    withdrawSkins = attempt.skins;
                    currentHigh = attempt.total;

                }

            });

            return withdrawSkins
        });
    }
    catch (err) {
        return console.log(err)
    }
}

// IT FUCKING WORKSSSSSSS FUCKING FINALLY
const coinFlipUpdates = async () => {

    try {

        let json = fs.readFileSync(`${__dirname}/cfgames.json`, {encoding: "utf-8"})

        modify = JSON.parse(json);

        modify.forEach(gameObj => {

            if(gameObj.gameState == true) {

                // checks if an opponent was sent a trade
                if(gameObj["playerOneState"] == "Accepted" && gameObj["playerTwoState"] == "Active" && gameObj["timer"] === false) {
                    gameObj["timer"] = parseInt(process.env.COIN_FLIP_OPPONENT_JOINING_TIME);
                }

                // changes the timer while waiting for the opponent to join
                else if(gameObj["playerOneState"] == "Accepted" && gameObj["playerTwoState"] == "Active" && gameObj["timer"] >= 1) {
                    gameObj["timer"] = gameObj["timer"] - 1;

                }

                // should send a request to the server and website that the opponent failed ot accept the trade in time
                else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "Active" && gameObj.timer == 0) {
                    console.log(`Canel opponent's trade with GameID: ${gameObj.gameID}`)

                    // timer ran out, cancel the trade
                    gameObj.timer = false;
                    gameObj.playerTwoState = "cancel";
                }

                // change the timer from a countdown for the trade to about to flip
                else if(gameObj.playerOneState == "Accepted" && gameObj.playerTwoState == "Accepted" && gameObj.timer > 0) {
                    gameObj.timer = `Flipping in... ${process.env.COIN_FLIP_COUNTDOWN_TIME}`;
                }
                
                // change the flipping timer
                else if (typeof(gameObj.timer) == "string"){
                    
                    if(parseInt(gameObj.timer.split("Flipping in... ")[1]) >= 1) {

                        let currentFlipTimer = "Flipping in... " + (parseInt(gameObj.timer.split("Flipping in... ")[1]) - 1)
    
                        gameObj.timer = currentFlipTimer;
                        
                    }
    
                    // this should send a request to the server and website that it's time ot flip
                    // this decides the winner
                    else if(parseInt(gameObj.timer.split("Flipping in... ")[1]) == 0) {
    
                        console.log("Flipping!!!" + gameObj.gameID)
    
                        // call a function that decides a winner
                        let cfWinner = decideCoinFlipWinner(gameObj.gameID)

                        CoinFlipGame.findOneAndUpdate({"GameID": gameObj.gameID}, {
                            Winner: cfWinner,
                            Status: false
                        }, {upsert: true}, (err, cf) => {
                            if (err) {
                                console.error(err);
                            }

                            else {
                                // send trade offer and send trade link to winner
                            }

                        })
    
                        gameObj.winner = cfWinner;
    
                        gameObj.gameState = false;
    
                    }
                }


                else if (gameObj.winner != "none" && gameObj.wait <= process.env.COIN_FLIP_ENDING_WAIT_TIME && gameObj.wait != 0) {
                    gameObj.wait -= 1;
                }

                else if (gameObj.wait == 0) {

                    gameObj.gameState = false;

                }

                // need to check this out for canceling trades
                else if (gameObj.playerTwoState == "cancel") {

                    gameObj.playerTwoUser = "none";
                    gameObj.playerTwoPicture = "none";
                    gameObj.playerTwoSkins = "none";
                    gameObj.playerTwoSkinValues = "none";
                    gameObj.playerTwoSkinPictures = "none";
                    gameObj.playerTwoState = "none";

                }
                
            }

            else {

                if (gameObj.slicerDelay > 0) {
                    gameObj.slicerDelay -= 1;
                }

                else {

                    let gameIndex = modify.findIndex(slicer => {
                        if (slicer.gameID == gameObj.gameID) {
                            return slicer
                        }
                    })

                    modify.splice(gameIndex, 1);
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

module.exports = {
	decideCoinFlipWinner,
	addNewActiveGame,
	coinFlipUpdates,
	opponentAcceptedTrade,
	opponentDeclinedTrade,
	opponentJoiningGame,
};
