canvas = document.querySelector('canvas')
ctx = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// ctx.fillStyle = "black";
// ctx.fillRect(0, 0, canvas.width, canvas.height)

class Sprite {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
    }

    draw() {
        ctx.fillStyle = 'red'
        ctx.fillRect(this.position.x, this.position.y, 50, 150)
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    }
})

const enemy = new Sprite({
    position: {
        x: canvas.width / 2,
        y: 0
    },
    velocity: {
        x: 0,
        y: 1
    }
})

function animate() {
    window.requestAnimationFrame(animate)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()
}

animate()