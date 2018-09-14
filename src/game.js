import $ from 'jquery';
import uuid from 'uuid/v4';
import coinview from '@coinjinja/coinview-sdk';

coinview.init('dbDGwDGQ')

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const grid = 16;

const baseFrameRate = 60;
let speed = 10;

const snake = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
};
const apple = {
  x: 320,
  y: 320,
};

let lastFrameTime = Date.now();
let count = 0;
let totalFrame = 0;
let frameRate = 60;
let running = false;
let score = 0;
let direction = '';

// TODO: fetch from server
let life = 3;

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
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // draw snake
  context.fillStyle = 'green';
  snake.cells.forEach(function(cell, index) {
    context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // snake ate apple
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells += 1;
      score += 1
      $('#score').text(score);

      // Increase game speed
      if (speed > 10) {
        speed -= 1;
      }

      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
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
  running = false;
  score = 0;
  if (life > 0) {
    life -= 1
  }

  $('#score').text(0);
  $('#life').text(life);

  $('#gameover').show();

  snake.x = 160;
  snake.y = 160;
  snake.cells = [];
  snake.maxCells = 4;
  snake.dx = grid;
  snake.dy = 0;

  apple.x = getRandomInt(0, 25) * grid;
  apple.y = getRandomInt(0, 25) * grid;

  direction = ''
}

$('body').ready(() => {
  FastClick.attach(document.body);

  $('.button').on('touchstart', function() {
    if (life > 0) {
      running = true;
      $('#gameover').hide()
    } else {
      console.log('payment')
      const traceId = uuid()
      coinview.payment.create({
        traceId,
        assetId: '3d356f2b-a886-3693-bd2b-04c447ce2399',
        amount: 10,
        memo: 'SNAKE_DEMO_BUY_LIFE',
        description: 'Buy 3 lifes in game',
      }).then(res => {
        const { traceId: traceIdRes, memo } = res
        if (traceId === traceIdRes && memo === 'SNAKE_DEMO_BUY_LIFE') {
          life += 3;
          $('#life').text(life);
        }
      })
      return
    }

    const type = $(this).attr('id');
    if (type === 'up' && direction !== 'down') {
      snake.dy = -grid;
      snake.dx = 0;
    } else if (type === 'down' && direction !== 'up') {
      snake.dy = grid;
      snake.dx = 0;
    } else if (type === 'left' && direction !== 'right') {
      snake.dx = -grid;
      snake.dy = 0;
    } else if (type === 'right' && direction !== 'left') {
      snake.dx = grid;
      snake.dy = 0;
    } else {
      return;
    }
    direction = type;
  });
});

document.addEventListener('keydown', function(e) {
  // prevent snake from backtracking on itself
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  } else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  } else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  } else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

requestAnimationFrame(loop);
