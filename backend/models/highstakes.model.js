const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const highStakesGameSchema = Schema({
    GameID: {
        type: String,
        required: true,
        unique: true
    },
    TotalPotValue: Number,
    Players: Array,
    BotID: String,
    Status: Boolean,
    Winner: String,
    WinningsSent: String,
    WinningsTradeID: String,
    }, {timestamps: true});

const HighStakesJackpot = mongoose.model("HighStakesJackpot", highStakesGameSchema)

module.exports = HighStakesJackpot;