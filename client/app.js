const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

ctx.lineWidth = 2

canvas.width = 1024
canvas.height = 576

let gameState = 'continue'

const debug = false

let id = localStorage.getItem('id')
const player = {}
const enemy = {}

player.keys = {
  w: false,
  a: false,
  s: false,
  d: false
}

player.samurai = null
player.type = null

const gameObjects = []

gameObjects.push(new SpriteStatic({
  position: {
    x: 0,
    y: 0
  },
  imgSrc: './img/background.png',
  width: canvas.width,
  height: canvas.height
}))

gameObjects.push(new SpriteAnimated({
  position: {
    x: 650,
    y: 173
  },
  imgSrc: './img/shop.png',
  scale: 2.4,
  framesHold: 10,
  imgFrames: 6,
  offset: {
    x: 0,
    y: 0
  }
}))

const samuraiData = {
  velocity: {
    x: 0,
    y: 0
  },
  sprites: {
    idle: {
      frames: 8
    },
    run: {
      frames: 8
    },
    jump: {
      frames: 2
    },
    fall: {
      frames: 2
    },
    attack1: {
      frames: 6
    },
    attack2: {
      frames: 6
    },
    takeHit: {
      frames: 4
    },
    death: {
      frames: 6
    }
  },
  offset: {
    x: -215,
    y: -155
  },
  attackFrame: 4,
  name: 'samurai',
  textureMirroring: 1
}

const ninjaData = {
  velocity: {
    x: 0,
    y: 0
  },
  sprites: {
    idle: {
      frames: 4
    },
    run: {
      frames: 8
    },
    jump: {
      frames: 2
    },
    fall: {
      frames: 2
    },
    attack1: {
      frames: 4
    },
    attack2: {
      frames: 4
    },
    takeHit: {
      frames: 3
    },
    death: {
      frames: 7
    }
  },
  offset: {
    x: -215,
    y: -170
  },
  attackFrame: 1,
  name: 'ninja',
  textureMirroring: -1
}

const rightHealthBarData = {
  offset: {
    x: 64,
    y: 0
  },
  textureMirroring: 1
}
const leftHealthBarData = {
  offset: {
    x: -64,
    y: 0
  },
  textureMirroring: -1
}

const timer = new Timer({
  position: {
    x: canvas.width / 2 - 90,
    y: -3
  },
  imgSrc: './img/timerFrame.png',
  width: 181,
  height: 130
})
gameObjects.push(timer)

const waitTimer = new WaitTimer()
gameObjects.push(waitTimer)

const restartButton = new Button()
gameObjects.push(restartButton)
const RestartButtonFrame = new Frame()
gameObjects.push(RestartButtonFrame)

const winIndicator = new WinIndicator()
gameObjects.push(winIndicator)

function gameLoop () {
  control()
  update()
  render()

  window.requestAnimationFrame(gameLoop)
}

function waitingForPlayers () {
  socket.on('set-player-id', function (data) {
    if (!id) {
      id = data.id
      localStorage.setItem('id', id)
    }
    socket.emit('get-player-id', id)
  })

  socket.on('set-data', function ({ type }) {
    if (type === 'samurai') {
      player.type = 'samurai'
      enemy.type = 'ninja'
    }
    if (type === 'ninja') {
      player.type = 'ninja'
      enemy.type = 'samurai'
    }
  })
  setFighter(player, leftHealthBarData, rightHealthBarData)
  setFighter(enemy, leftHealthBarData, rightHealthBarData)

  gameLoop()
}

waitingForPlayers()

function control () {
  if (player.keys.w) {
    socket.emit('set-move-command', { player: { type: player.type, command: 'up' } })
    // Ваня разобраться что тут set-move-command отправляется 60 раз в секунду
  }

  if (player.keys.d) {
    socket.emit('set-move-command', { player: { type: player.type, command: 'right' } })
  }

  if (player.keys.a) {
    socket.emit('set-move-command', { player: { type: player.type, command: 'left' } })
  }

  if (player.keys.s) {
    socket.emit('set-move-command', { player: { type: player.type, command: 'attack' } })
  }
}

socket.on('set-fighters-data', function (data) {
  if (player[player.type]) {
    player[player.type].health = data[player.type].health
    player[player.type].position = data[player.type].position
    player[player.type].command = data[player.type].command

    if (!player[player.type].previousHealth) {
      player[player.type].previousHealth = data[player.type].health
    }
  }

  if (enemy[enemy.type]) {
    enemy[enemy.type].health = data[enemy.type].health
    enemy[enemy.type].position = data[enemy.type].position
    enemy[enemy.type].command = data[enemy.type].command

    if (!enemy[enemy.type].previousHealth) {
      enemy[enemy.type].previousHealth = data[enemy.type].health
    }
  }

  if (debug && data[player.type].attackBox && data[enemy.type].attackBox) {
    player[player.type].attackBox = data[player.type].attackBox
    enemy[enemy.type].attackBox = data[enemy.type].attackBox
  }
})

socket.on('timer', function (data) {
  timer.timeRemaining = data.timeRemaining
  timer.timeOut = data.timeOut
})

socket.on('wait-timer', function (data) {
  if (gameState === 'stop') {
    waitTimer.timeRemaining = data.timeRemaining
    waitTimer.timeOut = data.timeOut

    if (waitTimer.timeOut) {
      location.reload()
    }
  }
})

socket.on('set-game-state', function (data) {
  gameState = data.state
  RestartButtonFrame.isVisible = false
  if (gameState === 'stop') {
    RestartButtonFrame.isVisible = true
  }
  if (gameState === 'over') {
    winIndicator.winner = data.winner
    RestartButtonFrame.isVisible = true
  }
})

socket.on('set-fighters-data', function (data) {
  samuraiData.position = data.samurai.position

  ninjaData.position = data.ninja.position
})

function update () {
  if (player[player.type] && enemy[enemy.type]) {
    player[player.type].textureMirroring = getFighterTextureMirroring(player[player.type].position.x, enemy[enemy.type].position.x)
    enemy[enemy.type].textureMirroring = getFighterTextureMirroring(enemy[enemy.type].position.x, player[player.type].position.x)

    player[player.type].checkAttackIsSuccess()
  }

  gameObjects.forEach(gameObject => {
    gameObject.update()
  })
}

function render () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  gameObjects.forEach(gameObject => {
    gameObject.render()
  })
}

window.addEventListener('keyup', keyup)
function keyup (event) {
  switch (event.key) {
    case 'd':
      player.keys.d = false
      break
    case 'a':
      player.keys.a = false
      break
    case 'w':
      player.keys.w = false
      break
    case 's':
      player.keys.s = false
      break
  }
}

window.addEventListener('keydown', keydown)
function keydown (event) {
  if (gameState !== 'over') {
    switch (event.key) {
      case 'd':
        player.keys.d = true
        break
      case 'a':
        player.keys.a = true
        break
      case 'w':
        player.keys.w = true
        break
      case 's':
        player.keys.s = true
        break
    }
  }
}

function getFighterTextureMirroring (x1, x2) {
  if (x1 >= x2) {
    return -1
  } else {
    return 1
  }
}

function setFighter (player, leftHealthBarData, rightHealthBarData) {
  const intervalId = setInterval(() => {
    if (!player[player.type]) {
      if (player.type == 'samurai' && samuraiData.position) {
        player.samurai = new Fighter(samuraiData)
        gameObjects.push(player.samurai)

        leftHealthBarData.entity = player.samurai
        gameObjects.push(new HealthBar(leftHealthBarData))
        gameObjects.push(new SpriteStatic({
          position: {
            x: -24,
            y: -90
          },
          imgSrc: './img/healthBarFrame.png',
          width: 550,
          height: 300
        }))
      }
      if (player.type == 'ninja' && ninjaData.position) {
        player.ninja = new Fighter(ninjaData)
        gameObjects.push(player.ninja)

        rightHealthBarData.entity = player.ninja
        gameObjects.push(new HealthBar(rightHealthBarData))
        gameObjects.push(new SpriteStatic({
          position: {
            x: canvas.width / 2 - 14,
            y: -90
          },
          imgSrc: './img/healthBarFrame.png',
          width: 550,
          height: 300
        }))
      }
    } else {
      clearInterval(intervalId)
    }
  }, 100)
}
