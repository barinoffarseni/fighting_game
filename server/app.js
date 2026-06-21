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
const gameObjects = []

let room = {}
const player = {}
const players = [];
let waitingPlayers = []
const rooms = [];

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

  if (waitingPlayers.length > 1 ) {
    waitingPlayers = []
  }
  if (rooms[player.roomId]) {
    gameTimer = new Timer()
    gameObjects.push(gameTimer)
  }
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
  sockets.push(socket)

  socket.emit('set-fighters-data', fightersData)

  socket.on('disconnect', () => {
    console.log('Disconnect:', socket.id)
    const index = users.findIndex(user => user.id === player.id)
    player.socket = socket

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
  socket.on('get-player-id', (id) => {
    if (players.findIndex(id => id == -1)) {
      player.id = id
      if (waitingPlayers.length > 0) {
        player.type = 'ninja'

        room = rooms.find(room => {
          return room.players.some(player => player.id == waitingPlayers[0])
        })
        room.players.push({id: id})

        gameObjects.push(ninja)
      } else {
        player.type = 'samurai'

        room = {
          id: setIdOfRoom(),
          players: [{id: id}],
          timeStop: false
        }
        rooms.push(room) 

        gameObjects.push(samurai)
      }
      players.push(id)
      player.socket = socket
      player.roomId = room.id;
      player.socket.join(room.id)

      io.to(player.roomId).emit('set-data', { type: player.type });
      waitingPlayers.push(id)
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

function setIdOfRoom () {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}