import * as jpHandler from "./jp-handler.js";
import { canMakeInventoryRequest } from "../../main-handler.js";

const socket = io(window.location.origin);

document.addEventListener("DOMContentLoaded", () => {

    let url;

    if (window.location.pathname == "/") {

        url = window.location.origin + "/highstakes/pot.json";

    }

    else if (window.location.pathname == "/lowstakes") {

        // setup for lowstakes
        url = window.location.origin + "/highstakes/pot.json";

    }

    fetch(url)
    .then(response => {
        response.json().then(json => {

            jpHandler.loadPot(JSON.parse(json));

        })
        .catch(err => {
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
    });

});

document.getElementById("jp-deposit").addEventListener("click", (event) => {

    const depositContainer = document.getElementById("deposit-container");
    const popupBackground = document.getElementById("popup-background");

    popupBackground.style.display = "";
    popupBackground.classList.add("fade-background");

    // show deposit menu
    depositContainer.style.display = "";
    depositContainer.classList.add("show-deposit-menu");

    // add an event listener
    popupBackground.addEventListener("click", (event) => {

        popupBackground.style.display = "none";
        popupBackground.classList.remove("fade-background");

        depositContainer.style.display = "none";
        depositContainer.classList.remove("show-deposit-menu");

        document.getElementById("player-inventory").innerHTML = "";
        document.getElementById("num-of-skins-selected").textContent = "0";
        document.getElementById('deposit-total').textContent = "0.00";

        const emptyList = [];
        localStorage.setItem("SkinsToDeposit", JSON.stringify(emptyList))

    });

    // emit a socket event to get player's invetory
    const data = {
        SteamID: localStorage.SteamID
    }

    if (canMakeInventoryRequest(Date.now())) {

        socket.emit("getInventory", data);

    }

    else {
        console.log("Error");
    }

});

socket.on("getInventory", (inv) => {

    const playerInventory = document.getElementById("player-inventory");

    console.log(inv);

    inv.forEach((item) => {

        let skinDiv = document.createElement("div");
        skinDiv.className = "skin-slot";

        let price = item.price.toFixed(2);

        let inputCheckBox = document.createElement("input");
        inputCheckBox.className = "skin-input";
        inputCheckBox.type = "checkbox";
        inputCheckBox.value = item.id;
        inputCheckBox.id = item.id;
        inputCheckBox.name = item.id;

        inputCheckBox.addEventListener("click", (Element) => {

            let checkInput = Element.path[0];

            if (checkInput.checked) {

                // selecting skin
                let findLabel = checkInput.nextElementSibling;
                let labelChildren = findLabel.children;
                let price = parseFloat(labelChildren[2].textContent.split("$")[1]);

                let listOfSelectedSkins = JSON.parse(localStorage.getItem("SkinsToDeposit"));

                listOfSelectedSkins.push(checkInput.value);

                let newEntry = JSON.stringify(listOfSelectedSkins);

                localStorage.setItem("SkinsToDeposit", newEntry);

            }

            else {

                // deselecting skins
                let findLabel = checkInput.nextElementSibling;
                let labelChildren = findLabel.children;
                let price = parseFloat(labelChildren[2].textContent.split("$")[1]);

                let listOfSelectedSkins = JSON.parse(localStorage.getItem("SkinsToDeposit"));

                const getIndex = listOfSelectedSkins.indexOf(checkInput.value);
                listOfSelectedSkins.splice(getIndex, 1);

                let newEntry = JSON.stringify(listOfSelectedSkins);

                localStorage.setItem("SkinsToDeposit", newEntry);

            }

        });

        let label = document.createElement("label");
        label.setAttribute("for", item.id);
        label.className = "inventory-skin-slot-label";

        let skinImg = document.createElement("img");
        skinImg.className = "inventory-skin-slot-img";
        skinImg.src = item.imageURL;
        skinImg.alt = item.name;

        let skinName = document.createElement("p");
        skinName.className = "inventory-skin-slot-name";
        skinName.textContent = item.name;

        let skinPrice = document.createElement("p");
        skinPrice.className = "inventory-skin-slot-price";
        skinPrice.textContent = "$" + price;

        label.appendChild(skinImg);
        label.appendChild(skinName);
        label.appendChild(skinPrice);

        playerInventory.appendChild(inputCheckBox);
        playerInventory.appendChild(label);

    });

});