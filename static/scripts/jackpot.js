const playerBets = document.getElementById('player-bets');

socket.on('jackpotSpinner', (data) => {

});

socket.on('jackpotDeposit', (data) => {
    playerBets.innerHTML = '<p>' + data + '</p>'
});