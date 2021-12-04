import * as deposit from "../deposit.js";

const steamID = document.getElementById("user-steam-id").value;

const heads = document.getElementById("coin-heads");
const tails = document.getElementById("coin-tails");
const createACoinFlipButton = document.getElementById("create-a-coinflip");

const headsBorder = "2px solid black";
const tailsBorder = "2px solid white";

function selectedButton(value) {
    // select heads
    if (value == "heads") {
        if (tails.style.border == tailsBorder) {
            tails.style.border = "";
            tails.style.background = "";

            heads.style.border = headsBorder;
            heads.style.background = "rgba(255, 0, 0, 1)";
        } else {
            heads.style.border = headsBorder;
            heads.style.background = "rgba(255, 0, 0, 1)";
        }
    }

    // select tails
    else {
        if (heads.style.border == headsBorder) {
            heads.style.border = "";
            heads.style.background = "";

            tails.style.border = tailsBorder;
            tails.style.background = "rgba(0, 0, 0, 1)";
        } else {
            tails.style.border = tailsBorder;
            tails.style.background = "rgba(0, 0, 0, 1)";
        }
    }
}

function createCoinFlip(id) {
    if (
        tails.style.border != tailsBorder &&
        heads.style.border != headsBorder
    ) {
        alert("You need to select a side first before creating a coin flip");
    }
    else if (tails.style.border == tailsBorder && heads.style.border == headsBorder) {
        alert("You can't choose both sides");
    }
    else if (tails.style.border == tailsBorder) {
        // show deposit menu and log that they chose tails
        deposit.buildDepositMenu(id, null, "tails");
    }
    else if (heads.style.border == headsBorder) {
        // show deposit menu and log that they chose tails
        deposit.buildDepositMenu(id, null, "heads");
    } else {
        alert("Error has occured");
    }
}

heads.addEventListener("click", () => {
    selectedButton("heads");
});
tails.addEventListener("click", () => {
    selectedButton("tails");
});

createACoinFlipButton.addEventListener("click", () => {
    if (steamID == "" || steamID == undefined || steamID == null) {
        alert("Please sign in through steam first");
    } else {
        createCoinFlip(steamID);
    }
});
