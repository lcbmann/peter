const words = ['hangman', 'car', 'programming', 'basketball', 'cooking']
let chosenWord;
let guessedLetters;
let guessesLeft; 

function startGame() {
    const useRandomWord = document.getElementById('useRandomWord').checked;
    if(useRandomWord) {
        chosenWord = words[Math.floor(Math.random() * words.length)];
    } else {
        chosenWord = document.getElementById('userWord').value.trim().toLowerCase();
    }
    
    guessedLetters = [];
    guessesLeft = 5; 
    updateWordContainer(); 
    updateGuessesLeft();
    updateLetters();
}

function updateWordContainer() {
    const wordContainer = document.getElementById('wordContainer');
    wordContainer.innerHTML = chosenWord
        .split('')
        .map(letter => guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
    if(guessedLetters.length > 0 && !wordContainer.innerHTML.includes('_')) {
        setTimeout(() => alert('You win!'), 100);
    }
}

function updateGuessesLeft() {
    document.getElementById('guesses').textContent = guessesLeft;
    if(guessesLeft === 0) {
        setTimeout(() => alert(`Game Over! The word was ${chosenWord}`), 100);
    }
}

function updateLetters() {
    const lettersContainer = document.getElementById('letters');
    lettersContainer.innerHTML = 'abcdefghijklmnopqrstuvwxyz'
        .split('')
        .map(letter => `<button onclick="guess('${letter}')">${letter}</button>`)
        .join(' ');
}

function guess(letter) {
    if(!guessedLetters.includes(letter)) {
        guessedLetters.push(letter);
        if(!chosenWord.includes(letter)) {
            guessesLeft--;
        }
        updateWordContainer();
        updateGuessesLeft();
    }
}

function checkInput(event) {
    const input = event.key.toLowerCase();
    const isInputField = event.target.id === 'userWord';
    if (!isInputField && /^[a-z]$/.test(input)) {
        guess(input);
    }
}

document.addEventListener('keydown', checkInput);

startGame();
