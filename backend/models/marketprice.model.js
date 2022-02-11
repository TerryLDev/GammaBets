const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const marketPriceSchema = Schema({
    SkinName: {
        type: String,
        required: true
    },
    SkinPictureURL: String,
    Value: Number,
    DateLogged: Date
}, {
    timestamps: true
});

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema)

module.exports = MarketPrice;