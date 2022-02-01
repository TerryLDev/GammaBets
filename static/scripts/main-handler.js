const socket = io(window.location.href);

let feed = document.getElementById("chat-feed");

export function newMessage(message) {

    let newMessage = document.createElement("div");
    newMessage.className = "message";

    let userImg = document.createElement("img");
    userImg.src = message.profilePictureURL;
    userImg.className = "message-img";

    newMessage.appendChild(userImg);

    let messageContainer = document.createElement("div");
    messageContainer.className = "message-container";

    let username = document.createElement("h4");
    username.className = "message-user";
    username.textContent = message.username;

    let messageText = document.createElement("p");
    messageText.className = "message-text"
    messageText.textContent = message.message;

    messageContainer.appendChild(username);
    messageContainer.appendChild(messageText);

    newMessage.appendChild(messageContainer);

    feed.appendChild(newMessage);

    feed.scrollTop = feed.scrollHeight - feed.clientHeight;

}

export function loadAllMessages(messages) {

    feed.innerHTML = "";

    messages.forEach((message) => {

        let newMessage = document.createElement("div");
        newMessage.className = "message";

        let userImg = document.createElement("img");
        userImg.src = message.profilePictureURL;
        userImg.className = "message-img";

        newMessage.appendChild(userImg);

        let messageContainer = document.createElement("div");
        messageContainer.className = "message-container";

        let username = document.createElement("h4");
        username.className = "message-user";
        username.textContent = message.username;

        let messageText = document.createElement("p");
        messageText.className = "message-text"
        messageText.textContent = message.message;

        messageContainer.appendChild(username);
        messageContainer.appendChild(messageText);

        newMessage.appendChild(messageContainer);

        feed.appendChild(newMessage);

    });

    feed.scrollTop = feed.scrollHeight - feed.clientHeight;

}

export function addPlayer(json) {
    if (json.found) {

        let depostItems = JSON.stringify([]);
                
        // locally store crucial info
        localStorage.setItem("SteamID", json.data.steam["_json"].steamid);
        localStorage.setItem("Username", json.data.steam["_json"].personaname);
        localStorage.setItem("ProfilePictureURL", json.data.steam["_json"].avatarfull);
        localStorage.setItem("ProfileURL", json.data.steam["_json"].profileurl);
        localStorage.setItem("userDBInfo", json.data.user);
        localStorage.setItem("userFound", json.found);
        localStorage.setItem("LastTradeRequest", 0);
        localStorage.setItem("LastInventoryRequest", 0);
        localStorage.setItem("SkinsToDeposit", depostItems);

        // Format data to be sent to server
        const data = {steamID: localStorage.SteamID};

        socket.emit("join", data);

        // also write out a welcome menu later for quests
        
    }

    else {
        // ask if they are 21+ years or older
        alert("Please Login");
        localStorage.setItem("userFound", json.found);
    }
}

export function sendMessage(messageVal) {

    socket.emit("singleChat", {
        username: localStorage.Username,
        profileURL: localStorage.ProfileURL,
        profilePictureURL: localStorage.ProfilePictureURL,
        message: messageVal,
    });

}


export function canMakeTradeRequest(time) {

    const requestDelay = 5000;

    const differnce = time - parseFloat(localStorage.LastTradeRequest);

    if (differnce > requestDelay) {
        localStorage.LastTradeRequest = time;
        return true; 
    }

    else {
        return false;
    }
}


export function canMakeInventoryRequest(time) {

    const requestDelay = 5000;

    const differnce = time - parseFloat(localStorage.LastInventoryRequest);

    if (differnce > requestDelay) {
        localStorage.LastInventoryRequest = time;
        return true; 
    }

    else {
        return false;
    }

}

