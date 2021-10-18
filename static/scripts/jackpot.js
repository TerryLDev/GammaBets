const playerBets = document.getElementById('player-bets');

socket.on('jackpotSpinner', (data) => {
    console.log(data);
});

socket.on('jackpotDepositAccepted', (data) => {
    let newBet = document.createElement('div');
    newBet.className = 'jackpot-bet';
    console.log(data);
});

socket.on('jackpotDepositDeclined', (data) => {
    console.log(data);
});

socket.on('activeJackpotGame',(data) => {

});