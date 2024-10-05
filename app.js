const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.2
let gameOver = false

let debug = false

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    up: false,
    left: false,
    down: false,
    right: false
}

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
            src: './img/samuraiMack/Idle.png',
            frames: 8
        },
        run: {
            src: './img/samuraiMack/Run.png',
            frames: 8
        },
        jump: {
            src: './img/samuraiMack/Jump.png',
            frames: 2
        },
        fall: {
            src: './img/samuraiMack/Fall.png',
            frames: 2
        },
        attack1: {
            src: './img/samuraiMack/Attack1.png',
            frames: 6
        },
        attack2: {
            src: './img/samuraiMack/Attack2.png',
            frames: 6
        },
        takeHit: {
            src: './img/samuraiMack/Take Hit.png',
            frames: 4
        },
        death: {
            src: './img/samuraiMack/Death.png',
            frames: 6
        }
    },
    offset: {
        x: -215,
        y: -155
    },
    attackFrame: 4
})

gameObjects.push(player)


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
            src: './img/kenji/Idle.png',
            frames: 4
        },
        run: {
            src: './img/kenji/Run.png',
            frames: 8
        },
        jump: {
            src: './img/kenji/Jump.png',
            frames: 2
        },
        fall: {
            src: './img/kenji/Fall.png',
            frames: 2
        },
        attack1: {
            src: './img/kenji/Attack1.png',
            frames: 4
        },
        attack2: {
            src: './img/kenji/Attack2.png',
            frames: 4
        },
        takeHit: {
            src: './img/kenji/Take Hit.png',
            frames: 3
        },
        death: {
            src: './img/kenji/Death.png',
            frames: 7
        }
    },
    offset: {
        x: -215,
        y: -170
    },
    attackFrame: 1
})

gameObjects.push(enemy)

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
const winIndicator = new WinIndicator(player, enemy)
gameObjects.push(winIndicator)
const restartButton = new Button()
gameObjects.push(restartButton)


function gameLoop() {

    control();
    update();
    render();

    window.requestAnimationFrame(gameLoop);
}

gameLoop()

function control() {
    player.velocity.x = 0
    if (keys.w && player.canJump) {
        player.velocity.y = -10
    }

    if (keys.d) {
        player.velocity.x = 4
    }

    if (keys.a) {
        player.velocity.x = -4
    }

    if (keys.s) {
        player.attack = true
    } else {
        player.attack = false
    }
    
    enemy.velocity.x = 0
    if (keys.up && enemy.canJump) {
        enemy.velocity.y = -10
    }

    if (keys.right) {
        enemy.velocity.x = 4
    }

    if (keys.left) {
        enemy.velocity.x = -4
    }

    if (keys.down) {
        enemy.attack = true
    } else {
        enemy.attack = false
    }
}

function update() {
    player.atackBox.direction = getAttackBoxDirection(player.position.x, enemy.position.x)
    enemy.atackBox.direction = getAttackBoxDirection(enemy.position.x, player.position.x)

    if (checkAttackIsSuccess(player, enemy)) {
        enemy.health -= 10
    }
    
    if (checkAttackIsSuccess(enemy, player)) {
        player.health -= 10
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
            keys.d = false
            break
        case 'a':
            keys.a = false
            break
        case 'w':
            keys.w = false
            break
        case 's':
            keys.s = false
            break

        case 'ArrowRight':
            keys.right = false
            break
        case 'ArrowLeft':
            keys.left = false
            break
        case 'ArrowUp':
            keys.up = false
            break
        case 'ArrowDown':
            keys.down = false
            break
    }
}

window.addEventListener('keydown', keydown)
function keydown(event) {
    if (!gameOver) {
        switch (event.key) {
            case 'd':
                keys.d = true
                break
            case 'a':
                keys.a = true
                break
            case 'w':
                keys.w = true
                break
            case 's':
                keys.s = true
                break


            case 'ArrowRight':
                keys.right = true
                break
            case 'ArrowLeft':
                keys.left = true
                break
            case 'ArrowUp':
                keys.up = true
                break
            case 'ArrowDown':
                keys.down = true
                break
        }
    }
}

function getAttackBoxDirection(x1, x2) {
    if (x1 >= x2) {
        return -1
    } else {
        return 1
    }
}

function checkAttackIsSuccess(attacker, victim) {
    if (attacker.state != 'attack1') {
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