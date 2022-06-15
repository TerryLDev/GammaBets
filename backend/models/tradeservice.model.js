const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tradeServiceSchema = new Schema({
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
  ExpiradeAfterDays: {
    type: Number,
    default: 1,
  },
  ListingMessage: {
    type: String,
    default: "",
  },
  ListingValue: {
    type: Number,
  },
  ListingSkins: {
    type: Array,
    required: true,
  },
  WantedSkins: {
    type: Array,
  },
  ListingStatus: { // Waiting, Active, AwaitingSecondUser, Complete, Canceled, Error
    type: String,
  },
  AwaitingOffers: {
    type: Array,
    default: []
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

tradeServiceSchema.index({ExpiradeAfterDays: 1}, {expireAfterSeconds: 86400});
tradeServiceSchema.index({ExpiradeAfterDays: 2}, {expireAfterSeconds: 172800});
tradeServiceSchema.index({ExpiradeAfterDays: 3}, {expireAfterSeconds: 259200});
tradeServiceSchema.index({ExpiradeAfterDays: 4}, {expireAfterSeconds: 345600});
tradeServiceSchema.index({ExpiradeAfterDays: 5}, {expireAfterSeconds: 432000});
tradeServiceSchema.index({ExpiradeAfterDays: 6}, {expireAfterSeconds: 518400});
tradeServiceSchema.index({ExpiradeAfterDays: 7}, {expireAfterSeconds: 604800});

const TradeService = mongoose.model('TradeService', tradeServiceSchema);

module.exports = TradeService;
