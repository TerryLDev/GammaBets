const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const coinFlipGameSchema = Schema({
    GameID: {
        type: String,
        required: true,
        unique: true
    },
    TotalValue: Number,
    Players: Array,
    Winner: String,
    DateCreated: Date
}, {
    timestamps: true
});

const CoinFlipGame = mongoose.model("CoinFlipGame", coinFlipGameSchema)

module.exports = CoinFlipGame;