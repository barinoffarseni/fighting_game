const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.2

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

const background = new SpriteStatic({
    position: {
        x: 0,
        y: 0
    },
    imgSrc: './img/background.png'
})

const shop = new SpriteAnimated({
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
})

// const player = new Fighter({
//     position: {
//         x: 0,
//         y: 0
//     },
//     velocity: {
//         x: 0,
//         y: 0
//     },
//     sprites: {
//         idle: {
//             src: './img/samuraiMack/Idle.png',
//             frames: 8
//         },
//         run: {
//             src: './img/samuraiMack/Run.png',
//             frames: 8
//         },
//         jump: {
//             src: './img/samuraiMack/Jump.png',
//             frames: 2
//         },
//         fall: {
//             src: './img/samuraiMack/Fall.png',
//             frames: 2
//         },
//         attack1: {
//             src: './img/samuraiMack/Attack1.png',
//             frames: 6
//         },
//         attack2: {
//             src: './img/samuraiMack/Attack2.png',
//             frames: 6
//         },
//         takeHit: {
//             src: './img/samuraiMack/Take Hit.png',
//             frames: 4
//         },
//         death: {
//             src: './img/samuraiMack/Death.png',
//             frames: 6
//         }
//     },
//     offset: {
//         x: -215,
//         y: -155
//     },
//     attackFrame: 4
// })

// const enemy = new Fighter({
//     position: {
//         x: canvas.width / 2,
//         y: 0
//     },
//     velocity: {
//         x: 0,
//         y: 0
//     },
//     sprites: {
//         idle: {
//             src: './img/kenji/Idle.png',
//             frames: 4
//         },
//         run: {
//             src: './img/kenji/Run.png',
//             frames: 8
//         },
//         jump: {
//             src: './img/kenji/Jump.png',
//             frames: 2
//         },
//         fall: {
//             src: './img/kenji/Fall.png',
//             frames: 2
//         },
//         attack1: {
//             src: './img/kenji/Attack1.png',
//             frames: 4
//         },
//         attack2: {
//             src: './img/kenji/Attack2.png',
//             frames: 4
//         },
//         takeHit: {
//             src: './img/kenji/Take Hit.png',
//             frames: 3
//         },
//         death: {
//             src: './img/kenji/Death.png',
//             frames: 7
//         }
//     },
//     offset: {
//         x: -215,
//         y: -170
//     },
//     attackFrame: 1
// })

// const enemyHealthIndicators = new HealthBar({
//     offset: {
//         x: 50,
//         y: 0
//     },
//     direction: 1
// })

// const playerHealthIndicators = new HealthBar({
//     offset: {
//         x: -50,
//         y: 0
//     },
//     direction: -1
// })

// const timer = new Timer()

const gameObjects = [
    background,
    shop,
    // player,
    // enemy,
    // enemyHealthIndicators,
    // playerHealthIndicators,
    // timer
]

function update() {
    gameObjects.forEach(gameObject => {
        gameObject.update()
    })
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    gameObjects.forEach(gameObject => {
        gameObject.render(ctx)
    })
}

function gameLoop() {

    update();
    render();

    // control()
    // background.update()
    // shop.update()
    // player.update()
    // enemy.update()

    // enemyHealthIndicators.draw(enemy.health * 100 / 10000)
    // playerHealthIndicators.draw(player.health * 100 / 10000)
    // timer.draw()

    // player.tryAttack(enemy)
    // enemy.tryAttack(player)

    // // if (player.health == 0) {
    // //     alert("player is dead")
    // // }
    // // if (enemy.health == 0) {
    // //     alert("enemy is dead")
    // // }

    // player.atackBox.widthDirection = GetAttackBoxDirection(player.position.x, enemy.position.x)
    // enemy.atackBox.widthDirection = GetAttackBoxDirection(enemy.position.x, player.position.x)

    window.requestAnimationFrame(gameLoop);
}

gameLoop()

function control() {
    player.velocity.x = 0
    if (keys.w) {
        player.velocity.y = -10
    }

    if (keys.d) {
        player.velocity.x = 1
    }

    if (keys.a) {
        player.velocity.x = -1
    }

    if (keys.s) {
        player.attack()
    }

    enemy.velocity.x = 0
    if (keys.up) {
        enemy.velocity.y = -10
    }

    if (keys.right) {
        enemy.velocity.x = 1
    }

    if (keys.left) {
        enemy.velocity.x = -1
    }

    if (keys.down) {
        enemy.attack()
    }
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