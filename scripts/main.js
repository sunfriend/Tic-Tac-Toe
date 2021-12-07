const clickAudioSound = new Audio("../Sounds/simple_click.wav");
const buttonClickSound = new Audio("../Sounds/click.wav");
const messageSound = new Audio("../Sounds/message.wav");
const gameMusic = new Audio("../Sounds/game_music.wav");
const numbersOnlyRegex = /\d+/g;
const idGenerator = {};
idGenerator.uniqueId = (function() {
    let counter = -1;
    return function(prefix) {
        counter++;
        return (prefix || "") + "-" + counter;
    };
}());

let opponentSelection = "Computer";
const radioOpponentSelection = document.querySelectorAll("input[name='opponent-selection']");
const radioSymbolSelection = document.querySelectorAll("input[name='sign-selection']");
const beginChallangeButton = document.querySelector("[start-game-button]");
const startGameForm = document.querySelector("[start-game-form]");
const gameBoardContainer = document.querySelector("[gameboard-data]");
const playerNameLabel = document.querySelector("[player-name-data]");
const opponentNameLabel = document.querySelector("[opponent-name-data]");
const playersScore = document.querySelectorAll("[player-score-data]");
const summaryWindow = document.querySelector("[game-over-data]");

let player = {};
let OPPONENT = {};
let gamePlayers = [];

radioOpponentSelection.forEach(radio => radio.addEventListener("change", displayOpponentNameInput, false));
beginChallangeButton.addEventListener("click", init);
radioSymbolSelection.forEach(radio => radio.addEventListener("click", function() {buttonClickSound.play()}));

function createPlayers() {
    const playerName = document.querySelector("[player-name]").value || "Player";
    const opponentName = document.querySelector("[opponent-name]").value || opponentSelection;
    const opponentType = (opponentSelection === "Player-2") ? "player" : "computer";
    const playerSymbol = document.querySelector("input[name='sign-selection']:checked").value;
    const opponentSymbol= document.querySelector("input[name='sign-selection']:not(:checked)").value;

    player = playerFactory(playerName, playerSymbol);
    OPPONENT = playerFactory(opponentName, opponentSymbol, opponentType);

    gamePlayers.push(player);
    gamePlayers.push(OPPONENT);
}

const playerFactory = (name, symbol, type="player") => {
    const _name = name;
    const _symbol = symbol;
    const _type = type;
    let _score = 0;

    const getName = () => _name;
    const getSymbol = () => _symbol;
    const getType = () => _type;
    
    const increaseScore = () => {_score++};
    const getScore = () => _score;

    return {getName, getSymbol, getType, increaseScore, getScore};
};

function displayOpponentNameInput(event) {
    buttonClickSound.play();
    let secondPlayerName = document.querySelector("[opponent-name]");
    secondPlayerName.value = "";
    if (event.target.value === "Player-2") {
        secondPlayerName.style.opacity = 1;
        secondPlayerName.style.visibility = "visible";
        secondPlayerName.style.position = "relative";
        opponentSelection = "Player-2";
    }
    else {
        secondPlayerName.style.opacity = 0;
        secondPlayerName.style.visibility = "hidden";
        secondPlayerName.style.position = "absolute";
        opponentSelection = "Computer";
    }
}

function init() {
    buttonClickSound.play();
    createPlayers();
    document.querySelector("[start-game-form]").style.animationName = "scale-out";
    setTimeout(hideElement, 1000, document.querySelector("[start-game-form]"));
    setTimeout(showElement, 1000, document.querySelector(".game-container"));
    document.querySelector(".game-container").style.animationName = "scale-in";
    createPlayground();
}



function createPlayground() {
    console.log();
    playerNameLabel.innerText = `(${player.getSymbol()})-${player.getName()}: `;
    opponentNameLabel.innerText = `(${OPPONENT.getSymbol()})-${OPPONENT.getName()}: `;
    createGameboard();
}

const Gameset = (() => {
    const _COMBOS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let _activePlayer = 0;

    const switchTurn = () => 
        _activePlayer = _activePlayer === 0 ? 1 : 0;

    const isWinner = (activePlayerSymbol) => {
        let arr = Gameboard.getAllValues();
        for (let i = 0; i < _COMBOS.length; i++) {
            let won = true;
            for (let j = 0; j < _COMBOS[i].length; j++) {
                won = arr[_COMBOS[i][j]] === activePlayerSymbol && won;
            }
            if(won) {
                return true;
            }
        }
        return false;
    };

    const isDraw = () => {
        let arr = Gameboard.getAllValues();
        return arr.every(block => block !== null);
    };

    const getActivePlayer = () => _activePlayer;

    return {switchTurn, isWinner, isDraw, getActivePlayer};
})();

const Gameboard = (() => {
    const _gameboard = [null, null, null, null, null, null, null, null, null];
    
    const getSize = () => _gameboard.length;

    const setValue = (index, playerSymbol) => {
        if (index !== null){
            _gameboard[index] = playerSymbol;
        }
    }
    
    const clear = () => {
        for (let i = 0; i < _gameboard.length; i++) {
            _gameboard[i] = null;
        }
    };

    const getAllValues = () => _gameboard;

    return {getSize, clear, setValue, getAllValues};
})();



function blockClicked(event) {
    //get active player
    clickAudioSound.play();
    const activePlayer = gamePlayers[Gameset.getActivePlayer()];
    const playerSymbol = activePlayer.getSymbol();
    Gameboard.setValue(getClickedBlockIndex(event), playerSymbol);
    gameBoardContainer.querySelector(`#grid-${getClickedBlockIndex(event)}`).innerText = playerSymbol;
    //Check if winner
    if (Gameset.isWinner(playerSymbol)) {
        clearGameboard();
        //increase score of the winner
        activePlayer.increaseScore();
        //display winners score
        playersScore[Gameset.getActivePlayer()].innerText = activePlayer.getScore();
        //show round summary window
        displayRoundSummary(activePlayer, playerSymbol);
        return;
    }
    //Check if tie
    if (Gameset.isDraw()) {
        clearGameboard();
        //Show round summary window
        displayRoundSummary();
        return;
    }  
    //Switch turn if winner and tie are false
    Gameset.switchTurn(Gameset.isDraw());
}

function getClickedBlockIndex(element) {
    return Number(element.target.id.match(numbersOnlyRegex));
}

function createGameboard() {
    gameMusic.play();
    for (let i = 0; i < Gameboard.getSize(); i++) {
        const div = document.createElement("div");
        div.id = idGenerator.uniqueId("grid");
        div.classList.add("grid-block");
        div.addEventListener("click", blockClicked, {once : true});
        gameBoardContainer.appendChild(div);
    }
}
function hideElement(element) {
    element.style.display = "none";
}
function showElement(element) {
    element.style.display = "block";
}

function clearGameboard() {
        let gameboard = gameBoardContainer.children;
        for (let i = 0; i < gameboard.length; i++) {
            gameboard[i].innerText = null;
            gameboard[i].addEventListener("click", blockClicked, {once : true});
        }
        Gameboard.clear();
}

function displayRoundSummary(player, symbol) {
    messageSound.play();
    summaryWindow.classList.add("display-summary");
    summaryWindow.querySelector(".summary-content").style.opacity = 1;
    summaryWindow.querySelector(".summary-content").style.visibility = "visible";
    if (player) {
        summaryWindow.querySelector("h2").innerText = `${player.getName()} won round!`;
        summaryWindow.querySelector("img").src = symbol === "X" ? "../img/X.png" : "../img/O.png"
    }
    else {
        summaryWindow.querySelector("h2").innerText = "Yep, it's a tie :)";
        summaryWindow.querySelector("img").src = "../img/tie.png";
    }
}