import $ from 'jquery';
import uuid from 'uuid/v4';
import coinview from '@coinjinja/coinview-sdk';

coinview.init('7Jqg3qm2');

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 30;

const baseFrameRate = 60;
let speed = 15;

const snake = {
  x: 300,
  y: 300,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
};
const apple = {
  x: getRandomInt(0, 23) * grid,
  y: getRandomInt(0, 27) * grid,
};

let lastFrameTime = Date.now();
let count = 0;
let totalFrame = 0;
let frameRate = 60;
let running = true;
let isGameover = false;
let score = 0;
let direction = 'right';

// TODO: fetch from server
let life = parseInt(localStorage.getItem('life') || '3', 10);
$('#life').text(life);
if (life === 0) {
  running = false
}

const eat = document.createElement('audio');
eat.preload = 'auto';
eat.src = 'sounds/eat.mp3';

function playEat() {
  eat.pause();
  eat.currentTime = 0;
  eat.play();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// game loop
function loop() {
  requestAnimationFrame(loop);

  // Caculate frame rate and adjust game speed
  const now = Date.now();
  count += 1;
  totalFrame += 1;

  const duration = (now - lastFrameTime) / 1000;
  if (duration >= 1) {
    frameRate = count / duration;
    lastFrameTime = now;
    count = 0;
    console.log('frame rate:', frameRate);
  }

  const rate = baseFrameRate / frameRate;
  const tureSpeed = Math.floor(speed * rate);

  if (totalFrame < tureSpeed) {
    return;
  }
  totalFrame = 0;

  if (!running) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({ x: snake.x, y: snake.y });

  // remove cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // draw apple
  context.fillStyle = 'black';
  context.lineWidth = 2;
  context.strokeRect(apple.x, apple.y, grid, grid);
  context.fillRect(apple.x + 6, apple.y + 6, 18, 18);

  // draw snake
  snake.cells.forEach(function(cell, index) {
    context.strokeRect(cell.x, cell.y, grid, grid);
    context.fillRect(cell.x + 6, cell.y + 6, 18, 18);

    // snake ate apple
    if (cell.x === apple.x && cell.y === apple.y) {
      playEat();
      snake.maxCells += 1;
      score += 100;
      $('#score').text(score);

      // Increase game speed
      if (speed > 10) {
        speed -= 1;
      }

      apple.x = getRandomInt(0, 23) * grid;
      apple.y = getRandomInt(0, 27) * grid;
    }

    // check collision with all cells after this one (modified bubble sort)
    for (var i = index + 1; i < snake.cells.length; i++) {
      // collision. reset game
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        gameOver();
      }
    }
  });
  // Hit wall
  if (
    snake.x < 0 ||
    snake.x > canvas.width - grid ||
    snake.y < 0 ||
    snake.y > canvas.height - grid
  ) {
    gameOver();
  }
}

function gameOver() {
  $('#gameover').show();
  isGameover = true;
  running = false;
  if (life > 0) {
    life -= 1;
  }
  localStorage.setItem('life', `${life}`);

  $('#score').text(0);
  $('#life').text(life);
}

function resetGame() {
  $('#gameover').hide();
  isGameover = false;
  snake.x = 150;
  snake.y = 150;
  snake.cells = [];
  snake.maxCells = 4;
  snake.dx = grid;
  snake.dy = 0;

  speed = 15;
  score = 0;

  apple.x = getRandomInt(0, 23) * grid;
  apple.y = getRandomInt(0, 27) * grid;

  direction = 'right';
  running = true;
}

$('#quit').on('click', () => coinview.navigate.close());

$('body').ready(() => {
  FastClick.attach(document.body);

  $('.button').on('touchstart', function() {
    const type = $(this).attr('id');
    if (life === 0) {
      if (type === 'no') {
        coinview.navigate.close();
      }
      console.log('payment');
      const traceId = uuid();
      coinview.payment
        .create({
          traceId,
          assetId: '3d356f2b-a886-3693-bd2b-04c447ce2399',
          amount: 10,
          memo: 'SNAKE_DEMO_BUY_LIFE',
          description: 'Buy 3 lifes in game',
        })
        .then((res) => {
          const { traceId: traceIdRes, memo } = res;
          if (traceId === traceIdRes && memo === 'SNAKE_DEMO_BUY_LIFE') {
            life += 3;
            localStorage.setItem('life', `${life}`);
            $('#life').text(life);
          }
        });
      return;
    }

    if (type === 'up' && direction !== 'down' && !isGameover) {
      snake.dy = -grid;
      snake.dx = 0;
    } else if (type === 'down' && direction !== 'up' && !isGameover) {
      snake.dy = grid;
      snake.dx = 0;
    } else if (type === 'left' && direction !== 'right' && !isGameover) {
      snake.dx = -grid;
      snake.dy = 0;
    } else if (type === 'right' && direction !== 'left' && !isGameover) {
      snake.dx = grid;
      snake.dy = 0;
    } else if (type === 'restart') {
      resetGame();
    } else if (type === 'yes' && isGameover) {
      resetGame();
    } else if (type === 'no' && isGameover) {
      coinview.navigate.close();
    } else {
      return;
    }
    direction = type;
  });
});

requestAnimationFrame(loop);
