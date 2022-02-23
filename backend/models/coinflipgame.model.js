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
    Red: String,
    Black: String,
    Winner: String,
    BotID: {
        type: String,
        required: true
    },
    Status: Boolean,
}, {
    timestamps: true
});

const CoinFlipGame = mongoose.model("CoinFlipGame", coinFlipGameSchema)

module.exports = CoinFlipGame;