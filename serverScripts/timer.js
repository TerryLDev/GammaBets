// Jackpot Timer
let jpTimer = 120;
let readyToRoll = false;
let countDown = false;

function jackpotTimer() {

    if(countDown && jpTimer > 0) {
        jpTimer -= 1;
        io.emit('jackpotCountDown', jpTimer)

        if (jpTimer == 0) {
            readyToRoll = true;
        }
    }

    else if (readyToRoll) {

        readyToRoll = false

        selectWinner.jackpotWinner(currentJPGame, (error, winner) => {
            
            if (error) return console.log(error);
            
            else {

                allUsers.forEach(user => {

                    if (user['SteamID'] == winner) {

                        selectWinner.takeJackpotProfit(currentJPGame, user, skins, (data, err) => {

                            if(err) console.error(err);
                            
                            else {
                                jpTimer = 120;
                                countDown = false;
                            }
                        });

                    }
                })

            }
        })

    }

    else {
        io.emit('jackpotCountDown', 'Waiting for Next Jackpot Game To Start');
    }
}

const serverJPTimer = setInterval(jackpotTimer, 1000);

module.exports = {serverJPTimer, countDown};