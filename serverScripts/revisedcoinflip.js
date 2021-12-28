require("dotenv").config(__dirname + "/.env");
const fs = require("fs");

const CoinFlipGame = require("../models/coinflipgame.model");
const User = require("../models/user.model");

var emitter = require('events').EventEmitter;
const cfEvents = new emitter

class ActiveCoinFlipGame {

    constructor(GameID) {
        this.GameID = GameID;
    }

    async decideWinner() {

        try {

            CoinFlipGame.findOne({GameID: gameID}, (err, cf) => {
    
                if (err) return err;
    
                else {
    
                    let listOfPlayers = [];
    
                    cf.Players.forEach((player) => {
    
                        let playerTotalVal = 0;
    
                        player["skinValues"].forEach((val) => {
    
                            playerTotalVal += val;
                        });
    
                        for (let i = 0; i < playerTotalVal; i++) {
    
                            listOfPlayers.push(player.userSteamId);
                        }
    
                    });
    
                    let shuffled = listOfPlayers.sort(() => Math.random() - 0.5);
    
                    let randomWinner = Math.floor(Math.random() * shuffled.length);
    
                    let winner = shuffled[randomWinner]
    
                    return winner;
                }
    
            });
    
        }
        
        catch (e) {
            return e;
        }
    }

    startTimer() {
        setInterval(function() {
            const data = {time: 100}
            cfEvents.emit("timer", data);
        }, 1000);
    }
}

module.exports = {ActiveCoinFlipGame, cfEvents};