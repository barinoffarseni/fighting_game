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
const rooms = []
const socketRooms = new Map()

setInterval(() => {
  rooms.forEach(room => {
    if (room.players.length === 2 && room.state === 'start') {
      room.state = 'continue'
      room.gameTimer = new Timer()
      room.gameObjects.push(room.gameTimer)
    }

    const samurai = room.fighters.samurai
    const ninja = room.fighters.ninja

    samurai.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(samurai.position.x, ninja.position.x)
    ninja.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(ninja.position.x, samurai.position.x)

    const fightersData = {}
    fightersData.ninja = { position: ninja.position, command: ninja.command, health: ninja.health }
    fightersData.samurai = { position: samurai.position, command: samurai.command, health: samurai.health }

    if (debug) {
      fightersData.ninja.attackBox = ninja.attackBox
      fightersData.samurai.attackBox = samurai.attackBox
    }

    if (room.gameTimer !== null && room.state !== 'start') {
      io.to(room.id).emit('timer', { timeRemaining: room.gameTimer.timeRemaining - 1, timeOut: room.gameTimer.timeOut })
      io.to(room.id).emit('set-fighters-data', fightersData)

      if (room.gameTimer.timeRemaining === 1) {
        if (ninja.health > samurai.health) {
          room.winner = 'Player 2'
          sendingTheWinnerToClients(room)
        }
        if (samurai.health > ninja.health) {
          room.winner = 'Player 1'
          sendingTheWinnerToClients(room)
        }
        if (ninja.health === samurai.health) {
          room.gameTimer.timeRemaining += 9
          room.gameTimer.timeOut = false
        }
      }
    }

    room.gameObjects.forEach(gameObject => {
      gameObject.update()
    })
  })
}, 50)

io.on('connection', (socket) => {
  console.log('New connection:', socket.id)

  socket.on('disconnect', () => {
    console.log('Disconnect:', socket.id)
    const room = findRoom(socket)
    if (!room) {
      return
    }
    if (room.players.length === 2 && room.state !== 'stop') {
      const playerIndex = room.players.findIndex(player => player.socket === socket)

      if (playerIndex > -1) {
        room.players[playerIndex].socket = null
        room.state = 'stop'
      }
    } else {
      const roomIndex = rooms.findIndex(room => room.players.some(player => player.socket === null) || room.players.length < 2)
      if (roomIndex > -1) {
        rooms.splice(roomIndex, 1)
      }
    }
    socketRooms.delete(socket.id)
  })

  socket.on('set-move-command', (data) => {
    const room = findRoom(socket)
    if (!room || room.state !== 'continue') {
      return
    }

    const samurai = room.fighters.samurai
    const ninja = room.fighters.ninja

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
    const room = findRoom(socket)
    if (!room || room.state !== 'continue') {
      return
    }

    const samurai = room.fighters.samurai
    const ninja = room.fighters.ninja

    if (data.attacker == 'samurai') {
      checkAttackIsSuccess(samurai, ninja)
    }
    if (data.attacker == 'ninja') {
      checkAttackIsSuccess(ninja, samurai)
    }

    if (samurai.health === 0) {
      room.winner = 'Player 2'
      sendingTheWinnerToClients(room)
    }
    if (ninja.health === 0) {
      room.winner = 'Player 1'
      sendingTheWinnerToClients(room)
    }
  })
  socket.on('get-player-id', (id) => {
    const player = {
      id,
      socket,
      type: ''
    }
    let room = findStoppadRoomByPlayerId(id)
    if (room) {
      const playerIndex = room.players.findIndex(player => player.id == id && player.socket == null)
      player.type = room.players[playerIndex].type

      room.players[playerIndex].socket = socket
      room.state = 'continue'

      socketRooms.set(socket.id, room.id)
      socket.join(room.id)
    } else {
      room = findWaitingRoom()
      if (room) {
        player.type = 'ninja'
        room.players.push(player)

        room.gameObjects.push(room.fighters.ninja)
        socketRooms.set(socket.id, room.id)
      } else {
        player.type = 'samurai'

        room = {
          id: setIdOfRoom(),
          players: [player],
          fighters: {
            samurai: creatFighter(0, 0),
            ninja: creatFighter(512, 0)
          },
          gameObjects: [],
          state: 'start',
          winner: '',
          gameTimer: null
        }
        room.gameObjects.push(room.fighters.samurai)
        rooms.push(room)
      }
      socketRooms.set(socket.id, room.id)
      socket.join(room.id)
    }

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

function sendingTheWinnerToClients (room) {
  io.to(room.id).emit('game-over', { winner: room.winner })
}

function setIdOfRoom () {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function findStoppadRoomByPlayerId (id) {
  return rooms.find(room => {
    if (room.state == 'stop') {
      return room.players.some(player => player.id === id)
    }
  })
}

function findWaitingRoom () {
  return rooms.find(room => room.state == 'start' && room.players.length == 1)
}

function findRoom (socket) {
  return rooms.find(room => room.id == socketRooms.get(socket.id))
}

function creatFighter (x, y) {
  return new Fighter({
    position: {
      x,
      y
    },
    velocity: {
      x: 0,
      y: 0
    }
  })
}
