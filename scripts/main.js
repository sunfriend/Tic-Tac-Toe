const GAME_BOARD_SIZE = 9;
let idGenerator = {};
const gamePlayers = [];

let firstPlayerScore = document.querySelector("[player-score-data]");
let secondPlayerScore = document.querySelector("[opponent-score-data]");
const startGameButton = document.querySelector("[start-game-button]");
const radioOpponentSelection = document.querySelectorAll("input[name='opponent-selection']");

startGameButton.addEventListener("click", startNewGame);
radioOpponentSelection.forEach(radio => radio.addEventListener("change", displayOpponentNameInput, false));

idGenerator.uniqueId = (function() {
    let counter = -1;
    return function(prefix) {
        counter++;
        return (prefix || "") + "-" + counter;
    };
}());

const playerFactory =  (name, sign) => {
    const player = {};
    player._name = name;
    player._score = 0;
    player._sign = sign;

    increaseScore = () => {
        player._score++;
    };

    getName = () => player._name;
    getSign = () => player._sign;
    getScore = () => player._score;

    return {getName, increaseScore, getSign, getScore};
}

 

function displayOpponentNameInput(event) {
    let secondPlayerName = document.querySelector("[user2-name-data]");
    secondPlayerName.value = "";
    if (event.target.value === "Player-2") {
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

function startNewGame() {
    document.querySelector("[start-game-form]").style.animationName = "scale-out";
    setTimeout(hideElement, 1000, document.querySelector("[start-game-form]"));
    setTimeout(showElement, 1000, document.querySelector(".game-container"));
    createPlayers();
    createGameBoard();
}

function createPlayers() {
    const userNameInput = document.querySelector("[user-name-data]").value || "Player";
    const opponentSelectionInput = document.querySelector("input[name='opponent-selection']:checked").value;
    const opponentNameInput = document.querySelector("[user2-name-data]").value || opponentSelectionInput;
    const playerSignInput = document.querySelector("input[name='sign-selection']:checked").value;
    const opponentSignInput = document.querySelector("input[name='sign-selection']:not(:checked)").value;

    const firstPlayer = playerFactory(userNameInput, playerSignInput);
    const opponentPlayer = playerFactory(opponentNameInput, opponentSignInput);

    document.querySelector("[player-name-data]").innerText = `(${firstPlayer.getSign()}) ${firstPlayer.getName()}: `;
    document.querySelector("[opponent-name-data]").innerText = `(${opponentPlayer.getSign()}) ${opponentPlayer.getName()}: `;
    
    gamePlayers.push(firstPlayer);
    gamePlayers.push(opponentPlayer);
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
    gamePlayers[0].increaseScore();
    firstPlayerScore.textContent = gamePlayers[0].getScore();
    console.log(gamePlayers[0].getScore(), firstPlayerScore.innerText);

    console.log(event.target.id);
    event.target.innerText = gamePlayers[0].getSign();
}

function hideElement(element) {
    element.style.display = "none";
}

function showElement(element) {
    element.style.display = "block";
}
