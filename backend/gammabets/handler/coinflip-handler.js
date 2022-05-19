require("dotenv").config(__dirname + "/.env");

const emitter = require('events').EventEmitter;
const cfEvents = new emitter();

let allCFGames = [];

let cfHistory = {
    topCycle: 0,
    topGame: {
        gameID: "b4tmltzrn44j2rjmhrjyzcd0roaynf8s",
        steamID: "76561198157301980",
        username: "Brollow",
        userPic: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/94/94aa675a40e4019fc6b6360163563ce4ea1177ee_full.jpg",
        totalValue: 4.13,
        totalAmount: 2,
    },
    history: [
        {
            gameID: "b4tmltzrn44j2rjmhrjyzcd0roaynf8s",
            steamID: "76561198157301980",
            username: "Brollow",
            userPic: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/94/94aa675a40e4019fc6b6360163563ce4ea1177ee_full.jpg",
            totalValue: 4.13,
            totalAmount: 2,
        },
        {
            gameID: "b4tmltzrn44j2rjmhrjyzcd0roaynf8s",
            steamID: "76561198157301980",
            username: "Brollow1",
            userPic: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/94/94aa675a40e4019fc6b6360163563ce4ea1177ee_full.jpg",
            totalValue: 8.53,
            totalAmount: 7,
        },
        {
            gameID: "b4tmltzrn44j2rjmhrjyzcd0roaynf8s",
            steamID: "76561198157301980",
            username: "Brollow2",
            userPic: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/94/94aa675a40e4019fc6b6360163563ce4ea1177ee_full.jpg",
            totalValue: 4.17,
            totalAmount: 16,
        },
    ],
};

let creatingQueue = {
    queue: [],
    addToQueue(gameID, steamID, side) {
        const entry = {
            GameID: gameID,
            SteamID: steamID,
            Side: side
        }

        this.queue.push(entry);
    },
    getQueue(gameID, steamID) {

        let grabSide = this.queue.find(wSide => wSide.GameID == gameID && wSide.SteamID == steamID);

        return grabSide;

    },
    removeQueue(gameID, steamID) {

        let index = this.queue.findIndex(wSide => wSide.GameID == gameID && wSide.SteamID == steamID);
        
        this.queue.splice(index, 1);

    },
    
};

let joiningQueue = {
    queue: [],
    // adds player to the joining queue for a coin flip
    addToQueue(gameID, steamID, username = "No Name Found", userPicURL) {
        const entry = {
            GameID: gameID,
            SteamID: steamID,
            Username: username,
            UserPic: userPicURL
        }
        this.queue.push(entry);

        cfEvents.emit("updateJoiningQueue", this.queue);
    },
    // checks to see if a player has already joined the queue for a game
    checkSelectedQueue(gameID) {

        const findQueue = this.queue.find(queue => gameID == queue.GameID);

        if (findQueue) {
            return false;
        }

        else {
            return true;
        }
    },
    // returns if it can find a queue
    getSelectedQueue(gameID) {

        const findQueue = this.queue.find(queue => gameID == queue.GameID);

        if (findQueue) {
            return findQueue;
        }

        else {
            return false;
        }

    },
    removeSelectedQueue(gameID) {

        const index = this.queue.findIndex(queue => gameID == queue.GameID);
        this.queue.splice(index, 1);

        cfEvents.emit("updateJoiningQueue", this.queue);
    },
    updateTradeID(tradeID, gameID) {
        const gameIndex = this.queue.findIndex(q => q.GameID == gameID);

        this.queue[gameIndex].TradeID = tradeID;
    },
    findTradeID(gameID) {
        const gameIndex = this.queue.findIndex(q => q.GameID == gameID);

        if (gameIndex != undefined) {
            return this.queue[gameIndex].TradeID;
        }

        else {
            return false;
        }
    }
};

class CoinFlipHandler {

    mainTimer = parseFloat(process.env.COIN_FLIP_OPPONENT_JOINING_TIME);
    countDown = parseFloat(process.env.COIN_FLIP_COUNTDOWN_TIME);

    createGameID() {

        const chars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    
        let id = "";
    
        for(let i = 0; i < 32; i++) {
    
            let index = Math.floor(Math.random() * chars.length);
            id += chars[index]
    
        }
    
        return id;
    }

    findCFBot(gameID) {

        let bot = "none";

        allCFGames.forEach(obj => {

            if (obj.game.gameID == gameID) {

                bot = obj.game.bot;

            }

        });

        return bot;

    }

    ////////////////

    // Winner methods

    // needs work - A lot of work
    #decideWinner(cfInnerGameObject) {

        joiningQueue.removeSelectedQueue(cfInnerGameObject.gameID)

        const gameID = cfInnerGameObject.gameID;

        if (cfInnerGameObject.playerTwo.skins.length > 0 && cfInnerGameObject.playerOne.skins.length > 0) {
            
            let listOfPlayers = [];

            let playerOneTotal = 0;
            let playerTwoTotal = 0;

            cfInnerGameObject.playerOne.skinValues.forEach(val => playerOneTotal+= val);

            cfInnerGameObject.playerTwo.skinValues.forEach(val => playerTwoTotal+= val);

            const playerOneEntries = playerTwoTotal * 100;
            const playerTwoEntries = playerOneTotal * 100;

            for (let i = 0; i < playerOneEntries; i++) {
                listOfPlayers.push(cfInnerGameObject.playerOne.userSteamId);
            }

            for (let i = 0; i < playerTwoEntries; i++) {
                listOfPlayers.push(cfInnerGameObject.playerTwo.userSteamId);
            }

            let shuffled = listOfPlayers.sort(() => Math.random() - 0.5);

            let randomWinner = Math.floor(Math.random() * shuffled.length);

            let winner = shuffled[randomWinner];

            const gameIndex = allCFGames.findIndex(game => game.game.gameID == gameID);

            allCFGames[gameIndex].game.phase = 3;
            allCFGames[gameIndex].game.winner = winner;

            const data = {
                game: allCFGames[gameIndex].game,
                timer: allCFGames[gameIndex].timer
            }

            this.sendWinnings(allCFGames[gameIndex].game.gameID);

            return data;
        }

        else {
            return false;
        }
    
    }

    // needs work i think
    #takeProfitAndWithdrawal(gameID) {

        const index = allCFGames.findIndex(game => game.game.gameID == gameID);

        if (index == undefined  || index < 0) {
            throw "Could not find cf game object with given gameID. Cannot send winnings to player";
        }

        const chosenGame = allCFGames[index];

        let allSkins = []

        for(let i = 0; i < chosenGame.game.playerOne.skins.length; i++) {
            let entry = {
                id: chosenGame.game.playerOne.skinIDs[i],
                value: chosenGame.game.playerOne.skinsValues[i]
            };

            allSkins.push(entry);
        }

        for(let i = 0; i < chosenGame.game.playerTwo.skins.length; i++) {
            let entry = {
                id: chosenGame.game.playerTwo.skinIDs[i],
                value: chosenGame.game.playerTwo.skinsValues[i]
            };

            allSkins.push(entry);
        }

        let maxValue = 0;
            
        allSkins.forEach(skin => {
            maxValue += skin.value;
        });

        const winnerName = chosenGame.game.playerOne.username == chosenGame.game.winner ? chosenGame.game.playerOne.username : chosenGame.game.playerTwo.username

        if (winnerName.toLowerCase().includes("gammabets")) {
            maxValue *= .05
        }

        else {
            maxValue *= .10
        }

        let highestAttempt = {skins: [], totalVal: 0};

        for(let x = 0; x < 10; x++) {

            let attempt = {
                skins: [],
                totalVal: 0
            };

            let shuffleSkins = allSkins.sort(() => Math.random() - 0.5);

            for (let s = 0; s < shuffleSkins.length; s++) {

                const choice = shuffleSkins[Math.floor(Math.random() * shuffled.length)];

                if (choice.value <= maxValue && (choice.value + attempt.totalVal) <= maxValue) {
                    attempt.skins.push(choice.id);
                    attempt.totalVal += choice.value;
                }

            }

            if (highestAttempt.totalVal < attempt.totalVal) {
                highestAttempt = attempt;
            }

        }

        let pWinnings = [];

        allSkins.forEach(skin => {
            if (highestAttempt.skins.includes(skin.id) == false) {
                pWinnings.push(skin.id);
            }
        })

        // return server profit and player winnings
        const data = {
            botID: chosenGame.game.bot,
            gameID: gameID,
            serverProfit: highestAttempt.skins,
            playerWinnings: pWinnings,
            winnerSteamID: chosenGame.game.winner,
        };

        return data;

    }

    ////////////////

    // Call Methods (runnning functions that handle big task for async functions)

    // ADD THIS LATER IN DEVELOPMENT
    #checkGameStatus(gameDBObject) {

        /*
        Status:
        0 = fresh new game;
        1 = Already a player 2, no winner
        2 = Winner chosen, but still active (so switch to history)
        */
        
        if (gameDBObject.Status && gameDBObject.Winner != undefined && gameDBObject.Winner != null) {
            // status 2
            return 2;
        }

        else if (gameDBObject.Players.length > 1 && (gameDBObject.Winner == undefined || gameDBObject.Winner == null)) {
            // status 1
            return 1;
        }

        else {

            return 0;

        }

    }

    // this checks if it is time to switch to a new 24 hours cycle
    #checkHistoryCycle(historyObject) {

        const currentTime = Date.now();
        const timeSinceCycle = currentTime - cfHistory.topCycle;

        if(timeSinceCycle >= (1000 * 60 * 60 * 24)) {
            cfHistory.topCycle = currentTime;
            cfHistory.topGame = historyObject;
        }

        else if (historyObject.totalValue > cfHistory.topGame.totalValue) {
            cfHistory.topGame = historyObject;
        }

    }
    
    // done
    #callNewGame(gameObject) {

        let newEntry = {};

        newEntry.game = {
            gameID: gameObject.GameID,
            bot: gameObject.BotID,
            gameState: true,
            playerOne: gameObject.Players[0],
            playerTwo: {},
            playerTwoJoining: false,
            playerTwoJoined: false,
            waitingToFlip: false,
            winner: "none",
            phase: 0,
        }

        newEntry.cancelPlayerTwoTrade = false;

        if (gameObject.Red == gameObject.Players[0].userSteamId) {
            newEntry.game.playerOneSide = "red";
            newEntry.game.playerTwoSide = "black";
        }
        
        else {
            newEntry.game.playerOneSide = "black";
            newEntry.game.playerTwoSide = "red";
        }

        newEntry.timer = {defaultTimer: this.mainTimer, flippingTimer: this.countDown};

        newEntry.clock = null;

        newEntry.startClock = function() {

            this.clock = setInterval(() => {

                if (this.game.waitingToFlip && this.game.playerTwoJoined) {

                    if (this.timer.flippingTimer > 0) {

                        this.timer.flippingTimer -= 1;

                    }

                    else {
                        
                        this.stopClock();

                        console.log("choose winner:", this.game.gameID);
                        // emit a winner
                        const data = this.game;
                        cfEvents.emit("chooseCFWinner", data);
                    }
                }

                else if(this.game.playerTwoJoining) {

                    // continue it
                    if (this.timer.defaultTimer > 0) {

                        this.timer.defaultTimer -= 1;

                    }

                    // cancel trade if it hits 0
                    else {
                        
                        // Stops the clock and resets the values
                        this.stopClock();

                        // Sets cancelPlayerTwoTrade to true
                        this.cancelPlayerTwoTrade = true;

                        // Set playerTwoJoining to false;
                        this.game.playerTwoJoining = false;
                        
                        // Set the game's phase to 0
                        this.game.phase = 0;

                        cfEvents.emit("secondPlayerTradeCanceled", {GameID: this.game.gameID});

                        // Looks for the playerTwo's tradeID
                        const tradeID = joiningQueue.findTradeID(this.game.gameID);

                        if(tradeID != false) {

                            const data = {GameID: this.game.gameID, TradeID: tradeID}

                            cfEvents.emit("callCancelCFTrade", data);
                        
                            console.log("Player Two did not accept trade in time, cancel trade for:" + this.game.gameID);
                            
                        }

                        else {
                            console.log("Player Two did not accept trade in time, AND COULD NOT CANCEL TRADE:" + this.game.gameID);
                        }

                        this.cancelPlayerTwoTrade = false;

                    }

                }

                const data = {
                    timer: this.timer,
                    GameID: this.game.gameID,
                };

                cfEvents.emit("cfTimer", data)
            }, 1000)
        }

        // basically resets the clock
        newEntry.stopClock = function() {
            clearInterval(this.clock);
            this.timer.defaultTimer = this.mainTimer;
            this.timer.flippingTimer = this.countDown;
        };

        allCFGames.push(newEntry);

        return newEntry;

    }

    // done
    #callOpponentJoiningGame(gameID, steamID, username, userPicURL) {

        const gameObjIndex = allCFGames.findIndex(obj => {

            if(obj.game.gameID == gameID) {
                return obj;
            }

        });

        if (gameObjIndex != undefined) {

            allCFGames[gameObjIndex].game.playerTwoJoining = true;
            allCFGames[gameObjIndex].game.phase = 1;

            allCFGames[gameObjIndex].startClock();

            joiningQueue.addToQueue(gameID, steamID, username, userPicURL);

            return allCFGames[gameObjIndex];

        }

        else  {
            return console.error("Could not find game in CF Game Handler");
        }
    }

    // done
    #callOpponentAcceptedTrade(gameObject) {

        // if this fails, you might need to change this to findIndex

        const gameIndex = allCFGames.findIndex(obj => obj.game.gameID == gameObject.GameID);

        allCFGames[gameIndex].game.playerTwo = gameObject.Players[1];
        allCFGames[gameIndex].game.playerTwoJoined = true;
        allCFGames[gameIndex].game.waitingToFlip = true;
        allCFGames[gameIndex].game.phase = 2;

        return allCFGames[gameIndex];

    }

    #callMoveGameToHistory(innerGameObject) {

        // format history object
        const winnerUsername = innerGameObject.winner == innerGameObject.playerOne.userSteamId ? innerGameObject.playerOne.username : innerGameObject.playerTwo.username;
        const winnerUserPic = innerGameObject.winner == innerGameObject.playerOne.userSteamId ? innerGameObject.playerOne.userPicture : innerGameObject.playerTwo.userPicture;

        let historyObject = {
            gameID: innerGameObject.gameID,
            steamID: innerGameObject.winner,
            username: winnerUsername,
            userPic: winnerUserPic,
            totalValue: 0,
            totalAmount: innerGameObject.playerOne.skins.length + innerGameObject.playerTwo.skins.length,
        };

        innerGameObject.playerOne.skinValues.forEach(val => historyObject.totalValue += val);
        innerGameObject.playerTwo.skinValues.forEach(val => historyObject.totalValue += val);

        // push history object
        function popHistory() {

            console.log("CF History Shift");

            cfHistory.history.pop();

            if (cfHistory.history.length > 5) {

                popHistory();
            }

        }

        cfHistory.history.unshift(historyObject);

        if (cfHistory.history.length > 5) {

            popHistory();

        }

        // check the history 24 hours cycle
        this.#checkHistoryCycle(historyObject);

        cfEvents.emit("cfHistory", cfHistory);

    }

    #removeCFGame(gameID) {

        const index = allCFGames.findIndex(obj => obj.game.gameID == gameID);

        if(index < 0 || index == undefined || index == null) {
            return console.log("Failed to find game in 'allCFGames' array");
        }

        else {
            allCFGames.splice(index, 1);
        }

    }

    ////////////////

    // Main Methods

    // needs work - maybe
    async createNewGame(gameObject) {

        try {

            let data = await this.#callNewGame(gameObject);

            cfEvents.emit("newCFGame", await data);

        }

        catch (err) {
            console.log("An error occurred when adding a new game to array");
            console.log(err);
        }

    }

    // needs work - maybe
    async opponentJoiningGame(gameID, steamID, username, userPicURL) {

        try {

            let data = await this.#callOpponentJoiningGame(gameID, steamID, username, userPicURL);

            cfEvents.emit("secondPlayerJoiningGame", await data);

        }

        catch(err) {

            console.error(err);
            console.log("An Error Occrred when emitting data to server");

        }

    }

    // needs work - maybe
    opponentAcceptedTrade(gameObject) {

        let data = this.#callOpponentAcceptedTrade(gameObject);

        cfEvents.emit("secondPlayerAccepctedTrade", data);

    }

    async chooseWinner(innerGameObject) {

        try {

            const winnerData = await this.#decideWinner(innerGameObject);

            if (await winnerData) {

                cfEvents.emit("cfWinner", await winnerData);

                this.#callMoveGameToHistory(winnerData.game);

                setTimeout(() => {

                    this.#removeCFGame(winnerData.game.gameID)

                }, 10000);

            }

        }

        catch(err) {

        }
    }

    async sendWinnings(gameID) {

        try {

            const winningsInfo = await this.#takeProfitAndWithdrawal(gameID);

            cfEvents.emit("withdrawWinnings", await winningsInfo);

        }

        catch(err) {
            console.error(err);
        }

    }
}

module.exports = {CoinFlipHandler, cfEvents, allCFGames, cfHistory, creatingQueue, joiningQueue};