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

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const enemy = new Fighter({
    position: {
        x: canvas.width / 2,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    }
})

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
        y: 351
    },
    imgSrc: './img/shop.png'
})

function animate() {
    window.requestAnimationFrame(animate)

    control()
    background.update()
    shop.update()
    player.update()
    enemy.update()

    player.tryAttack(enemy)
    enemy.tryAttack(player)
    
    if (player.health == 0) {
        alert("player is dead")
    }
    if (enemy.health == 0) {
        alert("enemy is dead")
    }

    player.atackBox.widthDirection = GetAttackBoxDirection(player.position.x, enemy.position.x)
    enemy.atackBox.widthDirection = GetAttackBoxDirection(enemy.position.x, player.position.x)
}

animate()

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