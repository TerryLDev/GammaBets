const playerBetsSection = document.getElementById('player-bets');
const potinfo = document.getElementById('total-pot-value');

let waitingForSpinner = false;

socket.on('jackpotCountDown', (time) => {
    // this is a prototype for now
    let spinner = document.getElementById('spinner');
    spinner.innerHTML = '<p>' + time + '</p>';

    if (time == 0) {
        waitingForSpinner = true;
    }

})

socket.on('jackpotDepositDeclined', (data) => {
    console.log(data);
});

socket.on('jackpotLoader',(data) => {

    let count = 1;

    data.Players.forEach(player => {

        let chance = getPlayerChance(data.TotalPotValue, player.skinValues);

        let playerTotal = getPlayerTotal(player.skinValues);

        let newBet = document.createElement('div');
        newBet.className = 'jackpot-bet';

        let playerInfo = document.createElement('div');
        playerInfo.className = 'player-bet-info'

        let chanceID = "player" + count;

        playerInfo.innerHTML = "<h4>" + player.username + "</h4><p>$" + playerTotal + "</p><p id='" + chanceID + "'>" + chance + "%</p>"

        newBet.appendChild(playerInfo)

        for (let i = 0; i < player.skins.length; i++) {

            let skinSpot = document.createElement('div');
            skinSpot.className = 'skin-spot';

            let value = getSkinValue(player.skinValues[i]);
    
            skinSpot.innerHTML = "<img src='" + player.skinPictures[i] + "' alt=" + player.skins[i] + "/><ps>" + player.skins[i] + "</ps><p>$" + value + "</p>"
    
            newBet.appendChild(skinSpot);
        }
    
        playerBetsSection.insertBefore(newBet, playerBetsSection.firstChild);

        count++;
    })

    changeAllJackpotValues(data);
});

function getPlayerChance(potTotal, skinVals) {

    let chance = 0;
    let playerTotal = (skinVals.reduce((p, c) => p + c));
    chance = (playerTotal / potTotal)*100; 
    chance = Math.round((chance + Number.EPSILON)* 100) / 100;

    return chance
}

function getPlayerTotal(skinVals) {
    let playerTotal = (skinVals.reduce((p, c) => p + c))/100;

    playerTotal = Math.round((playerTotal + Number.EPSILON)* 100) / 100;

    return playerTotal
}

function getSkinValue(skinVal) {

    skinVal = (Math.round((skinVal + Number.EPSILON)) / 100).toFixed(2);

    return skinVal

}

function changeAllJackpotValues(game) {
    
    let count = 0;
    let allPlayers = playerBetsSection.childNodes;

    game.Players.forEach(player => {

        let chanceID = document.getElementById(allPlayers[count].childNodes[0].childNodes[2].id)

        let chancePercent = getPlayerChance(game.TotalPotValue, player.skinValues);

        chanceID.innerText = chancePercent+"%"

        count++;
    })

    let totalPotVal = ((game.TotalPotValue + Number.EPSILON) / 100).toFixed(2);

    potinfo.innerText = "$" + totalPotVal;
}