class Fighter {
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
        this.health = 100
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
        
        if (this.position.y + this.height >= canvas.height - 96) {
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

    tryAttack(enemy) {
        if (this.isAttack && checkAttackIsSuccess(this, enemy)) {
            console.log("attack success")
            enemy.health -= 10
        }
    }
}

class SpriteStatic {
    constructor({ position, imgSrc }) {
        this.position = position
        this.width = 50
        this.height = 150
        this.img = new Image()
        this.img.src = imgSrc
    }

    draw() {
        ctx.drawImage(this.img,
            this.position.x,
            this.position.y
        )
    }

    update() {
        this.draw()
    }
}

class SpriteAnimated {
    constructor({ position, imgSrc }) {
        this.position = position
        this.width = 50
        this.height = 150
        this.img = new Image()
        this.img.src = imgSrc
        this.dx = 0
        this.dy = 0
        this.framesElapsed = 0
        this.framesHold = 10
        this.scale = 2
    }

    draw() {


        ctx.drawImage(
            this.img,
            this.dx,
            this.dy,
            this.img.width / 6,
            this.img.height,
            this.position.x,
            this.position.y,
            this.img.width / 6,
            this.img.height
        )
    }

    update() {
        this.draw()
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            this.dx += this.img.width / 6
            if (this.dx >= this.img.width) {
                this.dx = 0
            }
        }
    }
}

