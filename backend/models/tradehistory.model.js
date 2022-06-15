const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tradeHistorySchema = new Schema({
    TradeID: {
        type: String,
        required: true,
        unique: true
    },
    SteamID: {
        type: String,
        required: true
    },
    BotID: {
        type: String,
        required: true
    },
    Skins: Array,
    TransactionType: String,
    State: String,
    GameMode: String,
    GameID: String,
    Action: String,
},
{timestamps: true});

const TradeHistory = mongoose.model('TradeHistory', tradeHistorySchema);

module.exports = TradeHistory;
