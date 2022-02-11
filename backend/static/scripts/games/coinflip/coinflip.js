import * as deposit from "../deposit.js";

const red = document.getElementById("coin-red");
const black = document.getElementById("coin-black");
const createACoinFlipButton = document.getElementById("create-a-coinflip");

const redBorder = "2px solid black";
const redBackground = "#8a0e0e";

const blackBorder = "2px solid white";
const blackBackground = "#181818";

function selectedButton(value) {

    // select red
    if (value == "red") {

        if (black.style.border == blackBorder) {
            black.style.border = "";
            black.style.background = "";

            red.style.border = redBorder;
            red.style.background = redBackground;
        }

        else {
            red.style.border = redBorder;
            red.style.background = redBackground;
        }
    }

    // select black
    else {

        if (red.style.border == redBorder) {
            red.style.border = "";
            red.style.background = "";

            black.style.border = blackBorder;
            black.style.background = blackBackground;
        }

        else {
            black.style.border = blackBorder;
            black.style.background = blackBackground;
        }
    }
}

function createCoinFlip(id) {

    if (black.style.border != blackBorder && red.style.border != redBorder) {

        alert("You need to select a side first before creating a coin flip");
    }

    else if (black.style.border == blackBorder && red.style.border == redBorder) {
        alert("You can't choose both sides");
    }

    else if (black.style.border == blackBorder) {
        // show deposit menu and log that they chose black
        deposit.buildDepositMenu(id, null, "black");
    }

    else if (red.style.border == redBorder) {
        // show deposit menu and log that they chose black
        deposit.buildDepositMenu(id, null, "red");
    }

    else {
        alert("Error has occured");
    }
}

red.addEventListener("click", async () => {
    try {
        selectedButton("red");
    }

    catch(err) {
        console.log("You can't choose that my guy")
    }
});

black.addEventListener("click", async () => {
    try {
        selectedButton("black");
    }

    catch(err) {
        console.log("You can't choose that my guy")
    }
});

createACoinFlipButton.addEventListener("click", async () => {

    try {

        let steamID = await localStorage.SteamID;

        if (await steamID == "" || await steamID == undefined || await steamID == null) {
            alert("Please sign in through steam first");
        }

        else {
            createCoinFlip(await steamID);
        }

    }

    catch(err) {

        alert("Please sign in through steam first dummy");

    }

});
