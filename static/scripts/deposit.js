export function buildDepositMenu(steamID) {
    socket.emit("getInventory", {
        steamID: steamID,
    });
}

socket.on("getInventory", (inv) => {
    console.log(inv);
});

/*

function openScreen() {
    document.getElementById("deposit-menu").style = "width:50%";
}

function closeScreen() {
    if (document.body.contains(document.getElementById("deposit-menu"))) {
        document.getElementById("deposit-menu").style = "width:0%";
    }
}

let steamID;

if (document.body.contains(document.getElementById("url-steam-id"))) {
    steamID = document.getElementById("url-steam-id").value;
}

let tradeURL;

if (document.body.contains(document.getElementById("tradeurl"))) {
    tradeURL = document.getElementById("tradeurl").value;
}

function addTradeURL() {
    let tradeURL = document.getElementById("tradeurl");
    let steamID = document.getElementById("url-steam-id").value;

    if (tradeURL.value != "") {
        socket.emit("addTradeURL", {
            trade: tradeURL.value,
            steamID: steamID,
        });
    }

    window.location.reload();
}

// Add the users trade url
socket.on("addTradeURL", function (msg) {
    console.log(msg);
});

// send a request to tthe server ot pull the user's inventory
const showDepositButton = document.getElementById("show-deposit-button");

showDepositButton.addEventListener("click", function () {
    socket.emit("getInventory", {
        steamID: steamID,
        tradeURL: tradeURL.value,
    });
});

const playerSkins = document.getElementById("player-skin-selection");
const depositSkins = document.getElementById("deposit-skins");

depositSkins.addEventListener("click", function () {
    // This is checking all the skins that are being selected and sending a request to the server to deposit the skins in either a jackpot game or a coinflip game

    let fullSkinList = playerSkins.childNodes;
    let selectedSkinIDs = [];

    for (let skin in fullSkinList) {
        let checkIt = fullSkinList[skin].childNodes;

        try {
            if (checkIt[0]["checked"]) {
                selectedSkinIDs.push(checkIt[0].id);
            }
        } catch (err) {}
    }

    if (selectedSkinIDs == "") {
        console.log("No Skins Selected");
    } else if (
        document
            .getElementById("new-game-info")
            .contains(document.getElementById("new-game-id"))
    ) {
        console.log("new coin flip game");

        let cfSteamID = document.getElementById("user-steamid").value;
        let cfTradeURL = document.getElementById("user-tradeurl").value;
        let cfSide;
        let cfGameId = document.getElementById("new-game-id").value;

        const heads = document.getElementById("coin-side-heads");
        const tails = document.getElementById("coin-side-tails");

        if (heads.checked) {
            cfSide = "heads";
        } else if (tails.checked) {
            cfSide = "tails";
        }

        socket.emit("createNewCoinFlipGame", {
            user: cfSteamID,
            skins: selectedSkinIDs,
            tradeURL: cfTradeURL,
            side: cfSide,
            gameID: cfGameId,
        });
    } else {
        console.log("new jackpot game");

        socket.emit("makeJackpotDeposit", {
            user: steamID,
            skins: selectedSkinIDs,
            tradeURL: tradeURL,
        });
    }
});

// this is all really bad

////////////////////////////////////////////////

// redoing the entire deposit system

// this script is ran when the player click on their join game for cf or deposit on jp

// basically this creates the deposit menu and
export function buildAndShowDepositMenu(gameID, gameMode) {
    const playerInventory = document.getElementById("player-inventory");
    let steamId = document.getElementById("user-steam-id").value;
    let tradeURL = document.getElementById("user-trade-url").value;

    if (steamId != "") {
        socket.emit("getInventory", {
            gameID: gameID,
            steamID: steamID,
            tradeURL: tradeURL.value,
        });

        socket.on("getInventory", (inv) => {
            if (inv == "") {
            } else {
                // for each intem in inv it should creta s lot for it in the deposit menu

                inv.forEach((item) => {
                    let price = (item["price"] / 100).toFixed(2);

                    let skinItem = document.createElement("div");

                    skinItem.className = "inventory-item";

                    skinItem.innerHTML =
                        "<input type='checkbox' class='inventory-item' id='" +
                        item["id"] +
                        "' /><label for=" +
                        item["id"] +
                        "><img src='" +
                        item["imageURL"] +
                        "' alt='" +
                        item["name"] +
                        "'><p>" +
                        "Price: $" +
                        price +
                        "</p></label>";

                    playerSkins.appendChild(skinItem);
                });
            }
        });
    } else {
        alert("Please Sign To Deposit Skins");
    }
}

export function sendDeposit(gameID, skinList, steamId, tradeURL) {}

// also when the select the skins update the value they are putting in and amount of skins they are depositing
*/
