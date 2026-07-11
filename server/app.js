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
const rooms = {}
const playerRooms = new Map()
const socketRooms = new Map()
let waitingRoomId = null

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
    if (Object.keys(room.players).length === 2 && room.state === 'start') {
      room.state = 'continue'
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

    if (room.state == 'continue' && gameTimer !== null) {
      Object.values(room.players).forEach(player => {
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

      gameObjects.forEach(gameObject => {
        gameObject.update()
      })
    }
  }
}, 50)

io.on('connection', (socket) => {
  const player = { id: crypto.randomUUID() }
  socket.emit('set-player-id', { id: player.id })
  console.log('New connection:', socket.id)

  socket.emit('set-fighters-data', fightersData)

  socket.on('disconnect', () => {
    console.log('Disconnect:', [player.id, socket.id])
    const roomId = socketRooms.get(socket.id)
    if (!rooms[roomId]) {
      console.log(rooms[roomId], roomId)
      return
    }

    socketRooms.delete(socket.id)
    if (rooms[roomId].state === 'continue') {
      rooms[roomId].players[player.id].socket = null
      rooms[roomId].state = 'stop'
      gameTimer.timeStop = true
    } else {
      delete rooms[roomId]
      if (waitingRoomId === roomId) {
        waitingRoomId = null
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
    room = rooms[playerRooms.get(id)]
    if (room && room.state === 'stop') {
      // const playerIndex 
      player.type = room.players[id].type
      room.players[id].socket = socket
      room.state = 'continue'
      gameTimer.startTimer()
    } else {
      room = rooms[waitingRoomId]
      if (room) {
        player.type = 'ninja'
        waitingRoomId = null

        gameObjects.push(ninja)
      } else {
        player.type = 'samurai'

        room = new Room()
        rooms[room.id] = room
        waitingRoomId = room.id

        gameObjects.push(samurai)
      }
    }
    room.players[id] = { id: id, type: player.type, socket: socket }

    socket.join(room.id)
    socketRooms.set(socket.id, room.id)
    playerRooms.set(id, room.id)

    socket.emit('set-data', { type: player.type })
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
  Object.values(room.players).forEach(player => {
    player.socket.emit('game-over', { winner })
  })
}

class Room {
  constructor () {
    this.id = this.setId(),
    this.players = {},
    this.state = 'start'
  }

  setId() {
    return crypto.randomUUID()
  }
}