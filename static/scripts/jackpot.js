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

socket.on('getInventory', (data) => {
    document.getElementById('tester').innerText = data;
});

socket.on('jackpot', (data) => {

});