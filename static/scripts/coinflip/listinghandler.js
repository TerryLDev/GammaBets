import * as gameInteraction from "./gameinteraction.js";
import * as deposit from "../deposit.js";

const gameListings = document.getElementById("coinflip-listing-area");
const allViews = document.getElementById("all-cf-views");
const steamID = document.getElementById("user-steam-id").value;

let allCFGames = [];

// only use loader
socket.on("coinFlipLoader", (games) => {
    // "games" is going to be an array of all the cf games from the external json file
    games.forEach((game) => {
        if (game.gameState) {
            // add game as a listing and builds the view menu for the game
            if (allCFGames.find((element) => element.gameID == game.gameID) == undefined) {
                addNewCFGame(game);
                buildView(game);
            }
            else if (game.timer == "cancel") {
                // reset the game listing and view menu
                buildView(game);
            }
            else if (game.winner != "none") {
            }

            // idk yet
            else if (game.timer != false && (game.playerTwoState == "Active" || game.playerTwoState == "Accepted")) {
                gameInteraction.updateTimer(game);
                gameInteraction.removeJoinButton(game);
            }
        }

        // this should remove the game from the website after it has been flipped
        else {
            // remove game from game array

            let position = allCFGames.findIndex((obj) => {
                if (obj.gameID == game.gameID) {
                    return obj;
                }
            });

            allCFGames.splice(position, 1);

            // remove game from html element child of cf-game-area

            gameListings.removeChild(document.getElementById(game.gameID));
        }
    });
});

function addNewCFGame(cf) {
    allCFGames.push(cf);

    // main div for coin flip listing
    let coinFlipGameListing = document.createElement("div");
    coinFlipGameListing.className = "coinflip-listing";
    coinFlipGameListing.id = String(cf.gameID);

    // image element for player profile image
    let playerImage = document.createElement("img");
    playerImage.className = "coinflip-listing-img";
    playerImage.src = cf.playerOnePicture;

    ///////////////////////

    // div element for Username and coin flip value
    let playerInfo = document.createElement("div");
    playerInfo.className = "cf-game-user-info";

    // player username
    let playerName = document.createElement("p");
    playerName.innerText = cf.playerOneUser;
    playerName.className = "cf-game-user-info-username";

    // coin flip value
    let coinFlipValue = document.createElement("p");
    let value = (cf.totalValue / 100).toFixed(2);
    coinFlipValue.innerText = "$" + value;
    coinFlipValue.className = "cf-game-user-info-value";

    // push both into player info div
    playerInfo.appendChild(playerName);
    playerInfo.appendChild(coinFlipValue);

    ///////////////////////

    // buttons for the coin flip: view and join

    const headsBackground = "rgba(237, 44, 44, 0.35)";
    const tailsBackground = "rgba(251, 166, 39, 0.28)";

    let buttonListingDiv = document.createElement("div");
    buttonListingDiv.className = "cf-game-buttons";

    let joinButton = document.createElement("button");
    joinButton.innerText = "Join";
    joinButton.className = "join-button";

    // this should bring up the deposit button
    joinButton.addEventListener("click", (event) => {
        let elements = event.path;

        let id;

        elements.forEach((element) => {
            if (element.className == "cf-game-listing") {
                id = element.id;
            }
        });

        deposit.buildDepositMenu(steamID, cf.gameID, null);
    });

    if (cf.playerTwoState == "Accepted" || cf.playerTwoState == "Active") {
        joinButton.classList.add("display-none");
    }

    // view button
    let viewButton = document.createElement("button");
    viewButton.innerText = "View";
    viewButton.className = "view-button";

    //////////////////////////////////////////////
    // still working on join and view button
    // also put event handler in the gameinteraction.js file
    //////////////////////////////////////////////

    // this brings up the view menu of the coin flip
    viewButton.addEventListener("click", (event) => {
        let elements = event.path;

        let id;

        elements.forEach((element) => {
            if (element.className == "cf-game-listing") {
                id = element.id;
            }
        });

        let selectedView = document.querySelector(`[data-view-id="${id}"]`);

        const back = document.getElementById("popup-menu-background");

        back.style.display = "";
        back.classList.add("fade-background");
        try {
            selectedView.classList.remove("display-none");
        }
        catch (e) {
            return null
        }
        selectedView.classList.add("show-selected-view-menu");
    });

    if (cf.playerOneSide == "heads") {
        viewButton.style.background = headsBackground;
        joinButton.style.background = headsBackground;
    } else {
        viewButton.style.background = tailsBackground;
        joinButton.style.background = tailsBackground;
    }

    // push both buttons to button div
    if (cf.playerOneId != steamID && cf.playerTwoState != "Active" && cf.timer != "none" && cf.playerTwoState != "Accepted") {
		buttonListingDiv.appendChild(joinButton);
	}
    buttonListingDiv.appendChild(viewButton);

    ///////////////////////

    // now put them all together and you get a new fucking listing
    coinFlipGameListing.appendChild(playerImage);
    coinFlipGameListing.appendChild(playerInfo);
    coinFlipGameListing.appendChild(buttonListingDiv);

    gameListings.appendChild(coinFlipGameListing);
}

// might need to change the view menu later based on the mockups
async function buildView(game) {
    // create a new view menu for listing
    // MAIN DIV FOR VIEW MENU
    let newCFViewMenu = document.createElement("div");

    newCFViewMenu.className = "view-menu";
    newCFViewMenu.classList.add("display-none");

    newCFViewMenu.dataset.viewId = game.gameID;
    newCFViewMenu.dataset.playerOneId = game.playerOneId;

    /////////////////////////////////////

    // all players info and coin
    let playersAndCoin = document.createElement("div");

    playersAndCoin.className = "view-players-and-coin";

    /////////////////////////////////////

    // div for player ONE picture, username, and total value
    let playerOne = document.createElement("div");

    playerOne.className = "view-player";

    // children in order
    let playerOnePic = document.createElement("img");
    let playerOneUsername = document.createElement("p");
    let playerOneValue = document.createElement("p");

    playerOnePic.src = game.playerOnePicture;

    playerOneUsername.innerText = game.playerOneUser;

    playerOneValue.innerText = "$" + (game.totalValue / 100).toFixed(2);

    playerOne.appendChild(playerOnePic);
    playerOne.appendChild(playerOneUsername);
    playerOne.appendChild(playerOneValue);

    playersAndCoin.appendChild(playerOne);

    /////////////////////////////////////

    // middle section for either the timer or the coin
    let viewMiddleSection = document.createElement("div");
    viewMiddleSection.className = "view-middle-section";

    // start, waiting for player to join
    let viewMiddleInfo = document.createElement("p");
    viewMiddleInfo.innerText = "Waiting for Player to Join";

    // join button for middle section
    let viewJoinButton = document.createElement("button");
    viewJoinButton.innerText = "Join";
    viewJoinButton.className = "view-join-button";

    if (game.playerTwoState == "Accepted" || game.playerTwoState == "Active") {
        viewJoinButton.classList.add("display-none");
    }

    viewMiddleSection.appendChild(viewMiddleInfo);
    viewMiddleSection.appendChild(viewJoinButton);

    /////////////////////////////////////

    // div for player TWO picture, username, and total value
    let playerTwo = document.createElement("div");

    playerTwo.className = "view-player";

    // children in order
    let playerTwoPic = document.createElement("img");
    let playerTwoUsername = document.createElement("p");
    let playerTwoValue = document.createElement("p");

    playerTwoPic.src = "/static/images/defaultProfile.png";

    playerTwo.appendChild(playerTwoPic);
    playerTwo.appendChild(playerTwoUsername);
    playerTwo.appendChild(playerTwoValue);

    /////////////////////////////////////

    // add play one and two with middle section

    playersAndCoin.appendChild(playerOne);
    playersAndCoin.appendChild(viewMiddleSection);
    playersAndCoin.appendChild(playerTwo);

    /////////////////////////////////////

    // all the skins they put in and their values
    let allPlayerSkins = document.createElement("div");
    allPlayerSkins.className = "view-both-player-skins";

    // player ONE SKINS
    let playerOneSkinSlots = document.createElement("div");
    playerOneSkinSlots.className = "view-player-skins";

    // loop through all the player skins
    for (let i = 0; i < game.playerOneSkins.length; i++) {
        let newSkin = document.createElement("div");

        newSkin.className = "view-skin";

        let skinPrice = (game.playerOneSkinValues[i] / 100).toFixed(2);

        newSkin.innerHTML =
            "<img src='" +
            game.playerOneSkinPictures[i] +
            "' alt='" +
            game.playerOneSkins[i] +
            "'/><p>" +
            game.playerOneSkins[i] +
            "</p><p>$" +
            skinPrice +
            "</p>";

        playerOneSkinSlots.appendChild(newSkin);
    }

    // player TWO SKINS init
    let playerTwoSkinSlots = document.createElement("div");
    playerTwoSkinSlots.className = "view-player-skins";

    allPlayerSkins.appendChild(playerOneSkinSlots);
    allPlayerSkins.appendChild(playerTwoSkinSlots);

    /////////////////////////////////////

    // put it the view menu together
    newCFViewMenu.appendChild(playersAndCoin);
    newCFViewMenu.appendChild(allPlayerSkins);

    allViews.appendChild(newCFViewMenu);
}

// this show the coin and the flipping timer
function flippingSoon() {}

async function changeView() {}

// join and view button
