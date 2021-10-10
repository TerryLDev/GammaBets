function openScreen() {
    document.getElementById('deposit-menu').style="width:50%";
}

function closeScreen() {
    document.getElementById('deposit-menu').style = "width:0%";
}

function addTradeURL() {
    let tradeURL = document.getElementById('tradeurl');
    let steamID = document.getElementById('url-steam-id').value;

    if (tradeURL.value != "") {

        socket.emit('addTradeURL', {
            trade : tradeURL.value,
            steamID : steamID
        });
    }

    window.location.reload()
}

// Add the users trade url
socket.on('addTradeURL', function(msg) {
    console.log(msg);
});

// send a request to tthe server ot pull the user's inventory 
const showDepositButton = document.getElementById('show-deposit-button');

showDepositButton.addEventListener('click', function() {

    console.log('pressed');

    const steamID = document.getElementById('url-steam-id').value;
    const tradeURL = document.getElementById('tradeurl');

    socket.emit('getInventory', {
        steamID : steamID,
        tradeURL : tradeURL.value
    });

});


const deposit = document.getElementById('despoit-submit');
const jackpotItem = document.getElementById('')

const test = document.getElementById('tester');

socket.on('getInventory', (data) => {
    console.log(data);
    const playerSkins = document.getElementById('player-skin-selection');

    playerSkins.innerHTML = "";

    data.forEach(item => {

        console.log(item['name'], item['id']);

        let skinItem = document.createElement('div');
        skinItem.className = 'inventory-item';

        skinItem.innerHTML = "<input type='checkbox' class='inventory-item' id='" + item['id'] + "' /><label for=" + item['id'] + "><img src='https://community.cloudflare.steamstatic.com/economy/image/" + item['icon_url'] + "' alt='" + item['name'] + "'><p>" + item['name'] + "</p><p>" + "Price:" + "</p></label>";

        playerSkins.appendChild(skinItem);
    });
});

socket.on('jackpot', (data) => {

});