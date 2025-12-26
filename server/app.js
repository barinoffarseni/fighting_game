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

const debug = true

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
  samurai.vector = getFighterVector(samurai.position.x, ninja.position.x)
  ninja.vector = getFighterVector(ninja.position.x, samurai.position.x)

  if (gameTimer !== null) {
    sockets.forEach(socket => {
      socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining - 1, timeOut: gameTimer.timeOut })
      socket.emit('set-fighters-data', {
        ninja: { position: ninja.position, command: ninja.command, health: ninja.health },
        samurai: { position: samurai.position, command: samurai.command, health: ninja.health }
      })

      if (debug) {
        socket.emit('set-attack-boxes', { ninja: { attackBox: ninja.atackBox }, samurai: { attackBox: samurai.atackBox }})
      }
    })

    if (gameTimer.timeRemaining === 1) {
      if (ninja.health > samurai.health) {
        winner = 'Player 2'
        gameOver = true
      }
      if (samurai.health > ninja.health) {
        winner = 'Player 1'
        gameOver = true
      }
      if (ninja.health === samurai.health) {
        gameTimer.timeRemaining += 9
        gameTimer.timeOut = false
      }
      sockets.forEach(socket => {
        socket.emit('game-over', { gameOver, winner })
      })
    }
  }

  gameObjects.forEach(gameObject => {
    gameObject.update()
  })
}, 50)

io.on('connection', (socket) => {
  console.log('New connection:', socket.id)
  let type = 'samurai'
  sockets.push(socket)

  const id = socket.handshake.issued

  socket.emit('set-fighters-data', {
    ninja: { position: ninja.position, command: ninja.command, health: ninja.health },
    samurai: { position: samurai.position, command: samurai.command, health: ninja.health }
  })

  if (users.length > 0) {
    if (users[users.length - 1].type === 'samurai') {
      type = 'ninja'
      gameObjects.push(samurai)
      gameObjects.push(ninja)
    }
  }

  if (users.length > 2) {
    return
  }

  users.push({ type, id })

  io.emit('set-data', { type, id, ninjaHealth: ninja.health, samuraiHealth: samurai.health })
  if (users.length === 2) {
    gameTimer = new Timer()
    gameObjects.push(gameTimer)
  }

  socket.on('disconnect', () => {
    console.log('Disconnect:', socket.id)
    const index = users.findIndex(user => user.id === id)

    if (index > -1) {
      users.splice(index, 1)
    }
  })

  socket.on('set-move-command', (data) => {
    if (data.playerType === 'samurai') {
      if (data.command === 'right') {
        samurai.velocity.x = 4
        if (samurai.canJump) {
          samurai.command = data.command
        }
      }
      if (data.command === 'left') {
        samurai.velocity.x = -4
        if (samurai.canJump) {
          samurai.command = data.command
        }
      }
      if (data.command === 'up' && samurai.canJump) {
        samurai.velocity.y = -10
      }
      if (data.comand === 'attack') {
        samurai.comand = data.comand
      }
    }
    if (data.playerType === 'ninja') {
      if (data.command === 'right') {
        ninja.velocity.x = 4
        if (ninja.canJump) {
          ninja.command = data.command
        }
      }
      if (data.command === 'left') {
        ninja.velocity.x = -4
        if (ninja.canJump) {
          ninja.command = data.command
        }
      }
      if (data.command === 'up' && ninja.canJump) {
        ninja.velocity.y = -10
      }
      if (data.comand === 'attack') {
        ninja.comand = data.comand
      }
    }
  })

  socket.on('check-attack-is-success', (data) => {
    if (data.attacker == 'samurai') {
      checkAttackIsSuccess(samurai, ninja)
    }
    if (data.attacker == 'ninja') {
      checkAttackIsSuccess(ninja, samurai)
    }

    if (samurai.health === 0) {
      winner = 'Player 2'
      gameOver = true
    }
    if (ninja.health === 0) {
      winner = 'Player 1'
      gameOver = true
    }

    sockets.forEach(socket => {
      socket.emit('game-over', { gameOver, winner })
    })
  })
})

httpServer.listen(3000, () => {
  console.log('listening on *:3000')
})

function checkAttackIsSuccess (attacker, victim) {
  attacker.setAttackBoxMinMaxPosition()

  xMin = victim.position.x
  xMax = victim.position.x + victim.width
  if (attacker.getAttackBoxPosition().y + attacker.atackBox.height >= victim.position.y) {
    if (xMin < attacker.attackBoxXMin && xMax > attacker.attackBoxXMin) {
      victim.health -= 10
    }

    if (xMin > attacker.attackBoxXMin && xMax < attacker.attackBoxXMax) {
      victim.health -= 10
    }

    if (xMin < attacker.attackBoxXMax && xMax > attacker.attackBoxXMax) {
      victim.health -= 10
    }
  }
}

function getFighterVector (x1, x2) {
  if (x1 >= x2) {
    return -1
  } else {
    return 1
  }
}
