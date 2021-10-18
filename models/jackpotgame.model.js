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
    DateCreated: Date
}, {
    timestamps: true
});

const JackpotGame = mongoose.model("JackpotGame", jackpotGameSchema)

module.exports = JackpotGame;