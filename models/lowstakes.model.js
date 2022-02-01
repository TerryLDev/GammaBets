const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jackpotGameSchema = Schema({
    GameID: {
        type: String,
        required: true,
        unique: true
    },
    TotalPotValue: Number,
    Players: Array,
    Status: Boolean,
    Winner: String,
    }, {timestamps: true});

const LowStakesJackpot = mongoose.model("LowStakesJackpot", jackpotGameSchema)

module.exports = LowStakesJackpot;