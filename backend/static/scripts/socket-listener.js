import * as mainHandler from "./main-handler.js";

const socket = io(window.location.origin);

socket.on("allChat", async (messages) => {
    // append message to what is there already
    try {
        mainHandler.loadAllMessages(messages);
    }

    catch (err) {
        console.log(err)
        console.log("Message was not able to be displayed");
    }

});

socket.on("singleChat", async (message) => {

    try {
        mainHandler.newMessage(message);
    }

    catch (err) {
        console.log(err);
        console.log("New message was not able to be displayed");
    }

});