const viewBackground = document.getElementById("view-menu-background");
const allViews = document.getElementById('all-cf-views');

export function openViewMenu() {
    
    try {

    }

    catch(err) {

    }
}


// build deposit screen
export function joinGame(){

    console.log('working');

}

viewBackground.addEventListener("click", (event) => {
    viewBackground.classList.add("display-none");

    checkForOpenView();
    
})

function checkForOpenView() {
    let getMenus = allViews.querySelectorAll(".view-menu");

    for (let i = 0; i < getMenus.length; i++) {
        if (getMenus[i].classList.contains('display-none') == false) {
            getMenus[i].classList.add('display-none');
            getMenus[i].classList.remove('show-selected-view-menu');
        }
    }
}

export async function updateTimer(game) {

    document.querySelector(`[data-view-id="${game.gameID}"]`).getElementsByClassName('view-middle-section')[0].firstElementChild.textContent = "Waiting for Player... " + game.timer;

}

// remove join butotn on listing and view menu
export async function removeJoinButton(game) {
    
    let targetListing = document.getElementById(game.gameID).querySelector('.join-button')

    let targetView = document.querySelector(`[data-view-id="${game.gameID}"]`).querySelector('.view-join-button')

    if (targetListing.classList.contains("display-none") == false){
        targetListing.classList.add('display-none');
    }

    if (targetView.classList.contains("display-none") == false) {
        targetView.classList.add('display-none');
    }
}

export async function showCFDepositScreen() {

    

}