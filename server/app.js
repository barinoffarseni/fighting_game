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
const Room = require('./room.js').Room
const Timer = require('./timer.js').Timer
const Fighter = require('./fighter.js').Fighter

const debug = false

const rooms = {}
const playerRooms = new Map()
const socketRooms = new Map()
let waitingRoomId = null

const fightersData = {}
setInterval(() => {
  for (const room of Object.values(rooms)) {
    if (Object.keys(room.players).length === 2 && room.state === 'start') {
      room.state = 'continue'
      room.gameTimer = new Timer()
      room.gameObjects.push(room.gameTimer)
    }
    room.fighters.samurai.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(room.fighters.samurai.position.x, room.fighters.ninja.position.x)
    room.fighters.ninja.attackBoxPositionMirroring = getFighterAttackBoxPositionMirroring(room.fighters.ninja.position.x, room.fighters.samurai.position.x)

    fightersData.ninja = { position: room.fighters.ninja.position, command: room.fighters.ninja.command, health: room.fighters.ninja.health }
    fightersData.samurai = { position: room.fighters.samurai.position, command: room.fighters.samurai.command, health: room.fighters.samurai.health }

    if (debug) {
      fightersData.ninja.attackBox = room.fighters.ninja.attackBox
      fightersData.samurai.attackBox = room.fighters.samurai.attackBox
    }

    if (room.state == 'continue' && room.gameTimer !== null) {
      io.to(room.id).emit('timer', { timeRemaining: room.gameTimer.timeRemaining - 1, timeOut: room.gameTimer.timeOut })
      io.to(room.id).emit('set-fighters-data', fightersData)

      if (room.gameTimer.timeRemaining === 1) {
        if (room.fighters.ninja.health > room.fighters.samurai.health) {
          room.winner = 'Player 2'
          io.to(room.id).emit('game-over', { winner: room.winner })
        }
        if (room.fighters.samurai.health > room.fighters.ninja.health) {
          room.winner = 'Player 1'
          io.to(room.id).emit('game-over', { winner: room.winner })
        }
        if (room.fighters.ninja.health === room.fighters.samurai.health) {
          room.gameTimer.timeRemaining += 9
          room.gameTimer.timeOut = false
        }
      }

      room.gameObjects.forEach(gameObject => {
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
      return
    }

    socketRooms.delete(socket.id)
    if (rooms[roomId].state === 'continue') {
      delete rooms[roomId].players[socket.id]
      rooms[roomId].state = 'stop'
      rooms[roomId].gameTimer.timeStop = true
    } else {
      delete rooms[roomId]
      if (waitingRoomId === roomId) {
        waitingRoomId = null
      }
    }
  })

  socket.on('set-move-command', (data) => {
    const room = rooms[socketRooms.get(socket.id)]

    if (data.player.type === 'samurai') {
      if (data.player.command === 'right') {
        room.fighters.samurai.velocity.x = 4
        if (room.fighters.samurai.canJump) {
          room.fighters.samurai.command = data.player.command
        }
      }
      if (data.player.command === 'left') {
        room.fighters.samurai.velocity.x = -4
        if (room.fighters.samurai.canJump) {
          room.fighters.samurai.command = data.player.command
        }
      }
      if (data.player.command === 'up' && room.fighters.samurai.canJump) {
        room.fighters.samurai.velocity.y = -10
      }
      if (data.player.command === 'attack') {
        room.fighters.samurai.command = data.player.command
      }
    }
    if (data.player.type === 'ninja') {
      if (data.player.command === 'right') {
        room.fighters.ninja.velocity.x = 4
        if (room.fighters.ninja.canJump) {
          room.fighters.ninja.command = data.player.command
        }
      }
      if (data.player.command === 'left') {
        room.fighters.ninja.velocity.x = -4
        if (room.fighters.ninja.canJump) {
          room.fighters.ninja.command = data.player.command
        }
      }
      if (data.player.command === 'up' && room.fighters.ninja.canJump) {
        room.fighters.ninja.velocity.y = -10
      }
      if (data.player.command === 'attack') {
        room.fighters.ninja.command = data.player.command
      }
    }
  })

  socket.on('check-attack-is-success', (data) => {
    const room = rooms[socketRooms.get(socket.id)]

    if (data.attacker == 'samurai') {
      checkAttackIsSuccess(room.fighters.samurai, room.fighters.ninja)
    }
    if (data.attacker == 'ninja') {
      checkAttackIsSuccess(room.fighters.ninja, room.fighters.samurai)
    }

    if (room.fighters.samurai.health === 0) {
      room.winner = 'Player 2'
      io.to(room.id).emit('game-over', { winner: room.winner })
    }
    if (room.fighters.ninja.health === 0) {
      room.winner = 'Player 1'
      io.to(room.id).emit('game-over', { winner: room.winner })
    }
  })
  socket.on('get-player-id', (id) => {
    player.id = id
    let room = rooms[playerRooms.get(id)]
    if (room && room.state === 'stop') {
      if (Object.values(room.players)[0].type === 'samurai') {
        player.type = 'ninja'
      } else {
        player.type = 'samurai'
      }

      room.state = 'continue'
      room.gameTimer.startTimer()
    } else {
      room = rooms[waitingRoomId]
      if (room) {
        player.type = 'ninja'
        waitingRoomId = null

        room.gameObjects.push(room.fighters.ninja)
      } else {
        player.type = 'samurai'

        room = new Room()
        room.fighters.samurai = creatFighter(0,0)
        room.fighters.ninja = creatFighter(512,0)
        rooms[room.id] = room
        waitingRoomId = room.id

        room.gameObjects.push(room.fighters.samurai)
      }
    }
    room.players[socket.id] = { id, type: player.type, socket }

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

function creatFighter (x, y) {
  return new Fighter({
    position: {
      x: x,
      y: y
    },
    velocity: {
      x: 0,
      y: 0
    }
  })
}