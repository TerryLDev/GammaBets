import * as mainHandler from "./main-handler.js";

const inputMessage = document.getElementById("chat-message-input");
const messageSendButton = document.getElementById("send-message-button");

const socket = io(window.location.origin);

// Welcome menu, grabbing resources, checking if signed in
document.addEventListener("DOMContentLoaded", () => {

    setSelectedPage();

})

window.onload = function() {

    let url = window.location.origin + "/user.json";

    fetch(url)
    .then(response => {
        response.json().then(json => {

            mainHandler.addPlayer(json);

        })
        .catch(err => {
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
    });

}

inputMessage.addEventListener("keydown", (event) => {

    if (event.code == "Enter") {

        if (localStorage.userFound == "true") {

            if (inputMessage.value != "") {
                
                mainHandler.sendMessage(inputMessage.value);
                inputMessage.value = "";

            }

        }

        else {
            alert("Please Login to use the chat");
            inputMessage.value = "";
        }
    }

});

messageSendButton.addEventListener("click", (event) => {

    if (localStorage.userFound == "true") {

        if (inputMessage.value != "") {
            
            mainHandler.sendMessage(inputMessage.value);
            inputMessage.value = "";

        }

    }

    else {
        alert("Please Login to use the chat");
        inputMessage.value = "";
    }

});

function setSelectedPage() {
    
    let pathName = window.location.pathname;

    if (pathName == "/coinflip") {

        const aJP = document.getElementById("jp-top-nav");
        const aCF = document.getElementById("cf-top-nav");

        // fuck me
        // jp first
        aJP.classList.remove("selected-page");
        aJP.classList.add("unselected-page");

        const aJPImg = aJP.children[0];

        aJPImg.classList.remove("selected-icon")
        aJPImg.classList.add("unselected-icon");

        // cf next
        aCF.classList.remove("unselected-page");
        aCF.classList.add("selected-page");

        const aCFImg = aCF.children[0];

        aCFImg.classList.remove("unselected-icon");
        aCFImg.classList.add("selected-icon");
    }

}