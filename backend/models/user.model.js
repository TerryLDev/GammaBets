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
    Trades: Array,
    Profit: Number,
    BetAmount: Number,
    GamesPlayed: {
        type: Array
    }
}, {
    timestamps: true
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;