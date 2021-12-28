const socket = io();

// user info
const username = document.getElementById("user-steam-username").value;
const profilePictureURL = document.getElementById("user-profile-picture-url").value;
const profileURL = document.getElementById("user-profile-url").value;
// need username, profile url, profile picture url, the message, and time

// Websocket funciton for the chat that's a work in progress
const feed = document.getElementById("chat-feed");
const chatSend = document.getElementById("send-message");
const message = document.getElementById("message");

chatSend.addEventListener("click", function () {
    if (message.value != "") {

        if (localStorage.SteamID != undefined) {

            sendMessage(localStorage.Username, localStorage.ProfileURL, localStorage.ProfilePictureURL, message.value);
        }
    }

    message.value = "";
});

message.addEventListener("keydown", (event) => {
    if (event.code == "Enter") {

        if (message.value != "") {

            if (localStorage.SteamID != undefined) {
                
                sendMessage(localStorage.Username, localStorage.ProfileURL, localStorage.ProfilePictureURL, message.value);

            }
        }

        message.value = "";
    }
});

function sendMessage(username, profileURL, profilePictureURL, userMessage) {
    socket.emit("chat", {
        username: username,
        profileURL: profileURL,
        profilePictureURL: profilePictureURL,
        message: userMessage,
    });
}

// Listen for messages
socket.on("chat", function (messages) {
    // append message to what is there already

    feed.innerHTML = "";

    messages.forEach((message) => {
        let newMessage = document.createElement("div");
        newMessage.className = "chat-message";

        let userImg = document.createElement("img");
        userImg.src = message.profilePictureURL;
        userImg.className = "chat-message-img";

        newMessage.appendChild(userImg);

        let messageResponse = document.createElement("div");
        messageResponse.className = "chat-message-response";

        let messageSenderInfo = document.createElement("div");
        messageSenderInfo.className = "chat-message-sender-info";

        let linkToUser = document.createElement("a");
        linkToUser.href = message.profileURL;

        let username = document.createElement("h3");
        username.className = "chat-message-sender-name";
        username.textContent = message.username;

        linkToUser.appendChild(username);
        messageSenderInfo.appendChild(linkToUser);
        messageResponse.appendChild(messageSenderInfo);

        let messageText = document.createElement("p");
        messageText.textContent = message.message;

        messageResponse.appendChild(messageText);

        newMessage.appendChild(messageResponse);

        feed.appendChild(newMessage);
    });

    feed.maxScrollTop = feed.scrollHeight - feed.offsetHeight;

    if (feed.maxScrollTop - feed.scrollTop <= feed.offsetHeight) {
        feed.scrollTop = feed.scrollHeight;
    }
});

// set local storage and set socket room
socket.on("connect", () => {
    const steamID = document.getElementById("user-steam-id");
    let userID = steamID.value;

    if (userID != undefined || userID != null) {

        // get tradeURL
        if (document.getElementById("user-trade-url").value != "" || document.getElementById("user-trade-url").value != undefined) {
            localStorage.setItem("TradeURL", document.getElementById("user-trade-url").value);
        }

        // set user data
        localStorage.setItem("SteamID", userID);
        localStorage.setItem("Username", username);
        localStorage.setItem("ProfilePictureURL", profilePictureURL);
        localStorage.setItem("ProfileURL", profileURL);

        let data = {
            steamID: userID,
        };
    
        socket.emit("join", data);

        document.getElementById("user-data").remove();

    }
});

socket.on("tradeLink", (msg) => {
    console.log(msg);
});
