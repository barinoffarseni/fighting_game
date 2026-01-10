const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

let gameOver = false

const debug = false

let user = false
let player = {}
let enemy = {}

player.keys = {
    w: false,
    a: false,
    s: false,
    d: false
}

const gameObjects = []
const samuraiData = {
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  sprites: {
    idle: {
      frames: 8,
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
  name: 'samurai'
}

const ninjaData = {
  position: {
    x: canvas.width / 2,
    y: 0
  },
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
  name: 'ninja'
}

gameObjects.push(new SpriteStatic({
  position: {
    x: 0,
    y: 0
  },
  imgSrc: './img/background.png'
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

const samurai = new Fighter(samuraiData)
const ninja = new Fighter(ninjaData)

gameObjects.push(new HealthBar({
  offset: {
    x: 50,
    y: 0
  },
  textureMirroring: 1,
  entity: ninja
}))

gameObjects.push(new HealthBar({
  offset: {
    x: -50,
    y: 0
  },
  textureMirroring: -1,
  entity: samurai
}))

const timer = new Timer()
gameObjects.push(timer)

const winIndicator = new WinIndicator(samurai, ninja, timer)
gameObjects.push(winIndicator)

const restartButton = new Button()
gameObjects.push(restartButton)

function gameLoop () {
  control()
  update()
  render()

  window.requestAnimationFrame(gameLoop)
}

function waitingForPlayers () {
  socket.on('set-data', function ({ type, id }) {
    if (!user) {
      user = { type, id }

      if (user.type === 'samurai') {
        // player.samurai = new Fighter(samuraiData)

        gameObjects.push(samurai)

        player.type = 'samurai'
        enemy.type = 'ninja'
      }

      if (user.type === 'ninja') {
        // player.ninja = new Fighter(samuraiData)
        // enemy.samurai = new Fighter(samuraiData)

        gameObjects.push(ninja)
        gameObjects.push(samurai)

        player.type = 'ninja'
        enemy.type = 'samurai'
      }
    } else {
      if (user.type === 'samurai') {
        // enemy.samurai = new Fighter(samuraiData)

        gameObjects.push(ninja)
      }
    }
  })

  gameLoop()
}

waitingForPlayers()

function control () {
  if (player.keys.w) {
    socket.emit('set-move-command', { player: {type: player.type, command: 'up' }})
    // Ваня разобраться что тут set-move-command отправляется 60 раз в секунду
  }

  if (player.keys.d) {
    socket.emit('set-move-command', { player: {type: player.type, command: 'right' }})
  }

  if (player.keys.a) {
    socket.emit('set-move-command', { player: {type: player.type, command: 'left' }})
  }

  if (player.keys.s) {
    socket.emit('set-move-command', { player: {type: player.type, command: 'attack' }})
  }
}

socket.on('id', function (message) {
  id = message
})

socket.on('set-fighters-data', function (data) {
  samurai.health = data.samurai.health
  ninja.health = data.ninja.health

  samurai.position = data.samurai.position
  ninja.position = data.ninja.position

  samurai.command = data.samurai.command
  ninja.command = data.ninja.command

  if (debug && data.samurai.attackBox && data.ninja.attackBox) {
    samurai.attackBox = data.samurai.attackBox
    ninja.attackBox = data.ninja.attackBox
  }
})

socket.on('timer', function (data) {
  timer.timeRemaining = data.timeRemaining
  timer.timeOut = data.timeOut
})

socket.on('game-over', function (data) {
  winIndicator.winner = data.winner
  gameOver = true
})

function update () {
  samurai.textureMirroring = getFighterTextureMirroring(samurai.position.x, ninja.position.x)
  ninja.textureMirroring = getFighterTextureMirroring(ninja.position.x, samurai.position.x)

  // if (player.type == 'samurai') {
  samurai.checkAttackIsSuccess()
  // }

  if (gameOver) {
    timer.timeOut = true
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
  if (!gameOver) {
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

// function checkAttackIsSuccess(attacker) {
//   if (attacker.state != 'attack1' && attacker.state != 'attack2') {
//     return false
//   }

//   if (attacker.currentFrame != attacker.attackFrame) {
//     return false
//   }

//   if (attacker.framesElapsed % attacker.framesHold === 0) {
//     socket.emit('check-attack-is-success', { attacker: player.type })
//   }
// }