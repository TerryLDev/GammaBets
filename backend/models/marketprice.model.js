const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const marketPriceSchema = new Schema({
    SkinName: {
        type: String,
        required: true,
        unique: true,
    },
    SkinPictureURL: String,
    Value: Number,
    DateLogged: Date
}, {
    timestamps: true
});

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema)

module.exports = MarketPrice;