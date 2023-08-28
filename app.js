const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const filePath = './data.json';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const players = [];


app.get('/', (req, res) => {
  res.send('Hello, this is the homepage!');
});

app.post('/play', (req, res) => {
  const playerId = req.body.playerId;
  const player = players.find((p) => p.id === playerId);

  if (!player) {
    res.status(400).json({ message: 'Player not found.' });
    return;
  }

  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const guess = parseInt(req.body.guess);
  const sum = dice1 + dice2;
  const result = sum === guess ? 'You win!' : 'You lose!';

  const balanceChange = result === 'You win!' ? 7 : -1;
  player.balance += balanceChange;

  res.json({
    dice1,
    dice2,
    sum,
    result,
    balanceChange,
    balance: player.balance,
  });
});

app.post('/newplayer', (req, res) => {
  const playerName = req.body.name;
  const playerId = generatePlayerId();
  players.push({ id: playerId, name: playerName, balance: 50 });

  res.json({ playerId });
});

function generatePlayerId() {
  return Date.now().toString(36) + Math.random().toString(36);
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
