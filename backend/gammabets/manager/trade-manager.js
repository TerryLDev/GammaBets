const Events = require('events');
const TradeService = require("../models/tradeservice.model");
const tradeEvents = new Events.EventEmitter();

class TradeManager {

  generateNewListingID() {
    // generate a new listingID
    const chars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    let listingID = "TR";

    for (let i = 0; i < 14; i++) {
      listingID += chars[Math.floor(Math.random() * chars.length)];
    }

    return listingID;
  }
  validateNewListing(listingData) {
    // does it have at least one skin
    // does the listing minimum value 5% less of the total value
    // does the listing have a valid expiration date
    // have they reached listing limit
  }
  validateNewOffer(offerData, listingID) {}
  #getListingQuery(listingData) {}
  #getOfferQuery(offerData, listingID) {}
  createNewListing(listingData) {}
  
}

module.exports = TradeManager;