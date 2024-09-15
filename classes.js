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
    constructor({ position, imgSrc, scale , framesHold, imgFrames, offset}) {
        super({ position, imgSrc });

        this.dx = 0
        this.dy = 0
        this.framesElapsed = 0

        this.framesHold = framesHold
        this.scale = scale
        this.imgFrames = imgFrames
        this.offset = offset

        this.canChangeAnimation = false
        this.currentFrame = 0
        this.stopAnimate = false
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
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            this.currentFrame++

            if (this.currentFrame == this.imgFrames) {
                this.currentFrame = 0
            }
        }

        this.dx = this.currentFrame * this.img.width / this.imgFrames
    }
}

class Fighter extends SpriteAnimated {
    constructor({ position, velocity, sprites, offset, attackFrame}) {
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
            widthDirection: 1,
            offset: {
                x: 80,
                y: 0
            }
        }
        this.isAttack = false
        this.attackFrame = attackFrame
        this.health = 100
        this.sprites = sprites
        this.attack = false;
        this.state = 'idle'
        this.newState = 'idle'
    }

    getPosition() {
        return this.position
    }

    getAttackBoxPosition() {
        if (this.atackBox.widthDirection > 0) {
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

    // conditionSet(newCondition) {
    //     if (this.condition == 'attack1' && this.canChangeAnimation == false) {
    //         return
    //     }

    //     if (this.condition == 'death') {
    //         if (this.currentFrame == this.imgFrames - 1) {
    //             this.currentFrame = this.imgFrames - 1
    //             this.stopAnimate = true
    //         }
    //         return
    //     }

    //     if (this.condition == 'takeHit' && this.canChangeAnimation == false) {
    //         return
    //     }

    //     if (this.condition != newCondition) {
    //         this.condition = newCondition
    //         switch (newCondition) {
    //             case 'idle':
    //                 this.img.src = this.sprites.idle.src
    //                 this.imgFrames = this.sprites.idle.frames
    //                 this.currentFrame = -1
    //                 break;
    //             case 'run':
    //                 this.img.src = this.sprites.run.src
    //                 this.imgFrames = this.sprites.run.frames
    //                 this.currentFrame = -1
    //                 break;
    //             case 'jump':
    //                 this.img.src = this.sprites.jump.src
    //                 this.imgFrames = this.sprites.jump.frames
    //                 this.currentFrame = -1
    //                 break;
    //             case 'fall':
    //                 this.img.src = this.sprites.fall.src
    //                 this.imgFrames = this.sprites.fall.frames
    //                 this.currentFrame = -1
    //                 break;
    //             case 'attack1':
    //                 this.img.src = this.sprites.attack1.src
    //                 this.imgFrames = this.sprites.attack1.frames
    //                 this.currentFrame = -1
    //                 this.canChangeAnimation = false
    //                 break;
    //             case 'attack2':
    //                 this.img.src = this.sprites.attack2.src
    //                 this.imgFrames = this.sprites.attack2.frames
    //                 this.currentFrame = -1
    //                 break;
    //             case 'takeHit':
    //                 this.img.src = this.sprites.takeHit.src
    //                 this.imgFrames = this.sprites.takeHit.frames
    //                 this.currentFrame = -1
    //                 this.canChangeAnimation = false
    //                 break;
    //             case 'death':
    //                 this.img.src = this.sprites.death.src
    //                 this.imgFrames = this.sprites.death.frames
    //                 this.currentFrame = -1
    //                 break;

    //             default:
    //                 break;
    //         }
    //     }
    // }

    // draw() {
    //     ctx.fillStyle = 'red'
    //     ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    //     if (this.isAttack) {
    //         ctx.fillStyle = 'yellow'
    //         ctx.fillRect(this.getAttackBoxPosition().x, this.getAttackBoxPosition().y, this.atackBox.width * this.atackBox.widthDirection, this.atackBox.height)
    //     }
    // }

    // render() {}

    setState() {
        if (this.state != this.newState) {
            this.state = this.newState
            switch (this.state) {
                case 'idle':
                    this.img.src = this.sprites.idle.src
                    this.imgFrames = this.sprites.idle.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    break;
                case 'run':
                    this.img.src = this.sprites.run.src
                    this.imgFrames = this.sprites.run.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    break;
                case 'jump':
                    this.img.src = this.sprites.jump.src
                    this.imgFrames = this.sprites.jump.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    break;
                case 'fall':
                    this.img.src = this.sprites.fall.src
                    this.imgFrames = this.sprites.fall.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    break;
                case 'attack1':
                    this.img.src = this.sprites.attack1.src
                    this.imgFrames = this.sprites.attack1.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    this.canChangeAnimation = false
                    break;
                case 'attack2':
                    this.img.src = this.sprites.attack2.src
                    this.imgFrames = this.sprites.attack2.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    break;
                case 'takeHit':
                    this.img.src = this.sprites.takeHit.src
                    this.imgFrames = this.sprites.takeHit.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    this.canChangeAnimation = false
                    break;
                case 'death':
                    this.img.src = this.sprites.death.src
                    this.imgFrames = this.sprites.death.frames
                    this.currentFrame = 0
                    this.framesElapsed = 0
                    break;

                default:
                    break;
            }
        }
    }

    update() {
        // this.draw()
        // this.animate()

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

        if (this.attack) {
            this.newState = 'attack1';
        }

        this.setState()

        setAttackBoxMinMaxPosition(this)

        // ctx.fillRect(this.attackBoxXMin, this.getAttackBoxPosition().y, this.atackBox.width, this.atackBox.height)
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y + this.height >= canvas.height - 96) {
            this.velocity.y = 0
            this.position.y = canvas.height - 96 - this.height
        } else {
            this.velocity.y += gravity
        }

        console.log(this.state);

        super.update()
    }

    // attack() {
    //     if (this.state != 'attack1') {
    //         this.setState('attack1')
    //         this.isAttack = true
    //     }
    // }

    // tryAttack(enemy) {
    //     if (this.isAttack && checkAttackIsSuccess(this, enemy) && this.attackFrame == this.currentFrame) {
    //         if (enemy.health > 0) {
    //             enemy.health -= 10
    //         }

    //         if (enemy.health <= 0) {
    //             enemy.health = 0
    //             enemy.conditionSet('death')
    //         } else {
    //             enemy.conditionSet('takeHit')
    //         }

    //         this.isAttack = false
    //     }
    // }
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
    constructor({ offset, direction }) {
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
    }

    draw(healthPercent) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.maxWidth * this.direction * healthPercent, this.height)
    }
}
