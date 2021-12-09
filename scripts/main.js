const clickAudioSound = new Audio("[[/Sounds/simple_click.wav]]");
const buttonClickSound = new Audio("[[/Sounds/click.wav]]");
const messageSound = new Audio("[[/Sounds/message.wav]]");
const gameMusic = new Audio("[[/Sounds/game_music.wav]]");
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
    
    Gameset.setActivePlayer(player.getSymbol());
    
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
    playerNameLabel.innerText = `(${player.getSymbol()})-${player.getName()}: `;
    opponentNameLabel.innerText = `(${OPPONENT.getSymbol()})-${OPPONENT.getName()}: `;
    createGameboard();
    if (OPPONENT.getType() === "computer" && OPPONENT.getSymbol() === "X") {
        botTurn();
    }
}

const Gameset = (() => {
    const _COMBOS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let _activePlayer = 0;

    function switchTurn() {
        _activePlayer = _activePlayer === 0 ? 1 : 0;
    }

    function isWinner(activePlayerSymbol) {
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

    function isDraw() {
        let arr = Gameboard.getAllValues();
        return arr.every(block => block !== null);
    };
    
    const getActivePlayer = () => _activePlayer;
    const setActivePlayer = (symbol) => {symbol === "X" ? _activePlayer = 0 : _activePlayer = 1;}

    const turnCheck = (_player) => {
        let type;
        if (OPPONENT.getType() === "computer") {
            type = _player.getType() === "computer" ? 1 : 0;
        }
        else {
            type = getActivePlayer();
        }
        if(isWinner(_player.getSymbol())){ 
            clearGameboard();
            _player.increaseScore();
            playersScore[type].innerText = _player.getScore();
            displayRoundSummary(_player, _player.getSymbol());
            if (player.getSymbol() === "X"){
                _activePlayer = 0;
            }
            else {
                _activePlayer = 1;
            }
            return false;
        }
        else if (isDraw()) {
            clearGameboard();
            displayRoundSummary();
            return false;
        }
        else {
            switchTurn();
            return true;
        }
    };

    return {getActivePlayer, setActivePlayer, turnCheck};
})();

const Gameboard = (() => {
    const _gameboard = [null, null, null, null, null, null, null, null, null];
    
    const getSize = () => _gameboard.length;

    const setValue = (index, playerSymbol) => {
        if (!_gameboard[index]){
            _gameboard[index] = playerSymbol;
        }
    }
    
    const clear = () => {
        for (let i = 0; i < _gameboard.length; i++) {
            _gameboard[i] = null;
        }
    };

    const getAllValues = () => _gameboard;
    const getValue = (index) => _gameboard[index];
    const getFreeIndexes = () => {
        let indexArray = [];
        for (let i = 0; i < _gameboard.length; i++) {
            if (!_gameboard[i]) indexArray.push(i);
        }
        return indexArray;
    };

    return {getSize, clear, setValue, getAllValues, getValue, getFreeIndexes};
})();



function blockClicked(event) {
    clickAudioSound.play();
    let blockIndex = getClickedBlockIndex(event);
    let activePlayer = OPPONENT.getType() === "computer" ? 0 : Gameset.getActivePlayer();
    Gameboard.setValue(blockIndex, gamePlayers[activePlayer].getSymbol());
    gameBoardContainer.querySelector(`#grid-${getClickedBlockIndex(event)}`).innerText = Gameboard.getValue(blockIndex);
    let isOpponentTurn = Gameset.turnCheck(gamePlayers[activePlayer]);
    if (OPPONENT.getType() === "computer" && isOpponentTurn) {
        botTurn();
        Gameset.turnCheck(OPPONENT);
    }
    if (OPPONENT.getType() === "computer" && !isOpponentTurn && OPPONENT.getSymbol() === "X") {
        botTurn();
    }
}

const Bot = (() => {
    const makeTurn = (indexArray) => {
        let randomIndex = generateRandomNumber();
        return indexArray.includes(randomIndex) ? randomIndex : makeTurn(indexArray);
    };
   
    function generateRandomNumber() {
        return Math.floor(Math.random() * 9);
    }

    return {makeTurn};
})();

function botTurn() {
    let botTurn = Bot.makeTurn(Gameboard.getFreeIndexes());
    Gameboard.setValue(botTurn, OPPONENT.getSymbol());
    gameBoardContainer.querySelector(`#grid-${botTurn}`).innerText = Gameboard.getValue(botTurn);
    gameBoardContainer.querySelector(`#grid-${botTurn}`).removeEventListener("click", blockClicked);
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
        summaryWindow.querySelector("img").src = symbol === "X" ? "[[/Tic-Tac-Toe/img/X.png|X_Image]]" : "[[/Tic-Tac-Toe/img/O.png|Y_Image]]";
    }
    else {
        summaryWindow.querySelector("h2").innerText = "Yep, it's a tie :)";
        summaryWindow.querySelector("img").src = "../img/tie.png";
    }
    summaryWindow.querySelector("button").addEventListener("click", closeWindow);
    summaryWindow.querySelector("button:last-child").addEventListener("click", startNewGame);
}

function closeWindow() {
    summaryWindow.classList.remove("display-summary");
    summaryWindow.querySelector(".summary-content").style.opacity = 0;
    summaryWindow.querySelector(".summary-content").style.visibility = "hidden";
}

function startNewGame() {
    window.location.reload();
}