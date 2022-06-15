const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    SteamID: {
        type: String,
        required: true,
        unique: true,
    },
    Username: {
        type: String,
        required: true
    },
    ProfilePictureURL: String,
    ProfileURL: String,
    TradeURL: String,
    Trades: {
        type: Array,
        default: []
    },
    Profit: Number,
    BetAmount: Number,
    GamesPlayed: {
        type: Array
    },
    TradeListings: {
        type: Array,
        default: []
    },
    Currency: {
        type: Number,
        default: 0,
    },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;