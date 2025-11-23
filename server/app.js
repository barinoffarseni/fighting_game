const express = require('express')
const app = express()
const http = require('http')
const httpServer = http.createServer(app)
const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'http://localhost',
    methods: ['GET', 'POST']
  }
})
const Timer = require('./timer.js').Timer
const Fighter = require('./fighter.js').Fighter

const users = []
const gameObjects = []
let gameOver = false
let winner = ''
let gameTimer = null

const samurai = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  }
})

const ninja = new Fighter({
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
    sockets.forEach((socket) => {
      socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining - 1, timeOut: gameTimer.timeOut })
      socket.emit('set-position', { ninja: { position: ninja.position }, samurai: { position: samurai.position } })
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
      sockets.forEach((socket) => {
        socket.emit('game-over', { gameOver, winner })
      })
    }
  }

  gameObjects.forEach((gameObject) => {
    gameObject.update()
  })
}, 50)

io.on('connection', (socket) => {
  console.log('New connection:', socket.id)
  let type = 'samurai'
  sockets.push(socket)

  const id = socket.handshake.issued

  socket.emit('set-position', { samuraiPosition: samurai.position, ninjaPosition: ninja.position })

  if (users.length > 0) {
    if (users[users.length - 1].type == 'samurai') {
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

      socket.emit('game-over', { gameOver, winner })
    }

    if (ninja.health == 0) {
      winner = 'Player 1'
      gameOver = true

      socket.emit('game-over', { gameOver, winner })
    }

    socket.emit('set-health', { ninjaHealth: ninja.health, samuraiHealth: samurai.health })
  })

  if (users.length > 2) {
    return
  }

  users.push({ type, id })

  io.emit('set-data', { type, ninjaHealth: ninja.health, samuraiHealth: samurai.health })

  if (users.length == 2) {
    gameTimer = new Timer()
    gameObjects.push(gameTimer)
  }

  socket.on('disconnect', () => {
    console.log('Disconnect:', socket.id)
    const index = users.findIndex((user) => user.id == id)

    if (index > -1) {
      users.splice(index, 1)
    }
  })

  socket.on('set-move-direction', (data) => {
    if (data.playerType == 'samurai') {
      if (data.direction == 'right') {
        samurai.velocity.x = 4
      }
      if (data.direction == 'left') {
        samurai.velocity.x = -4
      }
      if (data.direction == 'up' && samurai.canJump) {
        samurai.velocity.y = -10
      }
    }
    if (data.playerType == 'ninja') {
      if (data.direction == 'right') {
        ninja.velocity.x = 4
      }
      if (data.direction == 'left') {
        ninja.velocity.x = -4
      }
      if (data.direction == 'up' && ninja.canJump) {
        ninja.velocity.y = -10
      }
    }
  })
})

httpServer.listen(3000, () => {
  console.log('listening on *:3000')
})
