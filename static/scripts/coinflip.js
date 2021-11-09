const coinflipMenu = document.getElementById('coinflip-menu');
const sideSelect = document.getElementById('side-select');
const cfDepoScreen = document.getElementById('cf-skin-selection');

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
    document.getElementById('new-game-id').remove();

}

function closeMenu() {
    coinflipMenu.classList.remove('show-menu');
    document.getElementById('new-game-id').remove;
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

