const coinflipMenu = document.getElementById('coinflip-menu');
const sideSelect = document.getElementById('side-select');

function openFirstMenu() {
    coinflipMenu.className = "show-menu";
    sideSelect.className = 'show-menu';
}

function closeMenu() {
    coinflipMenu.classList.remove('show-menu');
}
