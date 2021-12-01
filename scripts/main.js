const GAME_BOARD_SIZE = 9;
let idGenerator = {};
const startGameButton = document.querySelector("[start-game-button]");
const radioOpponentSelection = document.querySelectorAll("input[name='opponent-selection']");

startGameButton.addEventListener("click", getUserInput);
radioOpponentSelection.forEach(radio => radio.addEventListener("change", displayOpponentNameInput, false));

idGenerator.uniqueId = (function() {
    let counter = -1;
    return function(prefix) {
        counter++;
        return (prefix || "") + "-" + counter;
    };
}());

function displayOpponentNameInput(event) {
    let secondPlayerName = document.querySelector("[user2-name-data]");
    secondPlayerName.value = "";
    if (event.target.value === "player") {
        secondPlayerName.style.opacity = 1;
        secondPlayerName.style.visibility = "visible";
        secondPlayerName.style.position = "relative";
    }
    else {
        secondPlayerName.style.opacity = 0;
        secondPlayerName.style.visibility = "hidden";
        secondPlayerName.style.position = "absolute";
    }
}

const PlayersInfo =
    () => {
        const _userName = document.querySelector("[user-name-data]").value || "Player";
        const _opponentName = document.querySelector("[user2-name-data]").value || "Computer";
        const _opponentSelection = document.querySelector("input[name='opponent-selection']:checked").value;
        const _playerSign = document.querySelector("input[name='sign-selection']:checked").value;
        
        const getUserName = () => _userName;
        const getOpponentName = () => _opponentName;
        const getPlayerSign = () => _playerSign;
        
        return {getUserName, getOpponentName, getPlayerSign};
    };

function getUserInput() {
    const players = PlayersInfo();
    console.log(players.getOpponentName());
    document.querySelector("[start-game-form]").style.animationName = "scale-out";
    setTimeout(hideElement, 1000, document.querySelector("[start-game-form]"));
    setTimeout(showElement, 1000, document.querySelector(".game-container"));
    createGameBoard();
}

function createGameBoard() {
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        const div = document.createElement("div");
        div.id = idGenerator.uniqueId("grid");
        div.classList.add("grid-block");
        div.addEventListener("click", blockClicked, false);
        document.querySelector("[game-board-data]").appendChild(div);
    }
}

function blockClicked(event) {
    console.log(event.target.id);
    event.target.innerText = "X";
}

function hideElement(element) {
    element.style.display = "none";
}

function showElement(element) {
    element.style.display = "block";
}
