// Beginwaarden voor het spel
let batteryLevel = 100; // Startbatterij op 100%
const decreaseRate = 0.5; // Batterijverlies per seconde
let correctCodes = []; // Array met correcte codes (geladen uit JSON)
let foundCodes = 0; // Teller voor correct ingevoerde codes
let gameInterval; // Interval voor batterijverlies

// Verwijzingen naar HTML-elementen
const progressFill = document.getElementById("progress-fill"); // Laadbalk
const codeInput = document.getElementById("code-input");       // Invoer veld
const submitButton = document.getElementById("submit-button");// Invoeren knop
const message = document.getElementById("message");           // Feedback bericht
const batteryPercentage = document.getElementById("battery-percentage"); // Batterijpercentage

// Update de weergave van de batterijstatus
function updateBatteryDisplay() {
    progressFill.style.width = `${batteryLevel}%`; // Update breedte laadbalk
    batteryPercentage.textContent = `${Math.round(batteryLevel)}%`; // Update percentage tekst
    if (batteryLevel <= 0) {
        endGame(false); // Eindig het spel als batterij leeg is
    }
}

// Start het proces van batterijverlies
function startBatteryDrain() {
    gameInterval = setInterval(() => {
        batteryLevel -= decreaseRate; // Verlaag batterij met `decreaseRate`
        if (batteryLevel <= 0) {
            batteryLevel = 0; // Voorkom dat batterij onder 0 gaat
            clearInterval(gameInterval); // Stop interval
        }
        updateBatteryDisplay(); // Werk de laadbalk bij
    }, 1000); // Elke seconde uitvoeren
}

// Controleer of de ingevoerde code correct is
function checkCode() {
    const enteredCode = codeInput.value.trim(); // Ingevoerde code zonder spaties
    if (correctCodes.includes(enteredCode)) { // Is de code correct?
        if (!correctCodes.includes("USED-" + enteredCode)) { // Is de code al gebruikt?
            foundCodes++; // Verhoog teller voor correcte codes
            if (foundCodes === correctCodes.length) {
                endGame(true); // Win het spel als alle codes zijn ingevoerd
            } else {
                batteryLevel = Math.min(100, batteryLevel + 20); // Voeg 20% batterij toe (max 100%)
                correctCodes[correctCodes.indexOf(enteredCode)] = "USED-" + enteredCode; // Markeer als gebruikt
                message.textContent = "Correcte code! Batterij opgeladen."; // Feedback
            }
        } else {
            message.textContent = "Deze code is al gebruikt."; // Feedback voor hergebruikte code
        }
    } else {
        message.textContent = "Onjuiste code, probeer opnieuw."; // Feedback voor foute code
    }
    codeInput.value = ""; // Wis het invoerveld
    updateBatteryDisplay(); // Werk batterijstatus bij
}

// Eindig het spel met winst of verlies
function endGame(won) {
    clearInterval(gameInterval); // Stop batterijverlies
    const endMessage = document.createElement("div"); // Maak een nieuw bericht
    endMessage.style.textAlign = "center";
    endMessage.style.fontSize = "24px";
    endMessage.style.fontWeight = "bold";
    endMessage.textContent = won
        ? `Gefeliciteerd! Je hebt gewonnen met ${Math.round(batteryLevel)}% batterij over.`
        : "GAME OVER. Je batterij is leeg.";
    document.body.innerHTML = ""; // Wis de huidige pagina
    document.body.appendChild(endMessage); // Toon alleen het eindbericht
}

// Laad de correcte codes uit een JSON-bestand
function loadCodes() {
    fetch('codes/codes.json') // Haal het JSON-bestand op
        .then(response => {
            if (!response.ok) {
                throw new Error("Kan codes.json niet laden");
            }
            return response.json(); // Converteer de response naar JSON
        })
        .then(data => {
            correctCodes = data.codes; // Sla de codes op
            startGame(); // Start het spel na het laden van de codes
        })
        .catch(error => {
            console.error("Fout bij laden van codes:", error);
            message.textContent = "Er is een fout opgetreden bij het laden van de codes.";
        });
}

// Start het spel (wordt pas uitgevoerd na het laden van de codes)
function startGame() {
    updateBatteryDisplay(); // Toon initiële batterijstatus
    startBatteryDrain(); // Start batterijverlies
}

// Eventlistener voor de knop om codes te controleren
submitButton.addEventListener("click", checkCode);

// Laad de codes en begin het spel
loadCodes();
