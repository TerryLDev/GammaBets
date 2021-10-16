function openScreen() {
    document.getElementById('deposit-menu').style="width:50%";
}

function closeScreen() {
    document.getElementById('deposit-menu').style = "width:0%";
}

const steamID = document.getElementById('url-steam-id').value;
const tradeURL = document.getElementById('tradeurl').value;

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

    socket.emit('getInventory', {
        steamID : steamID,
        tradeURL : tradeURL.value
    });

});

const playerSkins = document.getElementById('player-skin-selection');

socket.on('getInventory', (data) => {
    playerSkins.innerHTML = "";

    if (data == '') {
        let skinItem = document.createElement('div');
        skinItem.innerHTML = "<p>No Tradeable Skins Found</p>"
        playerSkins.appendChild(skinItem);
    }
    
    else {
        data.forEach(item => {

            console.log(item['name'], item['id']);

            let price = item['price'] / 100;

            let skinItem = document.createElement('div');
    
            skinItem.className = 'inventory-item';
    
            skinItem.innerHTML = "<input type='checkbox' class='inventory-item' id='" + item['id'] + "' /><label for=" + item['id'] + "><img src='" + item['imageURL'] + "' alt='" + item['name'] + "'><p>" + item['name'] + "</p><p>" + "Price: $" + price + "</p></label>";

            playerSkins.appendChild(skinItem);
        });
    }
});

const depositSkins = document.getElementById('deposit-skins');

depositSkins.addEventListener('click', function() {
    // This is checking all the skins that are being selected and sending a request to the server to deposit the skins in either a jackpot game or a coinflip game

    let fullSkinList = playerSkins.childNodes;
    let selectedSkinIDs = []

    for(let skin in fullSkinList) {

        let checkIt = fullSkinList[skin].childNodes;
        
        try {
            if (checkIt[0]["checked"]){
                selectedSkinIDs.push(checkIt[0].id);
            }
        }

        catch(err) {
            
        }
    }

    if (selectedSkinIDs == ''){
        console.log('No Skins Selected')
    }

    else {
        socket.emit('makeJackpotDeposit', {
            user: steamID,
            skins: selectedSkinIDs,
            tradeURL: tradeURL,
        });
    }

});

// Build a function that gets all the prices for the skins in their inventory
// also when the select the skins update the value they are putting in and amount of skins they are depositing