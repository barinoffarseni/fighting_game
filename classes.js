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
    constructor({ position, imgSrc, scale , framesHold, imgFrames, offset}) {
        this.position = position
        this.width = 50
        this.height = 150
        this.img = new Image()
        this.img.src = imgSrc
        this.dx = 0
        this.dy = 0
        this.framesElapsed = 0
        this.framesHold = framesHold
        this.scale = scale
        this.imgFrames = imgFrames
        this.offset = offset
    }

    draw() {
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

    animate() {
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            this.dx += this.img.width / this.imgFrames
            if (this.dx >= this.img.width) {
                this.dx = 0
            }
        }
    }

    update() {
        this.draw()
        this.animate()
    }
}

class Fighter extends SpriteAnimated {
    constructor({ position, velocity }) {
        super({
            position,
            imgSrc: './img/samuraiMack/Idle.png',
            scale: 2.5,
            framesHold: 10,
            imgFrames: 8,
            offset: {
                x: -215,
                y: -155
            }
        })
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
        this.sprites = {
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
            }
        }
        this.condition = 'idle'
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

    conditionSet(condition) {
        if (this.condition != condition) {
            this.condition = condition
            switch (condition) {
                case 'idle':
                    this.img.src = this.sprites.idle.src
                    this.imgFrames = this.sprites.idle.frames
                    this.dx = 0
                    break;
                case 'run':
                    this.img.src = this.sprites.run.src
                    this.imgFrames = this.sprites.run.frames
                    this.dx = 0
                    break;
                case 'jump':
                    this.img.src = this.sprites.jump.src
                    this.imgFrames = this.sprites.jump.frames
                    this.dx = 0
                    break;
                case 'fall':
                    this.img.src = this.sprites.fall.src
                    this.imgFrames = this.sprites.fall.frames
                    this.dx = 0
                    break;

                default:
                    break;
            }
        }
    }

    // draw() {
    //     ctx.fillStyle = 'red'
    //     ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    //     if (this.isAttack) {
    //         ctx.fillStyle = 'yellow'
    //         ctx.fillRect(this.getAttackBoxPosition().x, this.getAttackBoxPosition().y, this.atackBox.width * this.atackBox.widthDirection, this.atackBox.height)
    //     }
    // }

    update() {
        this.draw()
        this.animate()

        if (this.velocity.x != 0) {
            this.conditionSet('run');
        } else {
            this.conditionSet('idle');
        }

        if (this.velocity.y < 0) {
            this.conditionSet('jump')
        }

        if (this.velocity.y > 0) {
            this.conditionSet('fall')
        }

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

