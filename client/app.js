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
      rightSrc: './img/samurai/Idle.png',
      leftScr: './img/samurai/Idle inverted.png',
      frames: 8
    },
    run: {
      rightSrc: './img/samurai/Run.png',
      leftScr: './img/samurai/Run inverted.png',
      frames: 8
    },
    jump: {
      rightSrc: './img/samurai/Jump.png',
      leftScr: './img/samurai/Jump inverted.png',
      frames: 2
    },
    fall: {
      rightSrc: './img/samurai/Fall.png',
      leftScr: './img/samurai/Fall inverted.png',
      frames: 2
    },
    attack1: {
      rightSrc: './img/samurai/Attack1.png',
      leftScr: './img/samurai/Attack1 inverted.png',
      frames: 6
    },
    attack2: {
      rightSrc: './img/samurai/Attack2.png',
      leftScr: './img/samurai/Attack2 inverted.png',
      frames: 6
    },
    takeHit: {
      rightSrc: './img/samurai/Take Hit.png',
      leftScr: './img/samurai/Take Hit inverted.png',
      frames: 4
    },
    death: {
      rightSrc: './img/samurai/Death.png',
      leftScr: './img/samurai/Death inverted.png',
      frames: 6
    }
  },
  offset: {
    x: -215,
    y: -155
  },
  attackFrame: 4
}

function getFighterScr (x1, x2) {
  if ()
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
      rightSrc: './img/ninja/Idle inverted.png',
      leftScr: './img/ninja/Idle.png',
      frames: 4
    },
    run: {
      rightSrc: './img/ninja/Run inverted.png',
      leftScr: './img/ninja/Run.png',
      frames: 8
    },
    jump: {
      rightSrc: './img/ninja/Jump inverted.png',
      leftScr: './img/ninja/Jump.png',
      frames: 2
    },
    fall: {
      rightSrc: './img/ninja/Fall inverted.png',
      leftScr: './img/ninja/Fall.png',
      frames: 2
    },
    attack1: {
      rightSrc: './img/ninja/Attack1 inverted.png',
      leftScr: './img/ninja/Attack1.png',
      frames: 4
    },
    attack2: {
      rightSrc: './img/ninja/Attack2 inverted.png',
      leftScr: './img/ninja/Attack2.png',
      frames: 4
    },
    takeHit: {
      rightSrc: './img/ninja/Take Hit inverted.png',
      leftScr: './img/ninja/Take Hit.png',
      frames: 3
    },
    death: {
      rightSrc: './img/ninja/Death inverted.png',
      leftScr: './img/ninja/Death.png',
      frames: 7
    }
  },
  offset: {
    x: -215,
    y: -170
  },
  attackFrame: 1
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
        gameObjects.push(samurai)

        player.type = 'samurai'
        enemy.type = 'ninja'
      }

      if (user.type === 'ninja') {
        gameObjects.push(ninja)
        gameObjects.push(samurai)

        player.type = 'ninja'
        enemy.type = 'samurai'
      }
    } else {
      if (user.type === 'samurai') {
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

  if (player.type == 'samurai') {
    checkAttackIsSuccess(samurai)
  }
  if (player.type == 'ninja') {
    checkAttackIsSuccess(ninja)
  }
  console.log()

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

function checkAttackIsSuccess(attacker) {
  if (attacker.state != 'attack1' && attacker.state != 'attack2') {
    return false
  }

  if (attacker.currentFrame != attacker.attackFrame) {
    return false
  }

  if (attacker.framesElapsed % attacker.framesHold === 0) {
    socket.emit('check-attack-is-success', { attacker: player.type })
  }
}

function getFighterTextureMirroring (x1, x2) {
  if (x1 >= x2) {
    return -1
  } else {
    return 1
  }
}

