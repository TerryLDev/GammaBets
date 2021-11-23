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
    PlayerOneTradeState: String,
    PlayerOneTradeID: String,
    PlayerTwoTradeState: String,
    PlayerTwoTradeID: String,
    Heads: String,
    Tails: String,
    Winner: String,
    Status: Boolean,
    DateCreated: Date
}, {
    timestamps: true
});

const CoinFlipGame = mongoose.model("CoinFlipGame", coinFlipGameSchema)

module.exports = CoinFlipGame;