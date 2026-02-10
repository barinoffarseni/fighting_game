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

const debug = false

const users = []
const rooms = {}
const gameObjects = []
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

const fightersData = {}
const sockets = []
setInterval(() => {
  samurai.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(samurai.position.x, ninja.position.x)
  ninja.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(ninja.position.x, samurai.position.x)

  fightersData.ninja = { position: ninja.position, command: ninja.command, health: ninja.health }
  fightersData.samurai = { position: samurai.position, command: samurai.command, health: samurai.health }

  if (debug) {
    fightersData.ninja.attackBox = ninja.attackBox
    fightersData.samurai.attackBox = samurai.attackBox
  }

  if (gameTimer !== null) {
    sockets.forEach(socket => {
      socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining - 1, timeOut: gameTimer.timeOut })
      socket.emit('set-fighters-data', fightersData)
    })

    if (gameTimer.timeRemaining === 1) {
      if (ninja.health > samurai.health) {
        winner = 'Player 2'
        sendingTheWinnerToClients(winner)
      }
      if (samurai.health > ninja.health) {
        winner = 'Player 1'
        sendingTheWinnerToClients(winner)
      }
      if (ninja.health === samurai.health) {
        gameTimer.timeRemaining += 9
        gameTimer.timeOut = false
      }
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

  socket.emit('set-fighters-data', fightersData)

  users.push({ type, id })

  if (users.length % 2 == 0) {
    type = 'ninja'
    gameObjects.push(ninja)
  } else {
    gameObjects.push(samurai)
  }


  io.emit('set-data', { type, id })
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
    if (data.player.type === 'samurai') {
      if (data.player.command === 'right') {
        samurai.velocity.x = 4
        if (samurai.canJump) {
          samurai.command = data.player.command
        }
      }
      if (data.player.command === 'left') {
        samurai.velocity.x = -4
        if (samurai.canJump) {
          samurai.command = data.player.command
        }
      }
      if (data.player.command === 'up' && samurai.canJump) {
        samurai.velocity.y = -10
      }
      if (data.player.command === 'attack') {
        samurai.command = data.player.command
      }
    }
    if (data.player.type === 'ninja') {
      if (data.player.command === 'right') {
        ninja.velocity.x = 4
        if (ninja.canJump) {
          ninja.command = data.player.command
        }
      }
      if (data.player.command === 'left') {
        ninja.velocity.x = -4
        if (ninja.canJump) {
          ninja.command = data.player.command
        }
      }
      if (data.player.command === 'up' && ninja.canJump) {
        ninja.velocity.y = -10
      }
      if (data.player.command === 'attack') {
        ninja.command = data.player.command
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
      sendingTheWinnerToClients(winner)
    }
    if (ninja.health === 0) {
      winner = 'Player 1'
      sendingTheWinnerToClients(winner)
    }
  })
})

httpServer.listen(3000, () => {
  console.log('listening on *:3000')
})

function checkAttackIsSuccess (attacker, victim) {
  attacker.setAttackBoxMinMaxPosition()

  xMin = victim.position.x
  xMax = victim.position.x + victim.width
  if (attacker.getAttackBoxPosition().y + attacker.attackBox.height >= victim.position.y) {
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

function getFighterAttackBoxPositionMirroring (x1, x2) {
  if (x1 >= x2) {
    return -1
  } else {
    return 1
  }
}

function sendingTheWinnerToClients (winner) {
  sockets.forEach(socket => {
    socket.emit('game-over', { winner })
  })
}
