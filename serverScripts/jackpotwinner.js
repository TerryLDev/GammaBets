// SteamBot
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const community = new SteamCommunity;
const manager = new TradeOfferManager;
const client = new SteamUser;

const SteamBot = require("../steam/bot");

// Comeback to this later when you're back home

function jackpotWinner(game, callback) {
    
    try {
        let listOfPlayers = []
    
        game.Players.forEach(player => { 
            
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

// This is gonna handle everything
// 1. get the winner of the jackpot
// 2. decide how how many skins it should take
// 3. send trade offer to user

// should return what items to trade with item ids in an array
// return steamid of user

function takeJackpotProfit(game, winner /* Please put in winner from DB */, allSkins, callback) {

    try {

        let percent = 0;

        let username = winner.Username

        if (username.includes('doggo')) {
            percent = 0.05
        }

        else {
            percent = 0.1
        }

        listOfPlayerSkins = []

        let totalPot = 0;

        game.Players.forEach(player => {
            player.skins.forEach(skin => {
                allSkins.forEach(dbSkin => {
                    if (skin == dbSkin.SkinName) {
                        totalPot += dbSkin.Value;
                    }
                });
            });
        });

        console.log(totalPot);

        const serverProfit = totalPot * percent;

        console.log(serverProfit);

        let attemptOne = [];
        let attemptOneVal = 0;

        let attemptTwo = [];
        let attemptTwoVal = 0;

        let attemptThree = [];
        let attemptThreeVal = 0;

        let attemptFour= [];
        let attemptFourVal = 0;

        let attemptFive = [];
        let attemptFiveVal = 0;


        game.Players.forEach(player =>{
            player.skins.forEach(skin => {
                listOfPlayerSkins.push(skin)
            })
        })

        for(let i = 1; i < 6; i++) {

            const shuffledList = listOfPlayerSkins.sort(() => Math.random - 0.5)

            shuffledList.forEach(skin => {
                
                allSkins.forEach(dbSkin => {
                    
                    if (skin == dbSkin.SkinName){

                        if (dbSkin.Value < serverProfit) {

                            if (i == 1) {
                                attemptOne.push(skin)
                                attemptOneVal += dbSkin.Value

                                if (attemptOneVal > serverProfit) {
                                    attemptOneVal -= dbSkin.Value
                                    attemptOne.pop();
                                }
                            }

                            else if (i == 2) {
                                attemptTwo.push(skin)
                                attemptTwoVal += dbSkin.Value

                                if (attemptTwoVal > serverProfit) {
                                    attemptTwoVal -= dbSkin.Value
                                    attemptTwo.pop();
                                }
                            }

                            else if (i == 3) {
                                attemptThree.push(skin)
                                attemptThreeVal += dbSkin.Value

                                if (attemptThreeVal > serverProfit) {
                                    attemptThreeVal -= dbSkin.Value
                                    attemptThree.pop();
                                }
                            }

                            else if (i == 4) {
                                attemptFour.push(skin)
                                attemptFourVal += dbSkin.Value

                                if (attemptFourVal > serverProfit) {
                                    attemptFourVal -= dbSkin.Value
                                    attemptFour.pop();
                                }
                            }

                            else if (i == 5) {
                                attemptFive.push(skin)
                                attemptFiveVal += dbSkin.Value

                                if (attemptFiveVal > serverProfit) {
                                    attemptFiveVal -= dbSkin.Value
                                    attemptFive.pop();
                                }
                            }
                        }
                    }
                })
            })
        }

        let findBestProfit = [];
        findBestProfit.push(attemptOneVal);
        findBestProfit.push(attemptTwoVal);
        findBestProfit.push(attemptThreeVal);
        findBestProfit.push(attemptFourVal);
        findBestProfit.push(attemptFiveVal);

        let currentHighest = 0
        let index = 0

        for(let i = 0; i < findBestProfit.length; i++) {

            let newHighet = findBestProfit[i]

            if (newHighet > currentHighest){
                currentHighest = newHighet
                index = i;
            }
        }
        
        if (index == 0) {
            console.log('first options');
            console.log(attemptOne);
            console.log(attemptOneVal);
        }

        else if (index == 1) {
            console.log('second options');
            console.log(attemptTwo);
            console.log(attemptTwoVal);
        }

        else if (index == 2) {
            console.log('third options');
            console.log(attemptThree);
            console.log(attemptThreeVal);
        }

        else if (index == 3) {
            console.log('fourth options');
            console.log(attemptFour);
            console.log(attemptFourVal);
        }

        else if (index == 4) {

            console.log('third options');
            console.log(attemptFive);
            console.log(attemptFiveVal);
        }

        else {
            console.log('No Profit')
        }

        return callback(winner);
    }

    catch(error) {
        return callback(error)
    }

    
}

module.exports = {jackpotWinner, takeJackpotProfit}