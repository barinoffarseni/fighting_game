const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"]
  }
});
const Timer = require('./timer.js').Timer;

class Fighter {
  constructor({ position, velocity }) {
    this.health = 100
    this.width = 50
    this.height = 150
    this.position = position
    this.velocity = velocity
    this.canJump = false
  }

  // +y это вниз
  // -y это вверх

  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // если пользователь коснулся пола - возращаем возможность прыгать
    if (this.position.y + this.height >= 576 - 96) {
      this.velocity.y = 0
      this.position.y = 576 - 96 - this.height
      this.canJump = true
      // если пользователь НЕ на полу, то прибавляем ускорение вниз и убираем возможность прыгать
    } else {
      this.velocity.y += gravity
      this.canJump = false
    }
  }
}

const users = []
const gameObjects = [];
const gravity = 0.2
let gameOver = false
let winner = ''
let gameTimer = null
let samurai = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  }
})
let ninja = new Fighter({
  position: {
    x: 512,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  }
})

const sockets = []
setInterval(() => {
  if (gameTimer !== null) {
    sockets.forEach(socket => {
      socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining - 1, timeOut: gameTimer.timeOut });
      socket.emit('set-position', { samuraiPosition: samurai.position, ninjaPosition: ninja.position });
    })

    if (gameTimer.timeRemaining == 1) {
      if (ninja.health > samurai.health) {
        winner = 'Player 2'
        gameOver = true
      }
      if (samurai.health > ninja.health) {
        winner = 'Player 1'
        gameOver = true
      }
      if (ninja.health == samurai.health) {
        gameTimer.timeRemaining += 9
        gameTimer.timeOut = false
      }
      sockets.forEach(socket => {
        socket.emit('game-over', { gameOver: gameOver, winner: winner });
      })
    }
  }

  gameObjects.forEach(gameObject => {
    gameObject.update()
  })
}, 50)

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  let type = 'samurai'
  sockets.push(socket)
  gameObjects.push(samurai)

  const id = socket.handshake.issued

  socket.emit('set-position', { samuraiPosition: samurai.position, ninjaPosition: ninja.position })

  if (users.length > 0) {
    if ('samurai' == users[users.length - 1].type) {
      type = 'ninja'
      gameObjects.push(samurai)
      gameObjects.push(ninja)
    }
  }

  socket.on('take-hit', (data) => {
    if (data == 'ninja') {
      ninja.health -= 10
    } else {
      samurai.health -= 10
    }

    if (samurai.health == 0) {
      winner = 'Player 2'
      gameOver = true

      socket.emit('game-over', { gameOver: gameOver, winner: winner })
    }

    if (ninja.health == 0) {
      winner = 'Player 1'
      gameOver = true

      socket.emit('game-over', { gameOver: gameOver, winner: winner })
    }

    socket.emit('set-health', { ninjaHealth: ninja.health, samuraiHealth: samurai.health });
  });

  if (users.length > 2) {
    return
  }

  users.push({ type: type, id: id })

  io.emit('set-data', { type: type, id: id, ninjaHealth: ninja.health, samuraiHealth: samurai.health });
  if (users.length == 2) {
    gameTimer = new Timer();
    gameObjects.push(gameTimer)
  }

  socket.on('disconnect', () => {
    console.log('Disconnect:', socket.id);
    const index = users.findIndex(user => user.id == id);

    if (index > -1) {
      users.splice(index, 1);
    }
  });

  socket.on('key-down', (keyName) => {
    socket.broadcast.emit('key-down', keyName);
  });

  socket.on('key-up', (keyName) => {
    socket.broadcast.emit('key-up', keyName);
  });

  socket.on('set-velocity', (data) => {
    if (data.playerType == 'samurai') {
      samurai.velocity.x = data.x
      // если пользователь хочет прыгнуть, проверяется эта возможность
      if (data.y < 0 && samurai.canJump) {
        samurai.velocity.y = data.y
      }
    } else {
      ninja.velocity.x = data.x
      if (data.y < 0 && ninja.canJump) {
        ninja.velocity.y = data.y
      }
    }
    // console.log(ninja.velocity.y, samurai.velocity.y)
  });
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});