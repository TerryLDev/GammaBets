const socket = io()

function sideBarToggle() {
    let sidebar = document.getElementById('sidebar');
    let mainPage = document.getElementById('main');
    let buttonLabel = document.getElementById('sidebar-button');

    if (buttonLabel.innerText == "Open Chat") {
        sidebar.style.width = "300px";
        mainPage.style.marginLeft = "300px";
        buttonLabel.innerText = "Close Chat";

    }

    else {
        sidebar.style.width = "0px";
        mainPage.style.marginLeft = "0px";
        buttonLabel.innerText = "Open Chat";
    }
}

function viewProfile () {
    return null
}

// Websocket funciton for the chat that's a work in progress
const feed = document.getElementById('chat-feed');
const messageOut = document.getElementById('chat-message-out');
const chatSend = document.getElementById('send-message');
const message = document.getElementById('message');
const user = document.getElementById('user-message-name');
const userProfile = document.getElementById('user-message-url');

chatSend.addEventListener('click', function() {
    if (message.value != "") {
        socket.emit('chat', {
            message: message.value,
            user: user.value,
            userProfile: userProfile.value
        })
    
        message.value = "";
    }

});

message.addEventListener('keydown', (event) => {
    
    if (event.code == 'Enter') {

        if (message.value != "") {
            socket.emit('chat', {
                message: message.value,
                user: user.value,
                userProfile: userProfile.value
            })
        
            message.value = "";
        }

    }
});

// Listen for messages
socket.on('chat', function(messages) {
    
    feed.innerHTML = "";

    let newMessage = document.createElement('div');
    
    messages.forEach(msg => {
        newMessage.innerHTML += '<p id="new-message"><a href=' + msg.userProfile + '><strong>' + msg.user + '</a>: </strong>' + msg.message + "</p>";
    });

    feed.appendChild(newMessage);

    feed.maxScrollTop = feed.scrollHeight - feed.offsetHeight;

    if (feed.maxScrollTop - feed.scrollTop <= feed.offsetHeight) {
        feed.scrollTop = feed.scrollHeight
  
      }
});

socket.on("connect", () => {

    const steamID = document.getElementById("user-steam-id")
    let userID = steamID.value;
    
    let data ={
        steamID: userID
    }

    socket.emit("join", data)
});

socket.on("tradeLink", (msg) => {
    console.log(msg)
})