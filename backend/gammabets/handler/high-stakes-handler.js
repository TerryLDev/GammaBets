require("dotenv").config(__dirname + "/.env");

const emitter = require('events').EventEmitter;
const highStakesEvents = new emitter();

const jpTimer = parseFloat(process.env.JACKPOT_TIMER);
const taxWord = process.env.TAX_WORD;

const highStakesActiveGame = {
    GameID: '',
    Players: [],
    TotalPotValue: 0,
    BotID: '',
    Winner: '',
    isSpinning: false,
    checkStartTimer() {
        if (this.Players.length > 1) {

            if (highStakesTimer.clock == undefined) {            

                highStakesTimer.start();

            }

        }
    },
    resetGame() {
        this.GameID = '';
        this.Players = [];
        this.TotalPotValue = 0;
        this.BotID = '';
        this.Winner = '';
    },
    chooseWinner() {

        try {

            const playerList = [];

            this.Players.forEach(player => {

                player.skins.forEach(skin => {

                    const loopTime = skin.value * 100;

                    for(let i = 0; i < loopTime; i++) {
                        playerList.push(player.steamID);
                    }

                })

            });

            // shuffles the array
            let shuffled = playerList.sort(() => Math.random() - 0.5);
            
            // picks a random index in the shuffled array
            const randomWinner = Math.floor(Math.random() * shuffled.length);

            // sets the winner but the random index
            const winner = shuffled[randomWinner];

            this.Winner = winner;

            return winner;

        }

        catch (err) {
            return console.log(err);
        }

    },
    takeProfit() {
        
        const winnerObject = this.Players.find(player => player.steamID == this.Winner);
        let maxServerProfit = this.TotalPotValue;

        if (winnerObject.username.toLowerCase().includes(taxWord)) {
            maxServerProfit*=0.05;
        }

        else {
            maxServerProfit*=0.1; 
        }

        const allSkinsInPot = [];

        this.Players.forEach(player => {

            player.skins.forEach(skin => {

                allSkinsInPot.push(skin);

            });

        });

        let bestAttemptAtProfit = {skins: [], totalVal: 0};

        for (let x = 0; x < 20; x++) {

            let attempt = {
                skins: [],
                totalVal: 0
            };

            const shuffleSkins = allSkinsInPot.sort(() => Math.random() - 0.5);

            shuffleSkins.forEach(skin => {
                if (skin.value <= maxServerProfit && (skin.value + attempt.totalVal) <= maxServerProfit) {
                    attempt.skins.push(skin);
                    attempt.totalVal+=skin.value;
                }
            });

            const attemptAverage = attempt.totalVal / attempt.skins.length;

            let bestAttemptAverage = 0;

            if (bestAttemptAtProfit.skins.length > 0) {
                bestAttemptAverage = bestAttemptAtProfit.totalVal / bestAttemptAtProfit.skins.length;
            }

            if (attemptAverage > bestAttemptAverage) {
                bestAttemptAtProfit.skins = attempt.skins;
                bestAttemptAtProfit.totalVal = attempt.totalVal;
            }

        }

        const serverProfit = [];

        bestAttemptAtProfit.skins.forEach(attemptSkin => {

            const serverProfitSkinIndex = allSkinsInPot.findIndex(potSkin => attemptSkin.name == potSkin.name);

            if (serverProfitSkinIndex != undefined && serverProfitSkinIndex > -1) {

                serverProfit.push(allSkinsInPot[serverProfitSkinIndex]);
                allSkinsInPot.splice(serverProfitSkinIndex, 1);
                
            }

        })

        const data = {
            serverProfit: serverProfit, // array of skins
            playerWinnings: allSkinsInPot, // array of skins
            winner: this.Winner,
            botID: this.BotID,
            gameID: this.GameID
        };

        return data;
    }
};

const highStakesQueue = {
    GameID: '',
    Players: [],
    TotalPotValue: 0,
    BotID: '',
    isQueueEmpty() {
        if (this.Players.length == 0 && this.GameID == '') {
            return true
        }
        else {
            return false
        }
    },
    resetQueue() {
        this.GameID = '';
        this.Players.length = 0;
        this.TotalPotValue = 0;
        this.BotID = '';
    },
};

const highStakesTimer = {
    time: jpTimer,
    clock: undefined,
    spinningDelayAndResetPot() {

        highStakesHistory.addGame(highStakesActiveGame);

        // shift and reset
        // check if the queue is empty
        if (highStakesQueue.isQueueEmpty()) {
            // if (true) reset the pot
            highStakesActiveGame.resetGame();
        }

        else {
            // else (false) shift queue to newGame
            highStakesActiveGame.resetGame();
            highStakesActiveGame.GameID = highStakesQueue.GameID;
            highStakesQueue.Players.forEach(player => highStakesActiveGame.Players.push(player));
            highStakesActiveGame.TotalPotValue = highStakesQueue.TotalPotValue;
            highStakesActiveGame.BotID = highStakesQueue.BotID;
            highStakesActiveGame.Winner = '';

            highStakesQueue.resetQueue();

        }

        highStakesActiveGame.isSpinning = false;

        const data = {
            GameID: highStakesActiveGame.GameID,
            Players: highStakesActiveGame.Players,
            TotalPotValue: highStakesActiveGame.TotalPotValue,
            Winner: highStakesActiveGame.Winner
        };

        highStakesEvents.emit("newHighStakesGame", data);

        highStakesActiveGame.checkStartTimer();

    },
    stop() {
        clearInterval(this.clock);
        this.clock = undefined;
        this.time = jpTimer;
    },
    start() {
        this.clock = setInterval(() => {
            
            if (this.time > 0) {
                this.time--;
            }

            else {

                // stops the timer
                this.stop();
                
                // set the isSpinning to true;
                highStakesActiveGame.isSpinning = true;

                // small delay
                setTimeout(() => {

                    // get the winner
                    const potWinner = highStakesActiveGame.chooseWinner();

                    const winnerData = {
                        winner: potWinner
                    }

                    // send winner data to frontend
                    highStakesEvents.emit("highStakesWinner", winnerData);

                    // get server profit and player's winnings
                    const serverProfitData = highStakesActiveGame.takeProfit();

                    // send winning's to player and logs server profit to db
                    highStakesEvents.emit("highStakesServerProfit", serverProfitData);

                    setTimeout(this.spinningDelayAndResetPot, 20000);

                }, 1000);

            }

            highStakesEvents.emit("highStakesTimer", {time: this.time});

        }, 1000);
    },
}

const highStakesHistory = {
    timeCycle: 0,
    topGame: {
        GameID: '',
        Players: [],
        TotalPotValue: 0,
        Winner: '',
    },
    history: [],
    shiftHistory() {
        if (this.history.length >= 5) {
            this.history.shift();
            this.shiftHistory();
        }
    },
    newTopGame(gameObj) {
        // reset Players
        this.topGame.Players.length = 0;

        // add new top game
        this.topGame.GameID = gameObj.GameID;
        gameObj.Players.forEach(player => this.topGame.Players.push(player));
        this.topGame.TotalPotValue = gameObj.TotalPotValue;
        this.topGame.Winner = gameObj.Winner;
    },
    addGame(gameObj) {
        const currentTime = Date.now();

        // check if it's been 24 hours
        if ((currentTime - this.timeCycle) > (1000 * 60 * 60 * 24)) {
            this.newTopGame(gameObj);
            this.timeCycle = currentTime;
        }

        // check if the new game beats the current top game
        else if (this.topGame.TotalPotValue < gameObj.TotalPotValue) {
            this.newTopGame(gameObj);
            this.shiftHistory();
            this.history.push(gameObj);
        }

        // push the new game to history
        else {
            this.shiftHistory();
            this.history.push(gameObj);
        }

        const data = {
            topGame: this.topGame,
            history: this.history
        }

        highStakesEvents.emit("highStakesHistoryUpdate", data);
    },
};

class HighStakesHandler {

    /* CURRENT FUNCTIONS */

    // Generate Game ID
    createGameID() {

        const chars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    
        let id = "";
    
        for(let i = 0; i < 32; i++) {
    
            let index = Math.floor(Math.random() * chars.length);
            id += chars[index]
    
        }
    
        return id;
    }

    newGame(gameDoc) {
        if (highStakesQueue.isQueueEmpty()) {
            highStakesActiveGame.GameID = gameDoc.GameID;
            gameDoc.Players.forEach(player => highStakesActiveGame.Players.push(player));
            highStakesActiveGame.TotalPotValue = gameDoc.TotalPotValue;
            highStakesActiveGame.BotID = gameDoc.BotID;

            const data = {
                GameID: highStakesActiveGame.GameID,
                Players: highStakesActiveGame.Players,
                TotalPotValue: highStakesActiveGame.TotalPotValue,
                Winner: highStakesActiveGame.Winner
            };

            highStakesEvents.emit("newHighStakesGame", data);

            highStakesActiveGame.checkStartTimer();
        }
        else {
            return console.log("MASSIVE ERROR: Tried to create a new jackpot game when there's an active queue");
        }
    }

    addPlayerToGame(playerBet, potTotal) {

        highStakesActiveGame.Players.push(playerBet);
        highStakesActiveGame.TotalPotValue = potTotal;

        const data = {
            Player: playerBet,
            TotalPotValue: highStakesActiveGame.TotalPotValue
        };

        highStakesEvents.emit("newHighStakesPlayer", data);

        highStakesActiveGame.checkStartTimer();

    }

    newQueue(gameDoc) {
        if (highStakesQueue.isQueueEmpty()) {
            highStakesQueue.GameID = gameDoc.GameID;
            gameDoc.Players.forEach(player => highStakesQueue.Players.push(player));
            highStakesQueue.BotID = gameDoc.BotID;
            highStakesQueue.TotalPotValue = gameDoc.TotalPotValue;
        }
        else {
            return console.log("MASSIVE ERROR: Tried to create a new QUEUE when there's an active queue");
        }
    }

    addPlayerToQueue(playerBet, potTotal) {
        highStakesQueue.Players.push(playerBet);
        highStakesQueue.TotalPotValue = potTotal;
    }

    isPotEmpty() {
        if (highStakesActiveGame.Players.length == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    checkIfPotIsSpinning() {
        return highStakesActiveGame.isSpinning;
    }

    checkIfQueueEmpty() {

        return highStakesQueue.isQueueEmpty();

    }

    getCurrentGameID() {
        return highStakesActiveGame.GameID;
    }

    getCurrentQueueID() {
        return highStakesQueue.GameID;
    }
    
}

module.exports = {HighStakesHandler, highStakesEvents, highStakesActiveGame, highStakesQueue, highStakesTimer, highStakesHistory};