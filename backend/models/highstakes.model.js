const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const highStakesGameSchema = new Schema({
    GameID: {
        type: String,
        required: true,
        unique: true
    },
    TotalPotValue: {
        type: Number,
        default: 0,
    },
    Players: {
        type: Array,
        default: [],
    },
    BotID: {
        type: String,
        required: true,
    },
    Status: Boolean,
    Winner: String,
    WinningsSent: String,
    WinningsTradeID: String,
    }, {timestamps: true});

const HighStakesJackpot = mongoose.model("HighStakesJackpot", highStakesGameSchema)

module.exports = HighStakesJackpot;