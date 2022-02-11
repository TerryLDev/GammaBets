const viewBackground = document.getElementById("popup-menu-background");
const allViews = document.getElementById("all-cf-views");
const listingArea = document.getElementById("coinflip-listing-area");

const winnerBlack = ["/static/images/coins/endblack1.gif", "/static/images/coins/endblack2.gif", "/static/images/coins/endblack3.gif", "/static/images/coins/endblack4.gif"]
const winnerRed = ["/static/images/coins/endred1.gif", "/static/images/coins/endred2.gif", "/static/images/coins/endred3.gif", "/static/images/coins/endred4.gif"];

viewBackground.addEventListener("click", (event) => {
    viewBackground.style.display = "none";

    checkForOpenViews();
});

function getViewMenu(gameID) {

    let viewMenu = document.querySelector(`[data-view-id="${gameID}"]`);

    return viewMenu;

}

function checkForOpenViews() {

    let getMenus = allViews.querySelectorAll(".view-menu");

    for (let i = 0; i < getMenus.length; i++) {
        if (getMenus[i].style.display == "") {
            getMenus[i].style.display = "none";
        }
    }

}

export async function updateTimer(gameID, state, time) {

    if (state == "waiting") {

        document.querySelector(`[data-view-id="${gameID}"]`).querySelector(".view-coin-section-p").textContent = "Waiting for Player... " + time;

    }

    else if (state == "flipping") {

        document.querySelector(`[data-view-id="${gameID}"]`).querySelector(".view-coin-section-p").textContent = "Flipping in..." + time;

    }

}

// remove join butotn on listing and view menu
export async function removeJoinButton(gameID) {

    let targetListing = document.getElementById(gameID).querySelector(".join-button");

    if (targetListing.style.display != "none") {
        targetListing.style.display = "none";
    }
}

// run when second player cancels trade on coinflip
export function tradeCanceled(game) {

    // show join button on listing
    let listingGame = document.getElementById(game.gameID);
    let joinButton = listingGame.querySelector(".join-button");

    joinButton.style.display = "";

    // reset view menu
    let viewMenu = document.querySelector(`[data-view-id="${game.gameID}"]`);
    console.log(viewMenu);

    // reset timer
    let timer = viewMenu.querySelector(".view-coin-section-p");

    timer.textContent = "Waiting for Player...";

    let playerTwoContainer = viewMenu.querySelector(".player-two-section")

    // reset Picture, name, and value
    if(game.playerOneSide == "red") {

        let picture = playerTwoContainer.querySelector(".black-player-profile-picture");

        picture.src = "";
        picture.src = "/static/images/user/defaultProfile.png";

        playerTwoContainer.querySelector(".view-player-name").textContent = "Waiting...";

    }

    else {

        let picture = playerTwoContainer.querySelector(".red-player-profile-picture");

        picture.src = "";
		picture.src = "/static/images/user/defaultProfile.png";

        playerTwoContainer.querySelector(".view-player-name").textContent = "Waiting...";

    }
}

////////////////////////////
////// Working On //////////
////////////////////////////

// should change website view menu when a player joins a coin flip
export function secondPlayerJoining(gameID, pTwoSide, playerTwoPic, playerTwoName) {


    let viewMenu = getViewMenu(gameID);

    let findContainer = viewMenu.querySelector(".player-two-section");

    // if red
    if (pTwoSide == "red") {

        // red player
        findContainer.querySelector(".red-player-profile-picture").src = playerTwoPic;

    }
    
    // if black
    else {

        // black player
        findContainer.querySelector(".black-player-profile-picture").src = playerTwoPic;
    }

    findContainer.querySelector(".view-player-name").textContent = playerTwoName;

}

// run when player 2 accepts the coinflip trade
export function playerTwoAcceptedTrade(game) {

    let viewMenu = document.querySelector(`[data-view-id="${game.GameID}"]`);

    // change the player 2 total value
    let pTwoTotal;
    
    game.PlayerTwoSkinValues.forEach(val => {
        pTwoTotal += val;
    })

    pTwoTotal = (pTwoTotal / 100).toFixed(2)

    viewMenu.querySelector(".player-two-section").querySelector(".view-player-value").textContent = "$" + pTwoTotal;

    // finding the slots of skins grid
    let classSlot;

    if (game.PlayerTwoSide == "red") {
        classSlot = ".red-player-skin-slot";
    }

    else {
        classSlot = ".black-player-skin-slot";
    }

    let playerSkinsSide = viewMenu.querySelector(".view-both-player-skins").querySelector(".player-two-section");

    for (let i = 0; i < game.PlayerTwoSkins.length; i++) {

        let slot = document.createElement("div");
        slot.className = classSlot;

        let slotSkinImg = document.createElement("img");
        slotSkinImg.src = game.PlayerTwoSkinPictures[i];
        slotSkinImg.alt = "N/A";
        slotSkinImg.className = "view-slot-img";

        let slotSkinValue = document.createElement("p");
        slotSkinValue.textContent = "$" + (game.PlayerTwoSkinValues[i] / 100).toFixed(2);
        slotSkinValue.className = "view-slot-value";

        slot.appendChild(slotSkinImg);
        slot.appendChild(slotSkinValue);

        playerSkinsSide.appendChild(slot);
    }

}

export function removeGameLisiting(game) {

    if (listingArea.contains(document.getElementById(`${game.gameID}`))) {
        let node = document.getElementById(`${game.gameID}`);
        console.log(node);

        node.parentElement.removeChild(node);
    }

}

export async function showAnimationAndWinner(game) {

    let viewMenu = document.querySelector(`[data-view-id="${game.gameID}"]`);

    if (viewMenu.hasAttribute("data-flipping") == false) {

        // get the view menu
        let viewMenu = document.querySelector(`[data-view-id="${game.gameID}"]`);

        viewMenu.setAttribute("data-flipping", true);

        // get middle container
        let coinContainer = viewMenu.querySelector(".view-coin-section");
        coinContainer.innerHTML = "";

        // create animation gif container
        let animationContainer = document.createElement("img");
        animationContainer.className = "coin-animation"

        let winnerSide;
        let srcGif;
        let coinImg;
        let name;

        if (game.winner == game.playerOneId) {
            // should return either red or black
            winnerSide = game.playerOneSide;
            name = game.playerOneUser;
        }

        else {
            winnerSide = game.playerTwoSide;
            name = game.playerTwoUser;
        }

        if (winnerSide == 'red') {

            srcGif = winnerRed[Math.floor(Math.random()*winnerRed.length)];
            coinImg = "/static/images/RedChip.png";
        }

        else {
            srcGif = winnerBlack[Math.floor(Math.random()*winnerBlack.length)];
            coinImg = "/static/images/blackchip.png";
        }

        animationContainer.src = srcGif;

        coinContainer.appendChild(animationContainer);

        let winnerCoin = document.createElement("img");
        winnerCoin.src = coinImg;
        winnerCoin.className = "view-coin-section-img";

        let winnerName = document.createElement("p");
        winnerName.className = "view-coin-section-p";
        winnerName.textContent = name;

        setTimeout(function() {
            animationContainer.classList.add("fade-out-coin-animation");
            coinContainer.appendChild(winnerCoin);
            coinContainer.appendChild(winnerName);
            winnerCoin.classList.add("fade-in-coin-winner");
            winnerName.classList.add("fade-in-coin-winner");
        }, 5500);
    }

}
