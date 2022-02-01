/*

/ Player Bet Div /
<div id="default-player-bet" class="player-bet" style="display: none">
	<img class="player-bet-profile-img" src="" />
	<div class="player-bet-skins">
		<img class="player-skin-img" src="" />
		<p>+Overflow</p>
	</div>
	<div class="player-bet-val-and-name">
		<h5>$value percent%</h5>
		<h6>Username</h6>
	</div>
</div>

use document.importNode() to clone this div

/ Background classes /

>= 50% : .top-player-bet
40% - 49.99% : .first-player-bet
30% - 40% : .second-player-bet
20% - 30% : .third-player-bet
10% - 20% : .fourth-player-bet
0% - 10% : .fifth-player-bet

*/

export function setCurrentJPTIme (time) {

    currentTime = time;

}

const jpPot = document.getElementById("jp-pot");

export function loadPot(pot) {

    if (pot.Players.length == 1) {

        let playerDocElement = createNewPlayerDiv(player, pot);
        playerDocElement.style.display = "";

        jpPot.appendChild(playerDocElement);

    }

    else if (pot.Players.length > 1) {

        pot.Players.forEach(player => {

            let playerDocElement = createNewPlayerDiv(player, pot);
            playerDocElement.style.display = "";

            jpPot.appendChild(playerDocElement);

        });

        startTimer(pot.Time);

    }

}

export function newPot(pot) {

    if (pot.Players.length >= 1) {

        pot.Players.forEach(player => {

            let playerDocElement = createNewPlayerDiv(player, pot);
            playerDocElement.style.display = "";

            jpPot.appendChild(playerDocElement);

        });

    }

}

export function newPlayer(data) {

    let playerDocElement = createNewPlayerDiv(data.Player, data.TotalPotValue);
    playerDocElement.style.display = "";

    jpPot.appendChild(playerDocElement);

}

/*
let currentTime = 120;
startTimer(currentTime);
let circleTimer = document.getElementById("jp-timer-circle");
let jpTimerText = document.getElementById("jp-current-time");

////////////////////////////////

export async function startTimer() {

    if (await currentTime > 0) {

        callTimerAnimation(await currentTime);

    }

    else {

        circleTimer.style.strokeDashoffset = 283;

    }

}

function callTimerAnimation(time) {
    // 120/120 = 283/283

    // formula: time/120 = x/283


    let offset = 283 - ((time * 283) / 120);

    circleTimer.style.strokeDashoffset = offset;
    jpTimerText.textContent = startTime;

}

*/

////////////////////////////////

function createNewPlayerDiv(player, pot) {

    // create a new doc element
    let newPlayerElement = document.importNode(document.getElementById("default-player-bet"), true);

    // set id equal to the player's steamid
    newPlayerElement.id = player.userSteamId;

    // find profile picture div and set it to the player's profile picture
    let playerPicture = newPlayerElement.querySelector(".player-bet-profile-img");
    playerPicture.src = player.userPicture;

    // check if this is the current user's bet, if true add a border around their picture
    if (localStorage.SteamID == player.userSteamId) {
        playerPicture.classList.add("user-bet-border");
    }

    // find player skins div, and add pictures of their skins to the div. overflow after 9
    let userSkins = newPlayerElement.querySelector(".player-bet-skins");
    userSkins.innerHTML = "";

    let playerTotal = 0;

    // check for overflow, if true add an overflow number "+n"
    if (player.skinPictures.length > 9) {

        for(let n = 0; n < 9; n++) {

            let skinImg = document.createElement("img");
            skinImg.src = player.skinPictures[n];
            skinImg.className = "player-skin-img";

            userSkins.appendChild(skinImg);

            playerTotal+=player.skinValues[n];

        }

        let overflowNum = player.skinPictures.length - 1;

        let skinOverflow = document.createElement("p");
        skinOverflow.textContent = "+" + overflowNum;

        userSkins.appendChild(skinOverflow);

    }

    else {

        for(let n = 0; n < player.skinPictures.length; n++) {

            let skinImg = document.createElement("img");
            skinImg.src = player.skinPictures[n];
            skinImg.className = "player-skin-img";

            userSkins.appendChild(skinImg);

            playerTotal+=player.skinValues[n];

        }

    }

    // get the div for the player's value, percent, and name
    let playerBetValAndName = newPlayerElement.querySelector(".player-bet-val-and-name");

    // seperate the value and percent div and the username div
    let valAndPercentDiv = playerBetValAndName.querySelector("h5");
    let playerUsernameDiv = playerBetValAndName.querySelector("h6");

    // set the name
    playerUsernameDiv.textContent = player.username;

    valAndPercentDiv.textContent = getPlayerValueAndPercent(playerTotal, pot.TotalPotValue);

    newPlayerElement.classList.add(getPlayerBetBackgroundColor(playerTotal, pot.TotalPotValue));

    return newPlayerElement;

}

const changePotItemsTotal = () => {

}

const changePotValue = () => {

}

const changePlayerValueAndPercent = () => {

}

// return text to put in doc element's textContent
const getPlayerValueAndPercent = (playerVal, potTotal) => {

    /*

    >= 50% : .top-player-bet
    40% - 49.99% : .first-player-bet
    30% - 40% : .second-player-bet
    20% - 30% : .third-player-bet
    10% - 20% : .fourth-player-bet
    0% - 10% : .fifth-player-bet

    */

    let percent = (((playerVal / potTotal) * 100).toFixed(2)) + "%";

    let value = "$" + playerVal.toFixed(2);

    const text = `${value} ${percent}`;

    return text;

}

const getPlayerBetBackgroundColor = (playerVal, potTotal) => {

    let percent = (playerVal / potTotal) * 100;

    if (percent >= 50) {

        return "top-player-bet";

    }

    else if (percent > 40) {

        return "first-player-bet";
        
    }
    
    else if (percent > 30) {

        return "second-player-bet";
        
    }

    else if (percent > 20) {

        return "third-player-bet";
        
    }
    
    else if (percent > 10) {

        return "fourth-player-bet";
        
    }

    else {

        return "fifth-player-bet";

    }

}

const changeJPTimer = () => {

}