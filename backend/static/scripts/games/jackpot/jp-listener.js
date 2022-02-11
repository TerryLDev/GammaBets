import * as jpHandler from "./jp-handler.js";

const socket = io(window.location.origin);

socket.on("newHighStakesPot", async data => {

    try {

        jpHandler.newPot(await data);

    }

    catch(err) {

        console.log(err);

    }

});

socket.on("newHighStakesPlayer", async data => {

    try {

        jpHandler.newPlayer(await data);

    }

    catch(err) {

        console.log(err);

    }

});


socket.on("startHighStakesTimer", data => {

    jpHandler.setCurrentJPTIme(data.Time)

    jpHandler.startTimer();

});