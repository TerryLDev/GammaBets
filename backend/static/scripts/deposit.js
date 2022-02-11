import { canMakeTradeRequest } from "./main-handler.js";
const socket = io(window.location.origin);

const depositButton = document.getElementById("deposit-button");

depositButton.addEventListener("click", () => {

    // figure out from what page this is coming from
    const pathName = window.location.pathname;

    // Jackpot pages // Will need changes later when we get another bot
    if (pathName == "/" || pathName == "/lowstakes") {

        let selectedSkins = JSON.parse(localStorage.SkinsToDeposit);

        if (selectedSkins.length > 0) {

            if (canMakeTradeRequest(Date.now())) {

                const data =  {
                    SteamID: localStorage.SteamID,
                    Skins: selectedSkins,
                    TradeURL: localStorage.TradeURL,
                    PotType: "high",
                }

                socket.emit("jackpotDeposit", data)

            }

            else {
                console.log("You can only send a request every 3 seconds");
            }

        }

        else {
            console.log("No Skins Were Selected")
        }

    }

    // CoinFlip
    else if (pathName == "/coinflip") {

    }
})