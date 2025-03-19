document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameGrid = document.getElementById('game-grid');
    const movesElement = document.getElementById('moves');
    const timeElement = document.getElementById('time');
    const scoreElement = document.getElementById('score');
    const newGameButton = document.getElementById('new-game');
    const difficultySelect = document.getElementById('difficulty-select');
    const winModal = document.getElementById('win-modal');
    const finalTimeElement = document.getElementById('final-time');
    const finalMovesElement = document.getElementById('final-moves');
    const finalScoreElement = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again');

    // Game state variables
    let cards = [];
    let moves = 0;
    let score = 0;
    let matchedPairs = 0;
    let totalPairs = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let timer = null;
    let seconds = 0;
    let gameStarted = false;

    // Card icons (using emoji for simplicity)
    const icons = [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧',
        '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
        '🦄', '🐝', '🐛', '🦋', '🐌', '🐚', '🐞', '🐜',
        '🕷', '🦂', '🦀', '🦑', '🐙', '🦐', '🐠', '🐟',
        '🐡', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆',
        '🦓', '🦍', '🐘', '🦏', '🐪', '🐫', '🦒', '🦘'
    ];

    // Game configuration based on difficulty
    const gameConfig = {
        easy: { rows: 4, cols: 4 },
        medium: { rows: 4, cols: 6 },
        hard: { rows: 6, cols: 6 }
    };

    // Initialize the game
    function initGame() {
        resetGame();
        const difficulty = difficultySelect.value;
        const { rows, cols } = gameConfig[difficulty];
        totalPairs = (rows * cols) / 2;

        // Update grid CSS
        gameGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Create card pairs
        const cardIcons = [];
        for (let i = 0; i < totalPairs; i++) {
            const icon = icons[i];
            cardIcons.push(icon, icon); // Push each icon twice for pairs
        }

        // Shuffle cards
        shuffleArray(cardIcons);

        // Create and append cards to the grid
        gameGrid.innerHTML = '';
        for (let i = 0; i < cardIcons.length; i++) {
            createCard(cardIcons[i], i);
        }

        // Update cards array
        cards = document.querySelectorAll('.card');
    }

    // Create a single card
    function createCard(icon, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.dataset.index = index;

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const iconElement = document.createElement('div');
        iconElement.classList.add('card-icon');
        iconElement.textContent = icon;

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');

        cardFront.appendChild(iconElement);
        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', flipCard);
        gameGrid.appendChild(card);
    }

    // Handle card flipping
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;

        // Increment moves
        moves++;
        movesElement.textContent = moves;

        // Check for match
        checkForMatch();
    }

    // Check if the two flipped cards match
    function checkForMatch() {
        const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

        if (isMatch) {
            disableCards();
            matchedPairs++;
            updateScore(true);

            // Check if all pairs are matched
            if (matchedPairs === totalPairs) {
                setTimeout(() => {
                    endGame();
                }, 500);
            }
        } else {
            unflipCards();
            updateScore(false);
        }
    }

    // Disable matched cards
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
    }

    // Unflip unmatched cards
    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    // Reset board after a turn
    function resetBoard() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }

    // Start the timer
    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Update the score
    function updateScore(isMatch) {
        // Score calculation
        // Matching gives 10 points
        // Mismatching subtracts 1 point
        // Score cannot go below 0
        if (isMatch) {
            score += 10;
        } else {
            score = Math.max(0, score - 1);
        }

        scoreElement.textContent = score;
    }

    // End the game and show the modal
    function endGame() {
        clearInterval(timer);

        // Calculate final score based on time and moves
        // Formula: base score + time bonus + move efficiency
        const timeBonus = Math.max(0, 100 - Math.floor(seconds / 10));
        const moveEfficiency = Math.max(0, 100 - Math.floor((moves - totalPairs) * 2));
        const finalScore = score + timeBonus + moveEfficiency;

        // Update modal
        finalTimeElement.textContent = timeElement.textContent;
        finalMovesElement.textContent = moves;
        finalScoreElement.textContent = finalScore;

        // Show modal
        winModal.style.display = 'flex';
    }

    // Reset game state
    function resetGame() {
        clearInterval(timer);
        gameGrid.innerHTML = '';
        moves = 0;
        score = 0;
        matchedPairs = 0;
        gameStarted = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        seconds = 0;

        movesElement.textContent = '0';
        timeElement.textContent = '00:00';
        scoreElement.textContent = '0';

        winModal.style.display = 'none';
    }

    // Shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Event listeners
    newGameButton.addEventListener('click', initGame);
    difficultySelect.addEventListener('change', initGame);
    playAgainButton.addEventListener('click', initGame);

    // Initialize the game on load
    initGame();
});