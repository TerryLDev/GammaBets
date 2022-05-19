const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serverProfitSchema = new Schema({
    GameID: {
        type: String,
        required: true
    },
    SkinIDs: Array,
    BotID: String
}, {
    timestamps: true
}
);

const ServerProfit = mongoose.model('ServerProfit', serverProfitSchema);

module.exports = ServerProfit;