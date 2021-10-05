const socket = io.connect('http://localhost:5000');

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
const user = document.getElementById('user-message');

chatSend.addEventListener('click', function() {
    if (message.value != "") {
        socket.emit('chat', {
            message: message.value,
            user: user.value
        })
    
        message.value = "";
    }
});

// Listen for messages
socket.on('chat', function(messages) {
    messageOut.innerHTML = "";
    messages.forEach(msg => {
        messageOut.innerHTML += '<div id="new-message"><p><strong>' + msg.user + ':</strong> ' + msg.message + "</p></div>" 
    });
});