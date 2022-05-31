const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tradeServiceSchema = Schema({
  ListingID: { 
    type: String,
    required: true,
    unique: true 
  },
  TradeID: {
    type: String,
    required: true,
  },
  CreatorSteamID: {
    type: String,
    required: true,
  },
  BotID: {
    type: String,
    required: true,
  },
  ExpirationDate: {
    type: Date,
    required: true,
  },
  ListingMessage: {
    type: String,
  },
  ListingValue: {
    type: Number,
  },
  Skins: {
    type: Array,
    required: true,
  },
  WantedSkins: {
    type: Array,
  },
  ListingStatus: {
    type: String,
  },
  AwaitingOffers: {
    type: Array,
  },
  AcceptedOffer: {
    type: Object,
  },
  SecondUserSteamID: {
    type: String,
  },
  SecondUserTradeID: {
    type: String,
  },
  SecondUserTradeOfferStatus: {
    type: String,
  },
},
{timestamps: true});

const TradeService = mongoose.model('TradeService', tradeServiceSchema);

module.exports = TradeService;
