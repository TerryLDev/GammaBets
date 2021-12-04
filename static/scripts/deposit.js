const popupBackGround = document.getElementById("popup-menu-background");
const depositMenu = document.getElementById("deposit-menu");
const playerInventorySlots = document.getElementById("player-inventory-slots");
const totalDepositValue = document.getElementById("deposit-total-value");
const depositInfo = document.getElementById("deposit-info");

const depositButton = document.getElementById("deposit-button");

// build the deposit menu and add deposit info
export function buildDepositMenu(steamID, gameID, side) {
    popupBackGround.style.display = "";
    popupBackGround.className = "fade-background";

    depositMenu.style.display = "";
    depositMenu.classList.add("show-deposit-menu");

    popupBackGround.addEventListener("click", () => {
        popupBackGround.style.display = "none";
        depositMenu.style.display = "none";
        depositMenu.classList.remove("show-deposit-menu");

        playerInventorySlots.innerHTML = "";
        depositInfo.removeAttribute("data-game-id");
        depositInfo.removeAttribute("data-side");
    });

    if (gameID != null) {
        depositInfo.dataset.gameId = gameID;
    } else if (side != null) {
        depositInfo.dataset.side = side;
    }

    socket.emit("getInventory", {
        steamID: steamID,
    });
}

socket.on("getInventory", (inv) => {
    inv.forEach((item) => {
        let skinDiv = document.createElement("div");
        skinDiv.className = "skin-slot";

        let price = (item.price / 100).toFixed(2);

        let inputCheckBox = document.createElement("input");
        inputCheckBox.className = "skin-input";
        inputCheckBox.type = "checkbox";
        inputCheckBox.value = item.id;
        inputCheckBox.id = item.id;
        inputCheckBox.name = item.id;

        inputCheckBox.addEventListener("click", (Element) => {
            let checkInput = Element.path[0];
            if (checkInput.checked) {
                // selecting skin
                let findLabel = checkInput.nextElementSibling;
                let labelChildren = findLabel.children;
                let price = parseFloat(
                    labelChildren[2].textContent.split("$")[1]
                );
                changeDepositTotalValuePos(price);
            } else {
                // deselecting skins
                let findLabel = checkInput.nextElementSibling;
                let labelChildren = findLabel.children;
                let price = parseFloat(
                    labelChildren[2].textContent.split("$")[1]
                );
                changeDepositTotalValueNeg(price);
            }
        });

        let label = document.createElement("label");
        label.setAttribute("for", item.id);
        label.className = "inventory-skin-slot-label";

        let skinImg = document.createElement("img");
        skinImg.className = "inventory-skin-slot-img";
        skinImg.src = item.imageURL;
        skinImg.alt = item.name;

        let skinName = document.createElement("p");
        skinName.className = "inventory-skin-slot-name";
        skinName.textContent = item.name;

        let skinPrice = document.createElement("p");
        skinPrice.className = "inventory-skin-slot-price";
        skinPrice.textContent = "$" + price;

        label.appendChild(skinImg);
        label.appendChild(skinName);
        label.appendChild(skinPrice);

        skinDiv.appendChild(inputCheckBox);
        skinDiv.appendChild(label);

        playerInventorySlots.appendChild(skinDiv);
    });
});

function changeDepositTotalValuePos(price) {
    let newPrice = (parseFloat(totalDepositValue.textContent) + price).toFixed(
        2
    );

    totalDepositValue.textContent = newPrice;
}

function changeDepositTotalValueNeg(price) {
    let newPrice = (parseFloat(totalDepositValue.textContent) - price).toFixed(
        2
    );

    totalDepositValue.textContent = newPrice;
}

// this gonna be a big one
depositButton.addEventListener("click", (Event) => {
    console.log(Event);

    // values to push
    const steamID = document.getElementById("user-steam-id").value;
    const tradeURL = document.getElementById("user-trade-url").value;
    let listOfSkins = [];

    // check what page the user is one
    let windowEvent = location.pathname;
    let slotList = playerInventorySlots.childNodes;

    for (let i = 0; i < slotList.length; i++) {
        if (slotList[i].firstChild.checked) {
            listOfSkins.push(slotList[i].firstChild.value);
        }
    }

    let checkforSide = depositInfo.hasAttribute("data-side");
    let checkForGameID = depositInfo.hasAttribute("data-game-id");

    // check if in coinflip page
    if (windowEvent == "/coinflip") {
        if (checkForGameID) {
            let gameID = depositInfo.dataset.gameId;
        } else if (checkforSide) {
            let side = depositInfo.dataset.side;
            createNewCFGame(steamID, listOfSkins, tradeURL, side);
        }
    }

    // checks if in jackpot page
    else if (windowEvent == "/") {
    }
});

export function createNewCFGame(steamID, listOfSkins, tradeURL, side) {
    const data = {
        user: steamID,
        skins: listOfSkins,
        tradeURL: tradeURL,
        side: side,
    };

    socket.emit("createNewCoinFlipGame", data);
}

export function joinCFGAme(steamID, listOfSkins, tradeURL, gameId) {
    const data = {
        // yea i know
    };
    socket.emit("joinActiveCoinFlipGame", data);
}
