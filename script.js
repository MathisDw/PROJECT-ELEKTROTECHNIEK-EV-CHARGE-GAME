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
let batteryLevel = 100;
const decreaseRate = 1;
let questions = [];
let currentQuestionIndex = 0;
let gameInterval;

// Load questions from JSON
function loadQuestions() {
    fetch('data/questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data.questions.slice(0, 8);
            if (questions.length < 8) {
                console.error("Er moeten minstens 8 vragen in de JSON staan.");
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
    if (currentQuestionIndex >= 8) {
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
        if (currentQuestionIndex < 7) {
            batteryLevel = Math.min(100, batteryLevel + 20);
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < 8) {
            displayQuestion();
        } else {
            endGame(true);
        }

        quizMessage.textContent = "Correct antwoord! " + (currentQuestionIndex < 8 ? "Batterij opgeladen." : "");
    } else {
        batteryLevel -= 15;
        if (batteryLevel < 0) batteryLevel = 0;
        quizMessage.textContent = "Fout antwoord! Probeer opnieuw.";
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
    scoreContainer.innerHTML = ""; // Reset content

    // Voeg titel toe
    const title = document.createElement("h2");
    title.textContent = won ? "Proficiat! Je hebt gewonnen!" : "Game Over! Jammer.";
    title.style.fontSize = "24px";
    title.style.fontWeight = "bold";
    title.style.textAlign = "center";
    scoreContainer.appendChild(title);

    // Voeg score-info toe
    const scoreInfo = document.createElement("p");
    scoreInfo.innerHTML = `
        <p>Batterij score: ${Math.round(batteryLevel)}%</p>
        <p>Aantal vragen opgelost: ${currentQuestionIndex} / 8</p>
    `;
    scoreInfo.style.textAlign = "center";
    scoreContainer.appendChild(scoreInfo);

    // Verwijder vorige QR-code of tekst als deze al bestaat
    document.getElementById("qr-code")?.remove();
    document.getElementById("qr-text")?.remove();

    if (won) {
        // Voeg tekst toe
        const qrText = document.createElement("p");
        qrText.id = "qr-text";
        qrText.textContent = "Toon je QR-code om naar de racesimulator te gaan.";
        qrText.style.fontWeight = "bold";
        qrText.style.textAlign = "center";
        scoreContainer.appendChild(qrText);

        // Voeg QR-code toe
        const qrImage = document.createElement("img");
        qrImage.src = "images/QR-to-verify.png";
        qrImage.alt = "QR Code om te verifiëren";
        qrImage.id = "qr-code";
        qrImage.style.display = "block";
        qrImage.style.margin = "20px auto";
        scoreContainer.appendChild(qrImage);
    } else {
        // Voeg de restart-knop toe en zorg dat hij gecentreerd blijft
        restartGameButton.style.display = "block";
        restartGameButton.style.margin = "20px auto";
        scoreContainer.appendChild(restartGameButton);
    }
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
