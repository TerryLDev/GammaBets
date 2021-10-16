const playerBets = document.getElementById('player-bets');

socket.on('jackpotSpinner', (data) => {

});

socket.on('jackpotDepositAccepted', (data) => {
    playerBets.innerHTML += '<p>' + data + '</p>'
});

socket.on('jackpotDepositDeclined', (data) => {

});