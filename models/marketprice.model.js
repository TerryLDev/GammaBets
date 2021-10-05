const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const marketPriceSchema = Schema({
    SkinID: {
        type: String,
        required: true
    },
    SkinName: {
        type: String,
        required: true
    },
    SkinMarketplaceURL: String,
    SkinPictureURL: String,
    Value: Number,
    DateLogged: Date
}, {
    timestamps: true
});

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema)

module.exports = MarketPrice;