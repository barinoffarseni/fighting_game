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

const gameObjects = []

let room
const player = {}
let playerIndex = 0
let waitingPlayers = []
const rooms = []

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
setInterval(() => {
  if (room) {
    if (room.players.length == 2 && room.state == 'start') {
      room.state = 'continue'
      // room.timerRuning = true
      gameTimer = new Timer()
      gameObjects.push(gameTimer)
    }
  }
  samurai.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(samurai.position.x, ninja.position.x)
  ninja.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(ninja.position.x, samurai.position.x)

  fightersData.ninja = { position: ninja.position, command: ninja.command, health: ninja.health }
  fightersData.samurai = { position: samurai.position, command: samurai.command, health: samurai.health }

  if (debug) {
    fightersData.ninja.attackBox = ninja.attackBox
    fightersData.samurai.attackBox = samurai.attackBox
  }

  if (gameTimer !== null && room.state == 'continue') {
    room.players.forEach(player => {
      player.socket.broadcast.emit('timer', { timeRemaining: gameTimer.timeRemaining - 1, timeOut: gameTimer.timeOut })
      player.socket.emit('set-fighters-data', fightersData)
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
  if (player) {
    console.log('New connection:', [player.id, socket.id])
  }

  socket.emit('set-fighters-data', fightersData)

  socket.on('disconnect', () => {
    console.log('Disconnect:', [player.id, socket.id])
    if (room) {
      if (room.players.length == 2 && room.state !== 'stop') {
        playerIndex = room.players.findIndex(player => player.socket == socket)

        if (playerIndex > -1) {
          room.players[playerIndex].socket = null
          room.state = 'stop'
        }
      } else {
        waitingPlayers = []
        const roomIndex = rooms.findIndex(room => room.players.some(player => player.socket == null) || room.players.length < 2)
        if (roomIndex > -1) {
          rooms.splice(roomIndex, 1)
        }
      }
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
    player.id = id
    room = rooms.find(room => {
      if (room.state == 'stop') {
        return room.players.some(player => player.id === id)
      }
    })
    if (room) {
      playerIndex = room.players.findIndex(player => player.id == id && player.socket == null)
      console.log(playerIndex, room)
      player.type = room.players[playerIndex].type

      room.players[playerIndex].socket = socket
      room.state = 'continue'
      socket.join(room.id)
    } else {
      if (waitingPlayers.length > 0) {
        player.type = 'ninja'

        room = rooms.find(room => {
          return room.players.some(player => player.id == waitingPlayers[0])
        })
        room.players.push({ id, type: player.type, socket })
        waitingPlayers = []

        gameObjects.push(ninja)
      } else {
        player.type = 'samurai'

        room = {
          id: setIdOfRoom(),
          players: [{ id, type: player.type, socket }],
          state: 'start',
          timerRuning: false
        }
        rooms.push(room)

        gameObjects.push(samurai)
        waitingPlayers.push(id)
      }

      socket.join(room.id)
    }

    io.to(room.id).emit('set-data', { type: player.type })
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
  room.players.forEach(player => {
    player.socket.emit('game-over', { winner })
  })
}

function setIdOfRoom () {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
