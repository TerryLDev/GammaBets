const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const supportSchema = new Schema({
    SupportID: {
        type: String,
        required: true
    },
    SteamID: {
        type: String,
        required: true
    },
    Username: {
        type: String,
        required: true
    },
    TradeURL: String,
    GameMode: String,
    GameID: String,
    Comment: String,
    TicketDate: Date

}, {timestamps: true});

const Support = mongoose.model('Support', supportSchema);

module.exports = Support;