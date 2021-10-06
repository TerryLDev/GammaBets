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

socket.on('addTradeURL', function(msg) {
    console.log(msg);
});

const deposit = document.getElementById('despoit-submit');
const jackpotItem = document.getElementById('')

socket.on('jackpot-deposit', (data) = {

});

socket.on('jackpot', (data) => {

});