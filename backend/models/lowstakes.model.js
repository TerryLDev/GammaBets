const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lowStakesGameSchema = new Schema({
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

const LowStakesJackpot = mongoose.model("LowStakesJackpot", lowStakesGameSchema)

module.exports = LowStakesJackpot;