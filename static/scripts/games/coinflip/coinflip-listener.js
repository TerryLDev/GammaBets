import * as gameInteraction from "./gameinteraction.js";
import * as deposit from "../deposit.js";

const gameListings = document.getElementById("coinflip-listing-area");
const allViews = document.getElementById("all-cf-views");

let allCFGames = [];

// grabs data from json when user first loads coinflip
window.addEventListener("load", function(e) {

    let url = window.location.href + "/json";

    fetch(url)
    .then(response => {
        response.json().then(json => {
            let gameArray = json;

            gameArray.forEach(gameObj => {
                addNewCFGame(gameObj);
                buildView(gameObj);
            })
        })
        .catch(err => {
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
    });

});

socket.on("cfTimer", async (data) => {
    try {

        await data.forEach(timeObj => {

            gameInteraction.updateTimer(timeObj.GameID, timeObj.State, timeObj.CurrentTime);
            
        })
    }

    catch (err) {

    }
})

socket.on("newCFGame", async (cfGameObject) => {

    try {

        addNewCFGame(cfGameObject);
        buildView(cfGameObject);

    }

    catch (err) {

        console.log(err);
        console.log("New Coin Flip Game was not able to be added, please refresh the page");
        
    }

});

socket.on("secondPlayerJoiningCFGame", async (data) => {

    try {

        await gameInteraction.secondPlayerJoining(data.GameID, data.PlayerTwoSide, data.UserPicURL, data.Username);
        gameInteraction.removeJoinButton(data.GameID);

    }

    catch (err) {

        console.log(err);
        console.log("Player attempted to join a coin flip, but update was not pushed. Please refresh the page to see updates");

    }

});

socket.on("secondPlayerAccepctedTrade", async (data) => {

    // data format
	/*  data.GameID = gameObject.GameID;
    	data.PlayerTwoSkins = gameObject.Players[1].skins;
		data.PlayerTwoSkinValues = gameObject.Players[1].skinValues;
		data.PlayerTwoSkinPictures = gameObject.Players[1].skinPictures;
		data.PlayerTwoSide = gameObject.playerTwoSide;
	*/

    try {

        gameInteraction.playerTwoAcceptedTrade(data);

    }

    catch(err) {

    }

});

socket.on


// only use loader
/*
socket.on("coinFlipLoader", (games) => {

    // "games" is going to be an array of all the cf games from the external json file
    games.forEach((game) => {

        if (game.gameState) {

            // add game as a listing and builds the view menu for the game when page is loaded and a new game comes
            if (allCFGames.find((element) => element.gameID == game.gameID) == undefined) {
                addNewCFGame(game);
                buildView(game);
            }

            else if (game.playerTwoState == "Active" && game.timer >= 0) {
                // get picture and name and timer
                
                // update picture and name
                gameInteraction.playerJoined(game.gameID, game.playerTwoSide, game.playerTwoPicture, game.playerTwoUser);

                // update timer
                gameInteraction.updateTimer(game);

                gameInteraction.removeJoinButton(game);

            }

            else if (game.playerTwoState == "cancel") {

                // reset the game listing if second trade is canceled
                gameInteraction.tradeCanceled(game)

            }

            else if (game.playerTwoState == "Accepted" && game.winner == "none") {

                // show player two skins and values and starts flipping timer

                // show skins and player value
                gameInteraction.playerTwoAcceptedTrade(game)

                // update timer
                gameInteraction.updateTimer(game)

            }

        }

        // this should remove the game from the website after it has been flipped
        else {

            if (game.winner != "none") {

                // shows the animation for the coinflip, removes game from listing, places game in the history container
                // also it should show the coinflip animation and then show a the winner afterwards

                //Remove game from listing
                gameInteraction.removeGameLisiting(game);

                // show animation
                gameInteraction.showAnimationAndWinner(game);

                let index = allCFGames.findIndex(splicer => {
                    if (splicer.gameID == game.gameID) {
                        return splicer
                    }
                })

                allCFGames.splice(index, 1);

            }

        }
    });

});
*/

function addNewCFGame(cf) {

    // push new game to array
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

    const redBackground = "rgba(138, 14, 14, 0.9)";
    const blackBackground = "rgba(24, 24, 24, 0.9)";

    let buttonListingDiv = document.createElement("div");
    buttonListingDiv.className = "cf-game-buttons";

    let joinButton = document.createElement("button");
    joinButton.innerText = "Join";
    joinButton.className = "join-button";

    // this should bring up the deposit button
    joinButton.addEventListener("click", (event) => {

        let steamID = localStorage.SteamID

        if (steamID == null || steamID == undefined || steamID == "") {
            alert("Please Sign In Through to Join a Coin Flip");

        }

        else {
            let elements = event.path;
            console.log(elements)

            let id;

            elements.forEach((element) => {
                console.log(element)
                if (element.className == "coinflip-listing") {
                    id = element.id;
                }
            });

            deposit.buildDepositMenu(steamID, id, null);
        }
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
            if (element.className == "coinflip-listing") {
                id = element.id;
            }
        });

        let selectedView = document.querySelector(`[data-view-id="${id}"]`);

        console

        const back = document.getElementById("popup-menu-background");

        back.style.display = "";
        back.classList.add("fade-background");
        selectedView.style.display = "";
        selectedView.classList.add("show-selected-view-menu");

    });

    if (cf.playerOneSide == "red") {
        viewButton.style.background = redBackground;
        joinButton.style.background = redBackground;
    } else {
        viewButton.style.background = blackBackground;
        joinButton.style.background = blackBackground;
    }

    // push both buttons to button div
    if (cf.timer == false) {
        let steamID = localStorage.SteamID

        if (steamID != cf.playerOneId) {
            buttonListingDiv.appendChild(joinButton);
        }
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
function buildView(game) {
    // create a new view menu for listing

    // container for background color
    let newCFViewMenu = document.createElement("div");

    newCFViewMenu.className = "view-menu";
    newCFViewMenu.style.display = "none";

    newCFViewMenu.dataset.viewId = game.gameID;
    newCFViewMenu.dataset.playerOneId = game.playerOneId;

    //container for background image
    let imageContainer = document.createElement("img")
    imageContainer.src = "/static/images/gammalogo.png";
    imageContainer.className = "view-background-image"

    // container for all main components
    let mainCointainer = document.createElement("div");
    mainCointainer.className = "main-view-container";

    newCFViewMenu.appendChild(imageContainer);
    newCFViewMenu.appendChild(mainCointainer);

    /////////////////////////////////////

    // all players info and coin
    let playersAndCoin = document.createElement("div");

    playersAndCoin.className = "view-players-and-coin";

    /////////////////////////////////////

    // container for players picture, username, and total value
    let playerOne = document.createElement("div");
    playerOne.className = "view-player-profile";

    // children in order
    let playerOnePic = document.createElement("img");    
    let playerOneUsername = document.createElement("p");
    let playerOneValue = document.createElement("p");

    // setting up player ONE image
    playerOnePic.src = game.playerOnePicture;

    if (game.playerOneSide == "red") {
        playerOnePic.className = "red-player-profile-picture";
    }

    else {
        playerOnePic.className = "black-player-profile-picture";
    }

    // setting up player ONE username
    playerOneUsername.className = "view-player-name"
    playerOneUsername.innerText = game.playerOneUser;

    // setting up player ONE value
    let pOneVal = 0;

    game.playerOneSkinValues.forEach(val => {
		pOneVal += val;
	});
    
    playerOneValue.innerText = "$" + (pOneVal / 100).toFixed(2);
    playerOneValue.className = "view-player-value"

    playerOne.appendChild(playerOnePic);
    playerOne.appendChild(playerOneUsername);
    playerOne.appendChild(playerOneValue);

    playersAndCoin.appendChild(playerOne);

    /////////////////////////////////////

    // middle section for either the timer or the coin
    let viewMiddleSection = document.createElement("div");
    viewMiddleSection.className = "view-coin-section";

    let coinPic = document.createElement("img");
    coinPic.className = "view-coin-section-img";

    if (game.playerOneSide == "red") {
        coinPic.src = "/static/images/RedChip.png";
    }
    else {
        coinPic.src = "/static/images/blackchip.png";
    }

    // start, waiting for player to join
    let viewMiddleInfo = document.createElement("p");

    if (game.timer == false) {
        viewMiddleInfo.innerText = "Waiting for Player...";
    }
    else {
        viewMiddleInfo.innerText = game.timer;
    }
    viewMiddleInfo.className = "view-coin-section-p";

    viewMiddleSection.appendChild(coinPic);
    viewMiddleSection.appendChild(viewMiddleInfo);
    
    playersAndCoin.appendChild(viewMiddleSection)

    /////////////////////////////////////

    // div for player TWO picture, username, and total value
    let playerTwo = document.createElement("div");
	playerTwo.className = "view-player-profile";
    playerTwo.classList.add("player-two-section");

	// children in order
	let playerTwoPic = document.createElement("img");
	let playerTwoUsername = document.createElement("p");
	let playerTwoValue = document.createElement("p");

	// setting up player ONE image
    if (game.playerTwoPicture == "none") {
        playerTwoPic.src = "/static/images/user/defaultProfile.png";
    }
    else {
        playerTwoPic.src = game.playerTwoPicture;
    }

	if (game.playerOneSide == "red") {
		playerTwoPic.className = "black-player-profile-picture";
	}
    
    else {
		playerTwoPic.className = "red-player-profile-picture";
	}

	// setting up player TWO username
	playerTwoUsername.className = "view-player-name";

    if (game.playerTwoUser == "none"){
        playerTwoUsername.innerText = "Waiting...";
    }

    else {
        playerTwoUsername.innerText = game.playerTwoUser;
    }

	// setting up player TWO value

    let pTwoVal = 0;

    if (game.playerTwoSkinValues != "none") {

        game.playerTwoSkinValues.forEach(val => {
            pTwoVal += val;
        });
    }

	playerTwoValue.innerText = "$" + (pTwoVal / 100).toFixed(2);
	playerTwoValue.className = "view-player-value";

	playerTwo.appendChild(playerTwoPic);
	playerTwo.appendChild(playerTwoUsername);
	playerTwo.appendChild(playerTwoValue);

	playersAndCoin.appendChild(playerTwo);

    mainCointainer.appendChild(playersAndCoin);

    /////////////////////////////////////

    // all the skins they put in and their values
    let allPlayerSkins = document.createElement("div");
    allPlayerSkins.className = "view-both-player-skins";

    // player ONE SKINS
    let playerOneSkins = document.createElement("div");
    playerOneSkins.className = "view-skins-grid";

    let playerOneSlotClass;

    if (game.playerOneSide == "red") {
        playerOneSlotClass = "red-player-skin-slot";
    }
    else {
        playerOneSlotClass = "black-player-skin-slot";
    }

    // loop through all the player skins
    for (let i = 0; i < game.playerOneSkins.length; i++) {
        let slot = document.createElement("div");
        slot.className = playerOneSlotClass;

        let slotSkinImg = document.createElement("img");
        slotSkinImg.src = game.playerOneSkinPictures[i];
        slotSkinImg.alt = "N/A"
        slotSkinImg.className = "view-slot-img";

        let slotSkinValue = document.createElement("p");
        slotSkinValue.textContent = "$" +(game.playerOneSkinValues[i] / 100).toFixed(2);
        slotSkinValue.className = "view-slot-value";

        slot.appendChild(slotSkinImg);
        slot.appendChild(slotSkinValue);

        playerOneSkins.appendChild(slot);

    }

    allPlayerSkins.appendChild(playerOneSkins)

    // player Two Skins
    let playerTwoSkins = document.createElement("div");
	playerTwoSkins.className = "view-skins-grid";
    playerTwoSkins.classList.add(".player-two-section")

	let playerTwoSlotClass;

	if (game.playerOneSide == "red") {
		playerTwoSlotClass = "black-player-skin-slot";
	} else {
		playerTwoSlotClass = "red-player-skin-slot";
	}

	// loop through all the player skins
    if (game.playerTwoSkins != "none") {
        for (let i = 0; i < game.playerTwoSkins.length; i++) {
			let slot = document.createElement("div");
			slot.className = playerTwoSlotClass;

			let slotSkinImg = document.createElement("img");
			slotSkinImg.src = game.playerTwoSkinPictures[i];
			slotSkinImg.alt = "N/A";
			slotSkinImg.className = "view-slot-img";

			let slotSkinValue = document.createElement("p");
			slotSkinValue.textContent =
				"$" + (game.playerTwoSkinValues[i] / 100).toFixed(2);
			slotSkinValue.className = "view-slot-value";

			slot.appendChild(slotSkinImg);
			slot.appendChild(slotSkinValue);

			playerTwoSkins.appendChild(slot);
		}
    }

    allPlayerSkins.appendChild(playerTwoSkins);

    mainCointainer.appendChild(allPlayerSkins);

    allViews.appendChild(newCFViewMenu);
}

// this show the coin and the flipping timer
function flippingSoon() {}

async function changeView() {}

// join and view button
