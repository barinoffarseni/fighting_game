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
// const WinIndicator = require('./winIndicator.js').WinIndicator;
// class WinIndicator {
//   constructor(health1, health2, timer) {
//     this.health1 = health1
//     this.health2 = health2
//     this.timer = timer
//     this.winner = ''
//     // this.tie = false
//   }

//   update() {
//     console.log(this.health2, this.health1)
//     if (this.health1 == 0) {
//       this.winner = 'Player 2'
//       gameOver = true

//       socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//     }
//     if (this.health2 == 0) {
//       this.winner = 'Player 1'
//       gameOver = true

//       socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//     }
//     if (this.timer.timeOut) {
//       if (this.health1 > this.health2) {
//         this.winner = 'Player 1'
//         gameOver = true

//         socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//       }
//       if (this.health2 > this.health1) {
//         this.winner = 'Player 2'
//         gameOver = true

//         socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//       }
//       // if (this.health2 == this.health1) {
//       //   this.timer.timeRemaining += 10
//       //   this.timer.timeOut = false
//       // }
//     }
//   }
// }

const users = []
const gameObjects = [];
let gameOver = false
let winner = false
let gameTimer = null
let ninjaHealth = 100
let samuraiHealth = 100

const sockets = []
setInterval(() => {
  if (gameTimer !== null) {
    sockets.forEach(socket => {
      socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining, timeOut: gameTimer.timeOut });
      socket.emit('game-over', { gameOver: gameOver, winner: winner })
    })

    if (gameTimer.timeOut) {
      if (ninjaHealth > samuraiHealth) {
        winner = 'Player 1'
        gameOver = true
      }
      if (samuraiHealth > ninjaHealth) {
        winner = 'Player 2'
        gameOver = true
      }
      if (ninjaHealth == samuraiHealth) {
        gameTimer.timeRemaining += 11
        gameTimer.timeOut = false
      }
    }
  }

  gameObjects.forEach(gameObject => {
    gameObject.update()
  })
}, 500)

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  let type = 'samurai'
  sockets.push(socket)

  const id = socket.handshake.issued

  if (users.length > 0) {
    if ('samurai' == users[users.length - 1].type) {
      type = 'ninja'
    }
  }

  socket.on('take-hit', (data) => {
    if (data == 'ninja') {
      ninjaHealth -= 10
    } else {
      samuraiHealth -= 10
    }

    if (samuraiHealth == 0) {
      winner = 'Player 2'
      gameOver = true

      socket.emit('game-over', { gameOver: gameOver, winner: winner })
    }
    if (samuraiHealth == 0) {
      winner = 'Player 1'
      gameOver = true

      socket.emit('game-over', { gameOver: gameOver, winner: winner })
    }

    socket.emit('set-health', { ninjaHealth, samuraiHealth });
  });

  if (users.length > 2) {
    return
  }

  users.push({ type: type, id: id })

  io.emit('set-data', { type: type, id: id, ninjaHealth: ninjaHealth, samuraiHealth: samuraiHealth });
  if (users.length == 2) {
    gameTimer = new Timer();
    gameObjects.push(gameTimer)

    // gameWinIndicator = new WinIndicator(samuraiHealth, ninjaHealth, gameTimer);
    // gameObjects.push(gameWinIndicator)
  }

  // socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: gameWinIndicator.winner })
  // console.log(gameWinIndicator + "sdkksknvkmkdmkvmmksmkvkmmkmsmkskmkm")

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
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});