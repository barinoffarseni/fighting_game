const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.2
let gameOver = false

let debug = false

const keys = {
    player: {
        w: false,
        a: false,
        s: false,
        d: false
    },
    enemy: {
        w: false,
        a: false,
        s: false,
        d: false
    }

}

let user = false
let currentUserType = ''
let oppositeUserType = ''

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


const player = new Fighter({
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


const enemy = new Fighter({
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
    entity: enemy
}))

gameObjects.push(new HealthBar({
    offset: {
        x: -50,
        y: 0
    },
    direction: -1,
    entity: player
}))

const timer = new Timer()
gameObjects.push(timer)

const winIndicator = new WinIndicator(player, enemy, timer)
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
    socket.on('set-data', function({type: type, id: id}) {
        if (!user) {
            user = {type: type, id: id}

            if (user.type == 'player') {
                gameObjects.push(player)

                currentUserType = 'player'
                oppositeUserType = 'enemy'
            }

            if (user.type == 'enemy') {
                gameObjects.push(enemy)
                gameObjects.push(player)

                currentUserType = 'enemy'
                oppositeUserType = 'player'
            }
        } else {
            if (user.type == 'player') {

                gameObjects.push(enemy)
            }
        }
    });

    gameLoop()
}

waitingForPlayers()

function control() {
    player.velocity.x = 0
    if (keys.player.w && player.canJump) {
        player.velocity.y = -10
    }

    if (keys.player.d) {
        player.velocity.x = 4
    }

    if (keys.player.a) {
        player.velocity.x = -4
    }

    if (keys.player.s) {
        player.attack = true
    } else {
        player.attack = false
    }

    enemy.velocity.x = 0
    if (keys.enemy.w && enemy.canJump) {
        enemy.velocity.y = -10
    }

    if (keys.enemy.d) {
        enemy.velocity.x = 4
    }

    if (keys.enemy.a) {
        enemy.velocity.x = -4
    }

    if (keys.enemy.s) {
        enemy.attack = true
    } else {
        enemy.attack = false
    }
}

socket.on('id', function(msg) {
    id = msg
  });

function update() {
    player.direction = getFighterDirection(player.position.x, enemy.position.x)
    enemy.direction = getFighterDirection(enemy.position.x, player.position.x)

    if (checkAttackIsSuccess(player, enemy)) {
        enemy.health -= 10
    }

    if (checkAttackIsSuccess(enemy, player)) {
        player.health -= 10
    }

    if (winIndicator.tie) {
        timer.timeRemaining += 10
        timer.timeOut = false
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
            keys[currentUserType].d = false
            socket.emit('key-up', 'd');
            break
        case 'a':
            keys[currentUserType].a = false
            socket.emit('key-up', 'a');
            break
        case 'w':
            keys[currentUserType].w = false
            socket.emit('key-up', 'w');
            break
        case 's':
            keys[currentUserType].s = false
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
                keys[currentUserType].d = true
                break
            case 'a':
                socket.emit('key-down', 'a');
                keys[currentUserType].a = true
                break
            case 'w':
                socket.emit('key-down', 'w');
                keys[currentUserType].w = true
                break
            case 's':
                socket.emit('key-down', 's');
                keys[currentUserType].s = true
                break
        }
    }
}

socket.on('key-down-two', function(keyName) {
    if (!gameOver) {
        switch (keyName) {
            case 'd':
                keys[oppositeUserType].d = true
                break
            case 'a':
                keys[oppositeUserType].a = true
                break
            case 'w':
                keys[oppositeUserType].w = true
                break
            case 's':
                keys[oppositeUserType].s = true
                break
        }
    }
});

socket.on('key-up-two', function(keyName) {
    switch (keyName) {
        case 'd':
            keys[oppositeUserType].d = false
            break
        case 'a':
            keys[oppositeUserType].a = false
            break
        case 'w':
            keys[oppositeUserType].w = false
            break
        case 's':
            keys[oppositeUserType].s = false
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