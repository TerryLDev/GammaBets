const Events = require('events');
const TradeService = require("../../models/tradeservice.model");
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
  
  validateNewListing(listingData, dbSkins, userDB) {
    // does it have at least one skin
    // does the listing minimum value 5% less of the total value
    // does the listing have a valid expiration date 
      // max of 7 days
      // min of 1 day
    // have they reached listing limit
      // max of 3 listings
    
      const totalListingValue = this.getListingValue(listingData.listingSkins, dbSkins);

    if (listingData.listingSkins.length < 1) {
      return false;
    }

    else if (listingData.minPrice < totalListingValue * 0.95 || listingData.minPrice > totalListingValue) {
      return false;
    }

    else if (listingData.dayToExpire < 24 * 60 * 60 * 1000 || listingData.dayToExpire > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    else if (userDB.TradeListings.length >= 3) {
      return false;
    }

    else {
      return true;
    }

  }
  validateNewOffer(offerData, listingID) {}
  #getListingQuery(listingData) {}
  #getOfferQuery(offerData, listingID) {}
  createNewListing(listingData) {}

  getListingValue(skins, dbSkins) {
    let totalListingValue = 0
    skins.forEach(skin => {
      const skinIndex = dbSkins.findIndex(dbSkin => skin.name == dbSkin["SkinName"]);
      totalListingValue += dbSkins[skinIndex]["Value"];
    });
    return totalListingValue;
  }
  
}

module.exports = TradeManager;