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
        this.animateIsEnd = false
        this.currentFrame = 0
        this.stopAnimate = false
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
            if (!this.stopAnimate) {
                this.currentFrame++
            }
            this.animateIsEnd = false;

            if (this.currentFrame == this.imgFrames) {
                this.animateIsEnd = true;
                this.currentFrame = 0
            }

            this.dx = this.currentFrame * this.img.width / this.imgFrames
        }
    }

    update() {
        this.animate()
        this.draw()
    }
}

class Fighter extends SpriteAnimated {
    constructor({ position, velocity, sprites, offset, takingDamageFrameOffSet}) {
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
        this.takingDamageFrameOffSet = takingDamageFrameOffSet
        this.health = 100
        this.sprites = sprites
        this.condition = 'idle'
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

    conditionSet(newCondition) {
        if (this.condition == 'attack1' && this.animateIsEnd == false) {
            return
        }

        if (this.condition == 'death') {
            console.log(this.currentFrame, this.imgFrames);
            if (this.animateIsEnd == true) {
                this.currentFrame = this.imgFrames - 1
                this.stopAnimate = true
            }
            return
        }

        if (this.condition == 'takeHit' && this.animateIsEnd == false) {
            return
        }

        if (this.condition != newCondition) {
            this.condition = newCondition
            switch (newCondition) {
                case 'idle':
                    this.img.src = this.sprites.idle.src
                    this.imgFrames = this.sprites.idle.frames
                    this.currentFrame = 0
                    break;
                case 'run':
                    this.img.src = this.sprites.run.src
                    this.imgFrames = this.sprites.run.frames
                    this.currentFrame = 0
                    break;
                case 'jump':
                    this.img.src = this.sprites.jump.src
                    this.imgFrames = this.sprites.jump.frames
                    this.currentFrame = 0
                    break;
                case 'fall':
                    this.img.src = this.sprites.fall.src
                    this.imgFrames = this.sprites.fall.frames
                    this.currentFrame = 0
                    break;
                case 'attack1':
                    this.img.src = this.sprites.attack1.src
                    this.imgFrames = this.sprites.attack1.frames
                    this.currentFrame = 0
                    break;
                case 'attack2':
                    this.img.src = this.sprites.attack2.src
                    this.imgFrames = this.sprites.attack2.frames
                    this.currentFrame = 0
                    break;
                case 'takeHit':
                    this.img.src = this.sprites.takeHit.src
                    this.imgFrames = this.sprites.takeHit.frames
                    this.currentFrame = 0
                    break;
                case 'death':
                    this.img.src = this.sprites.death.src
                    this.imgFrames = this.sprites.death.frames
                    this.currentFrame = 0
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
    }

    attack() {
        this.conditionSet('attack1')
        this.isAttack = true
    }

    tryAttack(enemy) {
        if (this.isAttack && checkAttackIsSuccess(this, enemy) && this.dx >= this.takingDamageFrameOffSet) {
            console.log("attack success")
            enemy.health -= 10
            if (enemy.health <= 0) {
                enemy.conditionSet('death')
            } else {
                enemy.conditionSet('takeHit')
            }
        }

        if (this.isAttack && this.dx >= this.takingDamageFrameOffSet) {
            this.isAttack = false
        }
    }
}

