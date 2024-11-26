const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEYBOARD_LETTERS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["↵", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];
let WORDS = [];
let solution;
let guesses;
let currentGuess;
let gameOver;
let startTime;
let score;

// Sonidos
const correctSound = new Audio(
  "./win.wav"
);
const gameOverSound = new Audio(
  "./lose.wav"  
);

function loadWords() {
  fetch("./words.json")
    .then((response) => response.json())
    .then((data) => {
      WORDS = data;
      initializeGame();
    })
    .catch((error) => console.error("Error al cargar el archivo JSON:", error));
}

function initializeGame() {
  solution = WORDS[Math.floor(Math.random() * WORDS.length)];
  guesses = Array(MAX_GUESSES).fill("");
  currentGuess = "";
  gameOver = false;
  startTime = Date.now();
  score = 0;

  createGameBoard();
  createKeyboard();
  updateGameBoard();
}

function createGameBoard() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  for (let i = 0; i < MAX_GUESSES; i++) {
    const row = document.createElement("div");
    row.className = "word-row";
    for (let j = 0; j < WORD_LENGTH; j++) {
      const letterBox = document.createElement("div");
      letterBox.className = "letter-box animate__animated";
      row.appendChild(letterBox);
    }
    gameBoard.appendChild(row);
  }
}

function createKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  KEYBOARD_LETTERS.forEach((row) => {
    const keyboardRow = document.createElement("div");
    keyboardRow.className = "keyboard-row";
    row.forEach((letter) => {
      const key = document.createElement("button");
      key.className = "key animate__animated";
      key.textContent = letter;
      key.addEventListener("click", () => handleKeyPress(letter));
      if (letter === "↵" || letter === "⌫") {
        key.classList.add("wide");
      }
      keyboardRow.appendChild(key);
    });
    keyboard.appendChild(keyboardRow);
  });
}

function updateGameBoard() {
  const rows = document.querySelectorAll(".word-row");
  for (let i = 0; i < MAX_GUESSES; i++) {
    const row = rows[i];
    const guess = guesses[i];
    const letterBoxes = row.querySelectorAll(".letter-box");
    for (let j = 0; j < WORD_LENGTH; j++) {
      const letterBox = letterBoxes[j];
      letterBox.textContent = guess[j] || "";
      letterBox.className = "letter-box animate__animated";
      if (guess[j]) {
        setTimeout(() => {
          if (guess[j] === solution[j]) {
            letterBox.classList.add("correct", "animate__flipInX");
          } else if (solution.includes(guess[j])) {
            letterBox.classList.add("present", "animate__flipInX");
          } else {
            letterBox.classList.add("absent", "animate__flipInX");
          }
        }, j * 100);
      }
    }
  }
  updateKeyboard();
}

function updateKeyboard() {
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    const letter = key.textContent;
    if (letter.length === 1) {
      if (guesses.some((guess) => guess.includes(letter))) {
        if (solution.includes(letter)) {
          if (
            guesses.some((guess) =>
              guess
                .split("")
                .some(
                  (char, index) => char === letter && solution[index] === letter
                )
            )
          ) {
            key.classList.add("correct", "animate__pulse");
          } else {
            key.classList.add("present", "animate__pulse");
          }
        } else {
          key.classList.add("absent", "animate__pulse");
        }
      }
    }
  });
}

function handleKeyPress(key) {
  if (gameOver) return;

  if (key === "ENTER") {
    if (currentGuess.length === WORD_LENGTH) {
      makeGuess();
    }
  } else if (key === "⌫") {
    currentGuess = currentGuess.slice(0, -1);
  } else if (currentGuess.length < WORD_LENGTH) {
    currentGuess += key;
  }

  updateCurrentGuess();
}

// Actualizar la adivinanza actual
function updateCurrentGuess() {
  const currentRow =
    document.querySelectorAll(".word-row")[
      guesses.findIndex((val) => val === "")
    ];
  const letterBoxes = currentRow.querySelectorAll(".letter-box");
  for (let i = 0; i < WORD_LENGTH; i++) {
    letterBoxes[i].textContent = currentGuess[i] || "";
    if (currentGuess[i]) {
      letterBoxes[i].classList.add("animate__pulse");
    } else {
      letterBoxes[i].classList.remove("animate__pulse");
    }
  }
}

// Realizar una adivinanza
function makeGuess() {
  if (!WORDS.includes(currentGuess)) {
    showInvalidWordAlert();
    return;
  }

  const currentIndex = guesses.findIndex((val) => val === "");
  guesses[currentIndex] = currentGuess;
  currentGuess = "";

  updateGameBoard();

  if (guesses[currentIndex] === solution) {
    gameOver = true;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    score = calculateScore(currentIndex + 1, timeTaken);
    correctSound.play();
    showWinAlert(score, solution);
  } else if (currentIndex === MAX_GUESSES - 1) {
    gameOver = true;
    gameOverSound.play();
    showLoseAlert(solution);
  }
}

// Calcular puntuación
function calculateScore(attempts, time) {
  const baseScore = 1000;
  const timeDeduction = Math.floor(time / 10);
  const attemptsDeduction = (attempts - 1) * 100;
  return Math.max(baseScore - timeDeduction - attemptsDeduction, 0);
}

// Mostrar alerta de palabra no válida
function showInvalidWordAlert() {
  //play sound
  gameOverSound.play()

  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = "Palabra no válida";
  errorMessage.style.display = "block"; // Muestra el mensaje
  errorMessage.classList.add("error"); // Agrega la clase si usas CSS
  errorMessage.classList.add("animate__animated");
  errorMessage.classList.add("animate__fadeIn");

  // Ocultar el mensaje después de unos segundos (opcional)
  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 3000); // Se oculta después de 3 segundos
}

// Mostrar alerta de victoria
function showWinAlert(score, word) {
  Swal.fire({
    title: "¡Ganaste!",
    html: `
            <p>Has adivinado la palabra: <strong>${word}</strong></p>
            <p>Tu puntuación: <strong>${score}</strong></p>
        `,
    icon: "success",
    allowEnterKey: false,
    confirmButtonText: "Jugar de nuevo",
  }).then((result) => {
    if (result.isConfirmed) {
      initializeGame();
    }
  });
}

// Mostrar alerta de derrota
function showLoseAlert(word) {
  Swal.fire({
    title: "Juego terminado",
    html: `La palabra correcta era: <strong>${word}</strong>`,
    icon: "error",
    allowEnterKey: false,
    confirmButtonText: "Intentar de nuevo",
  }).then((result) => {
    if (result.isConfirmed) {
      initializeGame();
    }
  });
}
// Eventos de teclado
document.addEventListener("keydown", (event) => {
  let key = event.key.toUpperCase(); // Convierte a mayúsculas para manejar uniformidad
  if (key === "BACKSPACE") key = "⌫"; // Mapea 'Backspace' a '⌫'
  if (key === "ENTER") key = "ENTER"; // Asegura que 'Enter' sea tratado correctamente

  if (
    key === "ENTER" ||
    key === "⌫" ||
    (key.length === 1 && key.match(/[A-ZÑ]/))
  ) {
    handleKeyPress(key);
  }
});

// Iniciar juego
loadWords();
