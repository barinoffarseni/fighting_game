class SpriteStatic {
    constructor({ position, imgSrc }) {
        this.position = position
        this.img = new Image()
        this.img.src = imgSrc
    }

    render() {
        ctx.drawImage(this.img,
            this.position.x,
            this.position.y
        )
    }

    update() {}
}

class SpriteAnimated extends SpriteStatic {
    constructor({ position, imgSrc, scale , framesHold, imgFrames, offset }) {
        super({ position, imgSrc });

        this.dx = 0
        this.dy = 0
        this.framesElapsed = 0

        this.framesHold = framesHold
        this.scale = scale
        this.imgFrames = imgFrames
        this.offset = offset

        this.currentFrame = 0
        this.animateIsComplete = false
        this.compliteAnimationAndStop = false
        this.stop = false
    }

    render() {
        ctx.drawImage(
            this.img,
            this.dx,
            this.dy,
            this.img.width / this.imgFrames,
            this.img.height,
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            this.img.width / this.imgFrames * this.scale,
            this.img.height * this.scale
        )
    }

    update() {
        if (!this.stop) {
            this.framesElapsed++
            this.animateIsComplete = false

            if (this.framesElapsed % this.framesHold === 0) {
                this.currentFrame++

                if (this.currentFrame == this.imgFrames) {
                    this.currentFrame = 0
                    this.animateIsComplete = true

                    if (this.compliteAnimationAndStop) {
                        this.stop = true
                        this.currentFrame = this.imgFrames - 1
                    }
                }
            }
        }

        this.dx = this.currentFrame * this.img.width / this.imgFrames
    }
}

class Fighter extends SpriteAnimated {
    constructor({position, velocity, sprites, offset, attackFrame}) {
        super({
            position,
            imgSrc: './img/samuraiMack/Idle.png',
            scale: 2.5,
            framesHold: 10,
            imgFrames: 8,
            offset: offset
        })
        this.position = position
        this.velocity = velocity
        this.width = 50
        this.height = 150
        this.atackBox = {
            position: this.position,
            width: 160,
            height: 90,
            direction: 1,
            offset: {
                x: 80,
                y: 0
            }
        }
        this.isAttack = false
        this.attackFrame = attackFrame
        this.health = 100
        this.previousHealth = 100
        this.sprites = sprites
        this.attack = false;
        this.state = 'idle'
        this.newState = 'idle'
        this.stateCanBeChanged = true
        this.canJump = false
        this.loserStatus = false
    }

    getPosition() {
        return this.position
    }

    getAttackBoxPosition() {
        if (this.atackBox.direction > 0) {
            return {
                x :this.position.x + this.atackBox.offset.x,
                y :this.position.y + this.atackBox.offset.y
            }
        } else {
            return {
                x: this.position.x + this.width - this.atackBox.offset.x,
                y: this.position.y + this.atackBox.offset.y
            }
        }
    }

    render() {
        super.render()

        if (debug) {
            ctx.fillStyle = 'red'
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

            ctx.fillStyle = 'gray'
            if (this.state == 'attack1' && this.currentFrame == this.attackFrame) {
                ctx.fillStyle = 'yellow'
            }

            ctx.fillRect(this.getAttackBoxPosition().x, this.getAttackBoxPosition().y, this.atackBox.width * this.atackBox.direction, this.atackBox.height)
        }
    }

    setState() {
        if (this.state == 'attack1' && this.animateIsComplete) {
            this.stateCanBeChanged = true
        }

        if (this.state == 'takeHit' && this.animateIsComplete) {
            this.stateCanBeChanged = true
        }

        if (this.state == 'takeHit' && this.newState == 'attack1') {
            this.stateCanBeChanged = true
        }

        if (this.state != this.newState && this.stateCanBeChanged) {
            this.state = this.newState

            this.img.src = this.sprites[this.state].src
            this.imgFrames = this.sprites[this.state].frames
            this.currentFrame = 0
            this.framesElapsed = 0

            if (this.state == 'attack1') {
                this.stateCanBeChanged = false
            }

            if (this.state == 'takeHit') {
                this.stateCanBeChanged = false
            }

            if (this.state == 'death') {
                this.compliteAnimationAndStop = true
            }
        }
    }

    setAttackBoxMinMaxPosition() {
        if (this.atackBox.direction > 0) {
            this.attackBoxXMin = this.getAttackBoxPosition().x
            this.attackBoxXMax = this.getAttackBoxPosition().x + this.atackBox.width * this.atackBox.direction
        } else {
            this.attackBoxXMin = this.getAttackBoxPosition().x + this.atackBox.width * this.atackBox.direction
            this.attackBoxXMax = this.getAttackBoxPosition().x
        }
    }

    update() {
        if (this.state != 'death') {
            this.newState = 'idle';
    
            if (this.velocity.x != 0) {
                this.newState = 'run';
            }

            if (this.velocity.y < 0) {
                this.newState = 'jump';
            }

            if (this.velocity.y > 0) {
                this.newState = 'fall';
            }

            if (this.health < this.previousHealth) {
                this.newState = 'takeHit';
                this.previousHealth = this.health
            }

            if (this.attack) {
                this.newState = 'attack1';
            }
    
            if (this.health <= 0) {
                this.newState = 'death';
            }

            this.setState()
        }


        if (this.state == 'death') {
            this.velocity.x = 0
            if (this.velocity.y < 0) {
                this.velocity.y = 0
            }
            this.loserStatus = true
        }

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y + this.height >= canvas.height - 96) {
            this.velocity.y = 0
            this.position.y = canvas.height - 96 - this.height
            this.canJump = true
        } else {
            this.velocity.y += gravity
            this.canJump = false
        }

        super.update()
    }
}

class Indicator {
    constructor({ position, color, width, height, offset }) {
        this.position = position
        this.color = color
        this.width = width
        this.height = height
        this.offset = offset
    }

    render() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)
    }
}

class WinBar extends Indicator{
    constructor() {
        super({
            position: {
                x: 30,
                y: 83
            },
            color: 'grey',
            width: 100,
            height: 100,
        })

        this.text = {
            position: this.position,
            style: 'bold 48px serif'
        }
    }

    update() {}

    render() {
        console.log(this.position)
        ctx.fillStyle = this.color
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

        ctx.font = this.text.style
        ctx.strokeText(0, this.text.position.x, this.text.position.y)
    }
}

class Timer extends Indicator {
    constructor() {
        super({
            position: {
                x: canvas.width / 2,
                y: 10
            },
            color: 'grey',
            width: 100,
            height: 100,
            offset: {
                x: -50,
                y: 0
            },
        })

        this.text = {
            position: {
                x: canvas.width / 2,
                y: 75
            },
            offset: {
                x: -23,
                y: 0
            },
            style: 'bold 48px serif'
        }

        this.timeRemaining = 60
        this.startTimer()
    }

    update() {}

    render() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)

        ctx.font = this.text.style
        ctx.strokeText(this.timeRemaining, this.text.position.x + this.text.offset.x, this.text.position.y + this.text.offset.y)
    }

    startTimer() {
        const intervalId = setInterval(() => {
            if (this.timeRemaining <= 0) {
                clearInterval(intervalId)
            } else {
                this.timeRemaining--
            }
        }, 1000)
    }
}

class HealthBar extends Indicator {
    constructor({ offset, direction, entity }) {
        super({
            position: {
                x: canvas.width / 2,
                y: 10
            },
            color: 'green',
            width: 417,
            height: 70,
            offset: offset
        })
        this.maxWidth =  417
        this.direction = direction
        this.healthValue = 1
        this.entity = entity
    }

    render() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.maxWidth * this.direction * this.healthValue, this.height)
    }

    update() {
        this.healthValue = this.entity.health * 100 / 10000
    }
}
