const playerBets = document.getElementById('player-bets');

socket.on('jackpotCountDown', (time, ) => {
    // this is a prototype for now
    let spinner = document.getElementById('spinner');
    spinner.innerHTML = '<p>' + time + '</p>'
})

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

socket.on('jackpotLoader',(data) => {
    console.log(data);
});