const minigame = document.getElementById('minigame');
const gridContainer = document.getElementById('grid-container');
const progressBar = document.querySelector('.maintimer');
const scrambleBar = document.querySelector('.scrambletimer');
const digitalDisplay = document.querySelector('.text');
let numRows;
let numCols;
let gridSize;
let maxWrong;
let gameDuration;
let shuffleInterval;
let endTime = 0;
let currentNumber = 1;
let totalWrong = 0;
let gameEnded = true;
let wrongTableEntries = {};

let gameTimerInterval;
let shuffleTimerInterval;

let gameRemainingTime = gameDuration;
let shuffleRemainingTime = shuffleInterval;


function handleGridItemClick(event) {
    if (gameEnded) return;
    if (gameRemainingTime > 0 && totalWrong < maxWrong) {
        const clickedItem = event.target;
        const clickedNumber = parseInt(clickedItem.textContent);

        if (clickedItem.style.backgroundColor === 'green') {
            return;
        }

        if (clickedNumber === currentNumber) {
            clickedItem.style.backgroundColor = 'green';
            currentNumber++;

            if (currentNumber > numCols * numCols) {
                digitalDisplay.innerHTML = 'SUCCESS!';
                digitalDisplay.style.color = 'green';
                endGame();
            }
        } else {
            totalWrong++;
            wrongTableEntries[clickedNumber] = true;
            clickedItem.style.backgroundColor = 'red';

            if (totalWrong >= maxWrong) {
                digitalDisplay.innerHTML = 'FAILED!';
                digitalDisplay.style.color = 'red';
                endGame();
            }
        }
    }
}

function randomized(length) {
    let orderedArray = [];
    let randomizedArray = [];

    for (let i = 0; i < length; i++) {
        orderedArray[i] = i + 1;
    }

    for (let i = 0; i < length; i++) {
        let indexNumber = Math.floor(Math.random() * orderedArray.length);
        randomizedArray[i] = orderedArray[indexNumber];
        orderedArray.splice(indexNumber, 1);
    }
    return randomizedArray;
}

function updateProgressBar() {
    const gameProgress = 100 - (gameRemainingTime / gameDuration) * 100;
    progressBar.style.background = `linear-gradient(90deg, green ${100 - gameProgress}%, red ${100 - gameProgress}%)`;
    const shuffleProgress = 100 - (shuffleRemainingTime / shuffleInterval) * 100;
    scrambleBar.style.background = `linear-gradient(90deg, green ${100 - shuffleProgress}%, red ${100 - shuffleProgress}%)`;
    
    // Change the color to orange if progress is less than 50%
    if (gameProgress > 50) {
        progressBar.style.background = `linear-gradient(90deg, orange ${100 - gameProgress}%, red ${100 - gameProgress}%)`;
    }
    if (shuffleProgress > 50) {
        scrambleBar.style.background = `linear-gradient(90deg, orange ${100 - shuffleProgress}%, red ${100 - shuffleProgress}%)`;
    }
}

function createGrid() {
    gridContainer.innerHTML = '';
    let grid = randomized(gridSize);
    for (let i = 0; i < gridSize; i++) {
        let currentIndex = grid[i]
        const numpad = document.createElement('div');
        if (wrongTableEntries[currentIndex] == true) {
            numpad.style.backgroundColor = 'red';
        }
        if (currentNumber > currentIndex) {
            numpad.style.backgroundColor = 'green';
        }
        gridContainer.style.gridTemplateColumns = 'repeat(' + numCols + ', 1fr)';
        numpad.className = 'numpad';
        numpad.textContent = currentIndex;
        gridContainer.appendChild(numpad);

        numpad.addEventListener('click', handleGridItemClick);
    }
}

function startGameTimer() {
    gameTimerInterval = setInterval(() => {
        gameRemainingTime--;
        if (gameRemainingTime <= 0 || totalWrong >= maxWrong) {
            clearInterval(gameTimerInterval);
            clearInterval(shuffleTimerInterval);
            endGame();
        }
        updateProgressBar();
    }, 10);
}

function startShuffleTimer() {
    shuffleTimerInterval = setInterval(() => {
        if (shuffleRemainingTime <= 0) {
            createGrid();
            shuffleRemainingTime = shuffleInterval;
        }
        shuffleRemainingTime--;
        updateProgressBar();
    }, 10);
}

function resetProgressBars() {
    gameRemainingTime = gameDuration;
    shuffleRemainingTime = shuffleInterval;
    updateProgressBar();
}

const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

async function startGame() {
    wrongTableEntries = {};
    currentNumber = 1;
    totalWrong = 0;
    gameEnded = true;
    minigame.style.display = 'flex';
    digitalDisplay.innerHTML = "Initialization";
    digitalDisplay.style.color = 'red';
    progressBar.style.background = 'red';
    scrambleBar.style.background = 'red';
    createGrid();
    await sleep(1000);
    for (let i = 3; i >= 1; i--) {
        digitalDisplay.innerHTML = i.toString();
        await sleep(1000)
    }
    gameEnded = false;
    digitalDisplay.innerHTML = 'Security System Armed';
    startGameTimer();
    startShuffleTimer();
    resetProgressBars();
}

function endGame() {
    var success = false;
    if (currentNumber > numCols * numCols) {
        digitalDisplay.innerHTML = 'UNLOCKED!';
        digitalDisplay.style.color = 'green';
        progressBar.style.background = 'green';
        scrambleBar.style.background = 'green';
        success = true;
    } else {
        digitalDisplay.innerHTML = 'LOCKED!';
        digitalDisplay.style.color = 'red';
        progressBar.style.background = 'red';
        scrambleBar.style.background = 'red';
    }
    gameEnded = true;
    
    setTimeout(function(){
        minigame.style.display = 'none';
        fetch('http://Cujion-NumberUp/CujionNumberUpResults', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "success": success })
        });
    }, 2000);   

    if (gameEnded) {
        clearInterval(gameTimerInterval);
        clearInterval(shuffleTimerInterval);
    }
}

window.addEventListener("message", function(event){
    if (event.data.action == "Start") {
        numRows = event.data.rows;
        numCols = event.data.cols;
        gridSize = numRows * numCols;
        maxWrong = event.data.wrong;
        gameDuration = event.data.duration * 100;
        shuffleInterval = event.data.shuffle * 100;
        startGame();
    }
})


