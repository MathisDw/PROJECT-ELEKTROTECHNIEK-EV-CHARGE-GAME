const startPage = document.getElementById("start-page");
const gameContainer = document.getElementById("game-container");
const scoreContainer = document.getElementById("score-container");
const startGameButton = document.getElementById("start-game-button");
const restartGameButton = document.getElementById("restart-game-button");
const progressFill = document.getElementById("progress-fill");
const batteryPercentage = document.getElementById("battery-percentage");
const questionText = document.getElementById("question");
const answerInput = document.getElementById("answer-input");
const submitAnswerButton = document.getElementById("submit-answer-button");
const quizMessage = document.getElementById("quiz-message");
const toggleMapButton = document.getElementById("toggle-map-button");
const mapContainer = document.getElementById("map-container");
const mapOverlay = document.getElementById("map-overlay");
const closeMapButton = document.getElementById("close-map-button");

// Game variables
let batteryLevel = 100;  // Start with full battery
const decreaseRate = 1;  // Battery drain rate per second
let questions = [];
let currentQuestionIndex = 0;
let gameInterval;

// Load questions from JSON
function loadQuestions() {
    fetch('data/questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data.questions.slice(0, 10); // Zorgt ervoor dat er maximaal 10 vragen worden geladen
            if (questions.length < 10) {
                console.error("Er moeten minstens 10 vragen in de JSON staan.");
                quizMessage.textContent = "Er zijn niet genoeg vragen beschikbaar. Voeg meer toe.";
                return;
            }

            startGameButton.addEventListener("click", startGame);
            restartGameButton.addEventListener("click", startGame);
            submitAnswerButton.addEventListener("click", checkAnswer);
            toggleMapButton.addEventListener("click", showMap);
            closeMapButton.addEventListener("click", hideMap);
            mapOverlay.addEventListener("click", hideMap);
        })
        .catch(error => {
            console.error("Error loading questions:", error);
            quizMessage.textContent = "Error loading questions. Please try again.";
        });
}

// Start the game
function startGame() {
    startPage.style.display = "none";
    gameContainer.style.display = "block";
    scoreContainer.style.display = "none";
    batteryLevel = 100;
    currentQuestionIndex = 0;
    updateBatteryDisplay();
    startBatteryDrain();
    displayQuestion();
}

// Update battery display
function updateBatteryDisplay() {
    progressFill.style.width = `${batteryLevel}%`;
    batteryPercentage.textContent = `${Math.round(batteryLevel)}%`;
    if (batteryLevel <= 0) {
        endGame(false);
    }
}

// Start battery drain
function startBatteryDrain() {
    gameInterval = setInterval(() => {
        batteryLevel -= decreaseRate;
        if (batteryLevel <= 0) {
            batteryLevel = 0;
            clearInterval(gameInterval);
        }
        updateBatteryDisplay();
    }, 1000);
}

// Display quiz question
function displayQuestion() {
    if (currentQuestionIndex >= 10) {
        endGame(true);
        return;
    }
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    answerInput.value = "";
    answerInput.focus();
}

// Check quiz answer
function checkAnswer() {
    const userAnswer = answerInput.value.trim();
    const currentQuestion = questions[currentQuestionIndex];

    if (userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
        batteryLevel = Math.min(100, batteryLevel + 20);
        currentQuestionIndex++;
        if (currentQuestionIndex < 10) {
            displayQuestion();
        } else {
            endGame(true);
        }
        quizMessage.textContent = "Correct answer! Battery charged.";
    } else {
        batteryLevel -= 15;
        if (batteryLevel < 0) batteryLevel = 0;
        quizMessage.textContent = "Wrong answer! Try again.";
        if (batteryLevel <= 0) {
            endGame(false);
        }
    }
    updateBatteryDisplay();
}

// End the game
function endGame(won) {
    clearInterval(gameInterval);
    gameContainer.style.display = "none";
    scoreContainer.style.display = "block";
    const scoreText = document.getElementById("score");
    scoreText.innerHTML = `
        <p>${won ? "Congratulations! You won!" : "Game Over! You lost."}</p>
        <p>Final Battery Level: ${Math.round(batteryLevel)}%</p>
        <p>Questions Answered: ${currentQuestionIndex} / 10</p>
    `;
}

// Show and hide map
function showMap() {
    mapContainer.style.display = "block";
    mapOverlay.style.display = "block";
}

function hideMap() {
    mapContainer.style.display = "none";
    mapOverlay.style.display = "none";
}

// Initialize the game
loadQuestions();
