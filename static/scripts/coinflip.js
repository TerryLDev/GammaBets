const coinflipMenu = document.getElementById('coinflip-menu');
const sideSelect = document.getElementById('side-select');

function openFirstMenu() {
    coinflipMenu.className = "show-menu";
    sideSelect.className = 'show-menu';
}

function closeMenu() {
    coinflipMenu.classList.remove('show-menu');
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