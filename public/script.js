const playBtn = document.getElementById('playBtn');
const guessInput = document.getElementById('guessInput');
const currentPlayerElement = document.getElementById('currentPlayer');
const resultElement = document.getElementById('result');
const scoresTable = document.getElementById('scoresTable');

let players = [];
let currentPlayerIndex = 0;

async function updateScoresTable() {
  scoresTable.innerHTML = '';

  // Add header row for the scores table
  const headerRow = document.createElement('tr');
  const thName = document.createElement('th');
  thName.textContent = 'Player';
  headerRow.appendChild(thName);

  const thBalance = document.createElement('th');
  thBalance.textContent = 'Balance';
  headerRow.appendChild(thBalance);

  scoresTable.appendChild(headerRow);
  
  players.forEach((player) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = player.name;
    tr.appendChild(tdName);
    
    // Loop through player's guesses to add them as cells in the table
    player.guesses.forEach((guess, index) => {
      const tdGuess = document.createElement('td');
      tdGuess.textContent = guess;
      tdGuess.classList.add('guess-cell');
      if (player.results[index] === 'You lose!' && index === player.guesses.length - 1) {
        tdGuess.classList.add('wrong-guess');
      } else if (player.results[index] === 'You win!' && index === player.guesses.length - 1) {
        tdGuess.classList.add('correct-guess');
      }
      tr.appendChild(tdGuess);
    });   

    scoresTable.appendChild(tr);
  });
  const thGuess = document.createElement('th');
  thGuess.textContent = `Gjuajtja e ${player.guesses.length + 1}`;
  headerRow.appendChild(thGuess);  
}

function switchTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  currentPlayerElement.textContent = `Current Player: ${players[currentPlayerIndex].name}`;
}

async function addNewPlayer(name) {
  try {
    const response = await fetch('/newplayer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data.playerId;
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to add new player. Please try again.');
    return null;
  }
}

async function playGame(playerId, guess) {
  try {
    const response = await fetch('/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, guess }),
    });

    if (!response.ok) {
      throw new Error('Bad Request');
    }

    const data = await response.json();
    const { dice1, dice2, sum, result, balanceChange, balance } = data;

    resultElement.textContent = `Dice 1: ${dice1}, Dice 2: ${dice2}, Sum: ${sum}, ${result}, Balance Change: ${balanceChange}, Balance: ${balance}`;
    var animate = document.createElement("img");
    animate.setAttribute("src", "rolling.gif");

    // Update the current player's guess and balance based on the response
    const currentPlayer = players[currentPlayerIndex];
    currentPlayer.guesses.push(guess);
    currentPlayer.results.push(result);
    //const dice1Element = document.getElementById('dice1').appendChild(animate);
    
    //const dice2Element = document.getElementById('dice2').appendChild(animate);
    setTimeout(() => {
      // After a short delay, remove the animation class to show the dice numbers
      
      dice1Element.textContent = dice1;
      dice2Element.textContent = dice2;
    }, 1000);
    

    // Deduct the guess value from the player's balance if it's incorrect
    if (result === 'You lose!') {
      currentPlayer.balance.length -= 7; // Deduct the guess value from the balance
    }
    if (result === 'You win!') {
      currentPlayer.balance.length += 7; //  the guess value from the balance
    }
    updateScoresTable();
  } catch (error) {
    console.error('Error:', error);
    alert('Error: Bad Request. Please try again.');
  }
}

async function startGame() {
  const player1Name = prompt('Enter Player 1 Name:');
  const player2Name = prompt('Enter Player 2 Name:');

  const player1Id = await addNewPlayer(player1Name);
  const player2Id = await addNewPlayer(player2Name);

  if (!player1Id || !player2Id) {
    alert('Failed to start the game. Please try again.');
    return;
  }

  players.push({ id: player1Id, name: player1Name, guesses: [], results: [], balance: 50 });
  players.push({ id: player2Id, name: player2Name, guesses: [], results: [], balance: 50 });

  currentPlayerElement.textContent = `Current Player: ${players[currentPlayerIndex].name}`;
 
  updateScoresTable();

  playBtn.disabled = false;
}

playBtn.addEventListener('click', async () => {
  const guess = parseInt(guessInput.value);

  if (isNaN(guess) || guess < 2 || guess > 12) {
    alert('Please enter a valid guess between 2 and 12.');
    return;
  }

  playBtn.disabled = true;
  await playGame(players[currentPlayerIndex].id, guess);

  switchTurn(); // Switch turn after each roll

  // Check if any player's balance is zero
  const isGameEnded = players.some((player) => player.balance <= 0);
  if (isGameEnded) {
    // Game Over
    const winner = players.reduce((prev, current) => (prev.balance > current.balance ? prev : current));
    const bestResult = players.reduce((prev, current) => (prev.guesses.length > current.guesses.length ? prev : current));

    alert(`Game Over!\nWinner: ${winner.name}\nBest Result: ${bestResult.guesses.length}`);
    players.forEach((player) => {
      player.guesses = [];
      player.results = [];
      player.balance = 50;
      startGame();
    });

    currentPlayerIndex = 0;
    currentPlayerElement.textContent = `Current Player: ${players[currentPlayerIndex].name}`;
    resultElement.textContent = '';

    updatePlayersList();
    updateScoresTable();
  } else {
    // Enable the button for the next player's turn
    playBtn.disabled = false;
    guessInput.value = '';
  }
});

startGame();
