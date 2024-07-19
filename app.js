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

class Sprite {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 50
        this.height = 150
        this.atackBox = {
            position: this.position,
            width: 80,
            height: 50,
            widthDirection: 1
        }
        this.isAttack = false
    }

    getPosition() {
        return this.position
    }

    getAttackBoxPosition() {
        if (this.atackBox.widthDirection > 0) {
            return this.position
        } else {
            return {
                x: this.position.x + this.width,
                y: this.position.y
            }
        }
    }

    draw() {
        ctx.fillStyle = 'red'
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        if (this.isAttack) {
            ctx.fillStyle = 'yellow'
            ctx.fillRect(this.getAttackBoxPosition().x, this.getAttackBoxPosition().y, this.atackBox.width * this.atackBox.widthDirection, this.atackBox.height)
        }
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y + this.height >= canvas.height) {
            this.velocity.y = 0
        } else {
            this.velocity.y += gravity
        }
    }

    attack() {
        this.isAttack = true
        setTimeout(() =>{
            this.isAttack = false
        }, 100)
    }

    bar() {
    if (this.isAttack && checkCollision()) {
        console.log('sssss')
    }}

    getAttackBoxDirection(enemy) {
        if (this.position.x >= enemy) {
            return -1
        } else {
            return 1
        }
    }
}

const player = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const enemy = new Sprite({
    position: {
        x: canvas.width / 2,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    }
})

function animate() {
    window.requestAnimationFrame(animate)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    control()
    player.update()
    enemy.update()

    // if (player.isAttack && checkCollision()) {
    //     console.log('sssss')
    // }
    player.bar()
    enemy.bar()
    
    player.atackBox.widthDirection = player.getAttackBoxDirection(enemy.position.x)
    enemy.atackBox.widthDirection = player.getAttackBoxDirection(player.position.x)
}

function checkCollision() {
    if (player.atackBox.widthDirection > 0) {
        playerAttackBoxXMin = player.getAttackBoxPosition().x
        playerAttackBoxXMax = player.getAttackBoxPosition().x + player.atackBox.width * player.atackBox.widthDirection
    } else {
        playerAttackBoxXMin = player.getAttackBoxPosition().x + player.atackBox.width * player.atackBox.widthDirection
        playerAttackBoxXMax = player.getAttackBoxPosition().x
    }

    enemyXMin = enemy.position.x 
    enemyXMax = enemy.position.x + enemy.width

    if (player.getAttackBoxPosition().y + player.atackBox.height >= enemy.position.y) {

        //   [    ] AttackBox
        // [  ] enemy

        //   b    ] AttackBoxdasd
        // a  c enemy
        // if (a < b && c > b) {
        if (enemyXMin < playerAttackBoxXMin && enemyXMax > playerAttackBoxXMin) {
            return true
        }

        // [    ] AttackBox
        //  [  ] enemy

        // c    d AttackBox
        //  a  b enemy
        // if (a > c && b < d) {

        if (enemyXMin > playerAttackBoxXMin && enemyXMax < playerAttackBoxXMax) {
            return true
        }

        // [    ] AttackBox
        //     [  ] enemy
        if (enemyXMin < playerAttackBoxXMax && enemyXMax > playerAttackBoxXMax) {
            return true
        }
    }
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

// function getAttackBoxDirection(x1, x2) {
//     if (x1 >= x2) {
//         return -1
//     } else {
//         return 1
//     }
// }