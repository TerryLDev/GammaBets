require("dotenv").config(__dirname + "/.env");

const HighStakesJackpot = require('../../models/highstakes.model');
const User = require("../../models/user.model");
const emitter = require('events').EventEmitter;
const highStakesEvents = new emitter();

const jpTimer = parseFloat(process.env.JACKPOT_TIMER);

let highStakesActiveGame = {
    GameID: "",
    Players: [],
    TotalPotValue: 0,
    isSpinning: false,
};

let highStakesQueue = {
    GameID: "",
    Players: [],
    TotalPotValue: 0,
    isSpinning: false,
};

const highStakesTimer = {
    time: jpTimer,
    clock: undefined,
    start() {
        this.clock = setInterval(() => {
            if (this.time > 0) {
                time--;
            }
            else {
                this.stop();
            }
        }, 1000);
    },
    stop() {
        clearInterval()
        this.clock = null;
        this.time = jpTimer;
    },
}

let highStakesHistory = [];

class HighStakesHandler {

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

    // Calls
	#callCreateNewGame(hsGame) {

        // if theres a queue, add them to the game first
        if (this.checkQueue()) {

            mainApp.isThereAnActiveHighStakesGame = true;

            mainApp.highStakesActiveGame = highStakesQueue;
            mainApp.highStakesActiveGame.Time = jpTimer;

            hsGame.Players.forEach(player => {

                mainApp.highStakesActiveGame.Players.push(player);

            });

            if (mainApp.highStakesActiveGame.Players.length > 1) {

                this.#startTimer();
    
            }
    
            return mainApp.highStakesActiveGame;

        }

        else {

            mainApp.isThereAnActiveHighStakesGame = true;

            mainApp.highStakesActiveGame.GameID = hsGame.GameID;

            hsGame.Players.forEach(player => {

                mainApp.highStakesActiveGame.Players.push(player);

            })

            mainApp.highStakesActiveGame.TotalPotValue = hsGame.TotalPotValue;
            mainApp.highStakesActiveGame.Time = jpTimer;

            if (mainApp.highStakesActiveGame.Players.length >= 2) {

                this.#startTimer();

            }

            return mainApp.highStakesActiveGame;

        }

	}

    #callCreateNewQueue() {

    }

    #callAddPlayerToPot(totalPot, playerBet) {

        mainApp.highStakesActiveGame.Players.push(playerBet);
        mainApp.highStakesActiveGame.TotalPotValue = totalPot;

        const data = {
            Player: playerBet,
            TotalPotValue: mainApp.highStakesActiveGame.TotalPotValue
        }

        if (mainApp.highStakesActiveGame.Players.length == 2) {

            this.#startTimer();

        }

        return data;

    }

    #callAddToHistory() {

    }

    #callCreateQueue(hsGame) {

    }

	#callAddPlayerToQueue() {

	}

    #startTimer() {

        highStakesEvents.emit("startHighStakesTimer", {Time: `${mainApp.highStakesActiveGame.Time}`});

        const hsTimer = setInterval(() => {


            if (mainApp.highStakesActiveGame.Time > 0) {

                mainApp.highStakesActiveGame.Time--;

            }

            else {

                clearInterval(hsTimer);

                // call to choose a winner

            }

        }, 1000)

    }

    timer() {

        mainApp.highStakesActiveGame.Time = jpTimer

        highStakesEvents.emit("startHighStakesTimer", {Time: mainApp.highStakesActiveGame.Time});

        const hsTimer = setInterval(() => {


            if (mainApp.highStakesActiveGame.Time > 0) {

                mainApp.highStakesActiveGame.Time--;

            }

            else {

                clearInterval(hsTimer);

                // call to choose a winner

            }

        }, 1000)

    }

    // Async Methods
    async addPlayerToPot(totalPot, playerBet) {

        try {

            const data = await this.#callAddPlayerToPot(totalPot, playerBet);

            highStakesEvents.emit("newHighStakesPlayer", await data);

        }

        catch(err) {

            console.log("An Error Occurred while creating a new High Stakes Jackpot locally")
            return console.log(err);

        }

    }

    async addPlayerToQueue(totalPot, playerBet) {

    }

    async createNewGame(hsGame) {

        try {

            const data = await this.#callCreateNewGame(hsGame);

            highStakesEvents.emit("newHighStakesPot", await data);

        }

        catch(err) {

            return console.log(err);

        }

	}

    async createNewQueue(hsGame) {

    }

    checkQueue() {

        if (highStakesQueue.Players == 0) {

            return false;

        }

        else {
            return true;
        }
    }

    async addToHistory() {
        
    }

    async startHighStakesTimer() {

    }
    
}

module.exports = {HighStakesHandler, highStakesEvents};