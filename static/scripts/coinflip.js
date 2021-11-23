const coinflipMenu = document.getElementById('coinflip-menu');
const sideSelect = document.getElementById('side-select');
const cfDepoScreen = document.getElementById('cf-skin-selection');

const gameArea = document.getElementById('');

let allCFGames = [];

function openFirstMenu() {
    coinflipMenu.className = "show-menu";
}

const heads = document.getElementById('coin-side-heads');
const tails = document.getElementById('coin-side-tails');

function changeTails() {
    if (heads.checked == true) {
        tails.checked = !heads.checked;
    }
}

function changeHeads() {
    if (tails.checked == true) {
        heads.checked = !tails.checked;
    }
}

function closeDepoMenu() {

    sideSelect.style.display = "grid";
    coinflipMenu.classList.remove('show-menu');
    cfDepoScreen.style.display = "none";
    cfDepoScreen.classList.remove("show-depo-class");
    tails.checked = false;
    heads.checked = false;
    
    if (document.body.contains(document.getElementById('new-game-id'))) {
        document.getElementById('new-game-id').remove();
    }

}

function closeMenu() {
    coinflipMenu.classList.remove('show-menu');

    if (document.body.contains(document.getElementById('new-game-id'))) {
        document.getElementById('new-game-id').remove();
    }

    tails.checked = false;
    heads.checked = false;
}

const gameInfo = document.getElementById('new-game-info')

function cfDepositMenu() {

    if (tails.checked == true || heads.checked == true) {

        sideSelect.style.display = "none";
        cfDepoScreen.style.display = "flex";
        cfDepoScreen.className = "show-depo-class";

        if(gameInfo.contains(document.getElementById('new-game-id')) == false) {

            let coinflipID = document.createElement('input');
            coinflipID.value = String(Date.now());
            coinflipID.hidden = true;
            coinflipID.id = "new-game-id";

            gameInfo.appendChild(coinflipID);

        }

        else {

            let coinflipID = document.getElementById("new-game-id");
            coinflipID.value = String(Date.now());

        }

    }

}

socket.on('coinFlipLoader', games => {

    // "games" is going to be an array of all the cf games from the external json file

})

socket.on('newCoinFlipGame', cf => {
    allCFGames.push(cf)

    console.log(cf)

    let cfGameSidePic;
    let cfGameSideName;

    let newCFGame = document.createElement('div')

    if (cf.Heads != null) {
        cfGameSideName = "Heads";
    }

    else {
        cfGameSideName = "Tails";
    }

    newCFGame.className = "cf-game-div"

    newCFGame.innerHTML = "<div class='cf-game-user-info'><image src='" + cf.Players[0].userPic + "' alt='" + cf.Players[0].username + "'/> <h4>" + cf.Players[0].username + "</h4> <h2>" + cf.TotalValue + "</h2></div><div class='cf-game-buttons'><button onclick='viewActiveGame' class='cf-view-button'>View</button> <button class='cf-join-button' id='" + cf.GameID + "'>Join</button></div>"

    gameArea.append(newCFGame)
})

function viewActiveGame() {
    // this should show the cf game that user click on to
    // in the menu that pops up they should see the side was chosen and the skins of they deposited

}

function joinActiveGame() {

    // bring user opponent ot the deposit screen of the coinflip

}
