const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.2
let gameOver = false

let debug = false

const keys = {
  samurai: {
    w: false,
    a: false,
    s: false,
    d: false
  },
  ninja: {
    w: false,
    a: false,
    s: false,
    d: false
  }
}

let user = false
let playerType
let enemyType

const gameObjects = [];

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

const samurai = new Fighter({
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
      rightSrc: './img/samuraiMack/Idle.png',
      leftScr: './img/samuraiMack/Idle inverted.png',
      frames: 8
    },
    run: {
      rightSrc: './img/samuraiMack/Run.png',
      leftScr: './img/samuraiMack/Run inverted.png',
      frames: 8
    },
    jump: {
      rightSrc: './img/samuraiMack/Jump.png',
      leftScr: './img/samuraiMack/Jump inverted.png',
      frames: 2
    },
    fall: {
      rightSrc: './img/samuraiMack/Fall.png',
      leftScr: './img/samuraiMack/Fall inverted.png',
      frames: 2
    },
    attack1: {
      rightSrc: './img/samuraiMack/Attack1.png',
      leftScr: './img/samuraiMack/Attack1 inverted.png',
      frames: 6
    },
    attack2: {
      rightSrc: './img/samuraiMack/Attack2.png',
      leftScr: './img/samuraiMack/Attack2 inverted.png',
      frames: 6
    },
    takeHit: {
      rightSrc: './img/samuraiMack/Take Hit.png',
      leftScr: './img/samuraiMack/Take Hit inverted.png',
      frames: 4
    },
    death: {
      rightSrc: './img/samuraiMack/Death.png',
      leftScr: './img/samuraiMack/Death inverted.png',
      frames: 6
    }
  },
  offset: {
    x: -215,
    y: -155
  },
  attackFrame: 4
})

const ninja = new Fighter({
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
      rightSrc: './img/kenji/Idle inverted.png',
      leftScr: './img/kenji/Idle.png',
      frames: 4
    },
    run: {
      rightSrc: './img/kenji/Run inverted.png',
      leftScr: './img/kenji/Run.png',
      frames: 8
    },
    jump: {
      rightSrc: './img/kenji/Jump inverted.png',
      leftScr: './img/kenji/Jump.png',
      frames: 2
    },
    fall: {
      rightSrc: './img/kenji/Fall inverted.png',
      leftScr: './img/kenji/Fall.png',
      frames: 2
    },
    attack1: {
      rightSrc: './img/kenji/Attack1 inverted.png',
      leftScr: './img/kenji/Attack1.png',
      frames: 4
    },
    attack2: {
      rightSrc: './img/kenji/Attack2 inverted.png',
      leftScr: './img/kenji/Attack2.png',
      frames: 4
    },
    takeHit: {
      rightSrc: './img/kenji/Take Hit inverted.png',
      leftScr: './img/kenji/Take Hit.png',
      frames: 3
    },
    death: {
      rightSrc: './img/kenji/Death inverted.png',
      leftScr: './img/kenji/Death.png',
      frames: 7
    }
  },
  offset: {
    x: -215,
    y: -170
  },
  attackFrame: 1
})

gameObjects.push(new HealthBar({
  offset: {
    x: 50,
    y: 0
  },
  direction: 1,
  entity: ninja
}))

gameObjects.push(new HealthBar({
  offset: {
    x: -50,
    y: 0
  },
  direction: -1,
  entity: samurai
}))

const timer = new Timer()
gameObjects.push(timer)

const winIndicator = new WinIndicator(samurai, ninja, timer)
gameObjects.push(winIndicator)

const restartButton = new Button()
gameObjects.push(restartButton)


function gameLoop() {
  control();
  update();
  render();

  window.requestAnimationFrame(gameLoop);
}

function waitingForPlayers() {
  socket.on('set-data', function ({ type: type, id: id }) {
    if (!user) {
      user = { type: type, id: id }

      if (user.type == 'samurai') {
        gameObjects.push(samurai)

        playerType = 'samurai'
        enemyType = 'ninja'
      }

      if (user.type == 'ninja') {
        gameObjects.push(ninja)
        gameObjects.push(samurai)

        playerType = 'ninja'
        enemyType = 'samurai'
      }
    } else {
      if (user.type == 'samurai') {
        gameObjects.push(ninja)
      }
    }
  });

  gameLoop()
}

waitingForPlayers()

function control() {
  samurai.velocity.x = 0
  if (keys.samurai.w && samurai.canJump) {
    samurai.velocity.y = -10
  }

  if (keys.samurai.d) {
    samurai.velocity.x = 4
  }

  if (keys.samurai.a) {
    samurai.velocity.x = -4
  }

  if (keys.samurai.s) {
    samurai.attack = true
  } else {
    samurai.attack = false
  }

  ninja.velocity.x = 0
  if (keys.ninja.w && ninja.canJump) {
    ninja.velocity.y = -10
  }

  if (keys.ninja.d) {
    ninja.velocity.x = 4
  }

  if (keys.ninja.a) {
    ninja.velocity.x = -4
  }

  if (keys.ninja.s) {
    ninja.attack = true
  } else {
    ninja.attack = false
  }
}

socket.on('id', function (msg) {
  id = msg
});

socket.on('timer', function (data) {
  console.log('timeRemaining ' + data.timeRemaining);
  console.log('timeOut ' + data.timeOut);
  timer.timeRemaining = data.timeRemaining
  timer.timeOut = data.timeOut
});

function update() {
  samurai.direction = getFighterDirection(samurai.position.x, ninja.position.x)
  ninja.direction = getFighterDirection(ninja.position.x, samurai.position.x)

  if (checkAttackIsSuccess(samurai, ninja)) {
    ninja.health -= 10
  }

  if (checkAttackIsSuccess(ninja, samurai)) {
    samurai.health -= 10
  }

  if (winIndicator.tie) {
    // timer.timeRemaining += 10
    // timer.timeOut = false
    winIndicator.tie = false
  }

  if (gameOver) {
    timer.timeOut = true
  }

  gameObjects.forEach(gameObject => {
    gameObject.update()
  })
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  gameObjects.forEach(gameObject => {
    gameObject.render()
  })
}

window.addEventListener('keyup', keyup)
function keyup(event) {
  switch (event.key) {
    case 'd':
      keys[playerType].d = false
      socket.emit('key-up', 'd');
      break
    case 'a':
      keys[playerType].a = false
      socket.emit('key-up', 'a');
      break
    case 'w':
      keys[playerType].w = false
      socket.emit('key-up', 'w');
      break
    case 's':
      keys[playerType].s = false
      socket.emit('key-up', 's');
      break
  }
}

window.addEventListener('keydown', keydown)
function keydown(event) {
  if (!gameOver) {
    switch (event.key) {
      case 'd':
        socket.emit('key-down', 'd');
        keys[playerType].d = true
        break
      case 'a':
        socket.emit('key-down', 'a');
        keys[playerType].a = true
        break
      case 'w':
        socket.emit('key-down', 'w');
        keys[playerType].w = true
        break
      case 's':
        socket.emit('key-down', 's');
        keys[playerType].s = true
        break
    }
  }
}

socket.on('key-down', function (keyName) {
  if (!gameOver) {
    switch (keyName) {
      case 'd':
        keys[enemyType].d = true
        break
      case 'a':
        keys[enemyType].a = true
        break
      case 'w':
        keys[enemyType].w = true
        break
      case 's':
        keys[enemyType].s = true
        break
    }
  }
});

socket.on('key-up', function (keyName) {
  switch (keyName) {
    case 'd':
      keys[enemyType].d = false
      break
    case 'a':
      keys[enemyType].a = false
      break
    case 'w':
      keys[enemyType].w = false
      break
    case 's':
      keys[enemyType].s = false
      break
  }
});

function getFighterDirection(x1, x2) {
  if (x1 >= x2) {
    return -1
  } else {
    return 1
  }
}

function checkAttackIsSuccess(attacker, victim) {
  if (attacker.state != 'attack1' && attacker.state != 'attack2') {
    return false
  }

  if (attacker.currentFrame != attacker.attackFrame) {
    return false
  }

  if (attacker.framesElapsed % attacker.framesHold === 0) {
    attacker.setAttackBoxMinMaxPosition()

    xMin = victim.position.x
    xMax = victim.position.x + victim.width

    if (attacker.getAttackBoxPosition().y + attacker.atackBox.height >= victim.position.y) {
      if (xMin < attacker.attackBoxXMin && xMax > attacker.attackBoxXMin) {
        return true
      }

      if (xMin > attacker.attackBoxXMin && xMax < attacker.attackBoxXMax) {
        return true
      }

      if (xMin < attacker.attackBoxXMax && xMax > attacker.attackBoxXMax) {
        return true
      }
    }
  }
}