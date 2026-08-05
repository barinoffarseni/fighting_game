class SpriteStatic {
  constructor ({ position, imgSrc, width, height }) {
    this.position = position
    this.img = new Image()
    this.img.src = imgSrc
    this.width = width
    this.height = height
  }

  render () {
    ctx.drawImage(this.img, this.position.x, this.position.y, this.width, this.height)
  }

  update () { }
}

class SpriteAnimated extends SpriteStatic {
  constructor ({ position, imgSrc, scale, framesHold, imgFrames, offset }) {
    super({ position, imgSrc })

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

  render () {
    ctx.drawImage(
      this.img,
      this.dx,
      this.dy,
      this.img.width / this.imgFrames,
      this.img.height,
      this.position.x + this.offset.x,
      this.position.y + this.offset.y,
      (this.img.width / this.imgFrames) * this.scale,
      this.img.height * this.scale
    )
  }

  update () {
    if (!this.stop) {
      this.framesElapsed++
      this.animateIsComplete = false

      if (this.framesElapsed % this.framesHold === 0) {
        this.currentFrame++

        if (this.currentFrame === this.imgFrames) {
          this.animateIsComplete = true

          if (this.compliteAnimationAndStop) {
            this.stop = true
            this.currentFrame = this.imgFrames - 1
          } else {
            this.currentFrame = 0
          }
        }
      }
    }

    this.dx = (this.currentFrame * this.img.width) / this.imgFrames
  }
}

class Fighter extends SpriteAnimated {
  constructor ({ velocity, sprites, offset, attackFrame, name, position, textureMirroring }) {
    super({
      position,
      imgSrc: `./img/${name}/Idle.png`,
      scale: 2.5,
      framesHold: 10,
      imgFrames: sprites.idle.frames,
      offset
    })
    this.position = position
    this.velocity = velocity
    this.width = 50
    this.height = 150
    this.textureMirroring = textureMirroring
    this.isAttack = false
    this.attackFrame = attackFrame
    this.sprites = sprites
    this.state = 'idle'
    this.newState = 'idle'
    this.stateCanBeChanged = true
    this.canJump = false
    this.restartState = false
    this.command = 'idle'
    this.attackFrame = attackFrame
    this.name = name
    this.getScr()
  }

  getPosition () {
    return this.position
  }

  render () {
    super.render()

    if (debug) {
      ctx.fillStyle = 'red'
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

      ctx.fillStyle = 'gray'
      if (this.state === 'attack1' || (this.state === 'attack2' && this.currentFrame === this.attackFrame)) {
        ctx.fillStyle = 'yellow'
      }

      if (this.attackBox) {
        ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width * this.textureMirroring, this.attackBox.height)
      }
    }
  }

  setState () {
    if (this.state === 'attack1' && this.animateIsComplete) {
      this.stateCanBeChanged = true
    }

    if (this.state === 'attack2' && this.animateIsComplete) {
      this.stateCanBeChanged = true
    }

    if (this.state === 'takeHit' && this.animateIsComplete) {
      this.stateCanBeChanged = true
    }

    if (this.state === 'takeHit' && this.newState === 'attack1') {
      this.stateCanBeChanged = true
    }

    if (this.state === 'takeHit' && this.newState === 'takeHit') {
      this.restartState = true
    }

    if ((this.state != this.newState && this.stateCanBeChanged) || this.restartState) {
      this.state = this.newState

      this.currentFrame = 0
      this.framesElapsed = 0

      if (this.state === 'attack1') {
        this.stateCanBeChanged = false
      }

      if (this.state === 'attack2') {
        this.stateCanBeChanged = false
      }

      if (this.state === 'takeHit') {
        this.stateCanBeChanged = false
        this.restartState = false
      }

      if (this.state === 'death') {
        this.compliteAnimationAndStop = true
      }
    }

    if (this.textureMirroring < 0) {
      this.img.src = this.sprites[this.state].leftScr
    } else {
      this.img.src = this.sprites[this.state].rightSrc
    }
    this.imgFrames = this.sprites[this.state].frames
  }

  freez () {
    this.velocity.x = 0
    if (this.velocity.y < 0) {
      this.velocity.y = 0
    }
  }

  getScr () {
    for (const key of Object.keys(this.sprites)) {
      this.sprites[key].leftScr = './img/' + this.name + '/' + key.replace(key[0], key[0].toUpperCase()) + 'Inverted.png'
      this.sprites[key].rightSrc = './img/' + this.name + '/' + key.replace(key[0], key[0].toUpperCase()) + '.png'
    }
  }

  checkAttackIsSuccess () {
    if (this.state != 'attack1' && this.state != 'attack2') {
      return false
    }

    if (this.currentFrame != this.attackFrame) {
      return false
    }

    if (this.framesElapsed % this.framesHold === 0) {
      socket.emit('check-attack-is-success', { attacker: this.name })
    }
  }

  update () {
    if (this.state != 'death') {
      this.newState = 'idle'

      if (this.command === 'left' || this.command === 'right') {
        this.newState = 'run'
      }

      if (this.command === 'up') {
        this.newState = 'jump'
      }

      if (this.command === 'down') {
        this.newState = 'fall'
      }

      if (this.health < this.previousHealth) {
        this.newState = 'takeHit'
        this.previousHealth = this.health
      }

      if (this.command === 'attack') {
        this.newState = 'attack1'
      }

      if (this.state === 'attack1' && this.command === 'attack') {
        this.newState = 'attack2'
      }

      if (this.health <= 0) {
        this.newState = 'death'
      }
      this.setState()
    }

    super.update()
  }
}

class Indicator {
  constructor ({ position, color, width, height, offset }) {
    this.position = position
    this.color = color
    this.width = width
    this.height = height
    this.offset = offset
  }

  render () {
    ctx.fillStyle = this.color
    ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)
  }
}

class WinIndicator extends Indicator {
  constructor () {
    super({
      position: {
        x: canvas.width / 2,
        y: canvas.height / 2
      },
      offset: {
        x: -180,
        y: -90
      },
      color: 'grey',
      width: 360,
      height: 60
    })

    this.text = {
      position: this.position,
      style: '40px "Silkscreen", monospace',
      color: '#F3E7A1',
      offset: {
        x: 0,
        y: -50
      }
    }
    this.winner = ''
  }

  update () { }

  render () {
    if (gameState === 'over') {
      ctx.fillStyle = '#6F4E8E'
      ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)
      ctx.fillStyle = '#8265a0'
      ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, 14)
      ctx.fillStyle = '#5f4778'
      ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, 5, this.height)
      ctx.fillStyle = '#4D3566'
      ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y + this.height - 18, this.width, 18)
      ctx.fillRect(this.position.x + this.offset.x + this.width - 5, this.position.y + this.offset.y, 5, this.height)
      ctx.fillStyle = '#2D1F3C'
      ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y + this.height - 15, this.width, 15)

      ctx.font = this.text.style
      ctx.fillStyle = this.text.color
      ctx.textAlign = 'center'
      ctx.fillText(this.winner + ' WIN', this.text.position.x, this.text.position.y + this.text.offset.y)
      ctx.strokeText(this.winner + ' WIN', this.text.position.x, this.text.position.y + this.text.offset.y)
    }
  }
}

class WaitTimer {
  constructor () {
    this.text = {
      position: {
        x: canvas.width / 2,
        y: canvas.height / 2
      },
      offset: {
        x: 0,
        y: -30
      },
      style: '47px "Pixelify Sans", monospace'
    }
    this.aWaitTimerExists = false
  }

  update () { }

  render () {
    if (gameState === 'stop') {
      ctx.font = this.text.style
      ctx.textAlign = 'center'
      ctx.lineWidth = 2
      ctx.fillStyle = 'red'
      ctx.fillText(this.timeRemaining, this.text.position.x, this.text.position.y + this.text.offset.y)
      ctx.strokeText(this.timeRemaining, this.text.position.x, this.text.position.y + this.text.offset.y)
    }
  }
}

class Timer extends SpriteStatic {
  constructor (position, imgSrc, width, height) {
    super(position, imgSrc, width, height)

    this.text = {
      position: {
        x: canvas.width / 2,
        y: 75
      },
      offset: {
        x: 0,
        y: 0
      },
      style: '47px "Pixelify Sans", monospace'
    }
  }

  update () { }

  render () {
    super.render()

    if (this.timeRemaining || this.timeRemaining === 0) {
      ctx.font = this.text.style
      ctx.fillStyle = 'rgba(248, 243,	186)'
      ctx.lineWidth = 2
      ctx.textAlign = 'center'
      ctx.fillText(this.timeRemaining, this.text.position.x, this.text.position.y + this.text.offset.y)
      ctx.strokeText(this.timeRemaining, this.text.position.x, this.text.position.y + this.text.offset.y)
    }
  }
}

class Frame extends SpriteStatic {
  constructor ({ position, imgSrc, width, height }) {
    super(
      {
        position,
        imgSrc,
        width,
        height
      }
    )
    this.isVisible = false
  }

  update () { }

  render () {
    if (this.isVisible) {
      super.render()
    }
  }
}

class HealthBar extends Indicator {
  constructor ({ offset, textureMirroring, entity }) {
    super({
      position: {
        x: canvas.width / 2,
        y: 26
      },
      color: 'green',
      width: 393,
      height: 45,
      offset
    })
    this.maxWidth = 393
    this.textureMirroring = textureMirroring
    this.healthValue = 1
    this.entity = entity
  }

  render () {
    ctx.fillStyle = '#3f3656'
    ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width * this.textureMirroring, this.height)
    ctx.fillStyle = '#ad3e55'
    ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.maxWidth * this.textureMirroring * this.healthValue, this.height)

    if (this.healthValue !== 0) {
      ctx.fillStyle = '#d95a70'
      ctx.fillRect(
        this.position.x + this.offset.x + (4 * this.textureMirroring),
        this.position.y + this.offset.y + 4,
        this.maxWidth * this.textureMirroring * this.healthValue - (8 * this.textureMirroring),
        6
      )
      ctx.fillStyle = '#7f2b3e'
      ctx.fillRect(
        this.position.x + this.offset.x + (4 * this.textureMirroring),
        this.position.y + this.offset.y + this.height - 7,
        this.maxWidth * this.textureMirroring * this.healthValue - (8 * this.textureMirroring),
        4
      )
      ctx.fillRect(
        this.position.x + this.offset.x,
        this.position.y + this.offset.y,
        9 * this.textureMirroring,
        this.height
      )
      ctx.fillRect(
        this.position.x + this.offset.x + this.maxWidth * this.textureMirroring * this.healthValue - (9 * this.textureMirroring),
        this.position.y + this.offset.y,
        9 * this.textureMirroring,
        this.height
      )
    }
  }

  update () {
    if (this.entity.health >= 0) {
      this.healthValue = (this.entity.health * 100) / 10000
    }
  }
}

class Button {
  constructor (mouse) {
    this.position = {
      x: canvas.width / 2,
      y: canvas.height / 1.6
    }
    this.offset = {
      x: -120,
      y: -50
    }
    this.text = {
      position: this.position,
      offset: {
        x: 0,
        y: -10
      },
      offsetUponPressing: {
        x: 0,
        y: 0
      },
      style: '40px "Silkscreen", monospace'
    }
    this.color = 'rgba(83, 64, 99)'
    this.width = 240
    this.height = 55
    this.mouse = mouse
    this.minX = this.position.x + this.offset.x
    this.maxX = this.position.x + this.offset.x + this.width
    this.minY = this.position.y + this.offset.y
    this.maxY = this.position.y + this.offset.y + this.height
    this.state = 'idle'
    this.isActive()
  }

  isActive () {
    function getCanvasMousePosition (event) {
      const rect = canvas.getBoundingClientRect()

      return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
      }
    }

    canvas.addEventListener('mousedown', function (event) {
      if (gameState === 'over' || gameState === 'stop') {
        const { x: mouseX, y: mouseY } = getCanvasMousePosition(event)

        if (mouseX > restartButton.minX && mouseX < restartButton.maxX && mouseY > restartButton.minY && mouseY < restartButton.maxY) {
          restartButton.state = 'pressed'
        } else {
          restartButton.state = 'idle'
        }
      }
    })

    canvas.addEventListener('mouseup', function (event) {
      if (gameState === 'over' || gameState === 'stop') {
        const { x: mouseX, y: mouseY } = getCanvasMousePosition(event)

        if (mouseX > restartButton.minX && mouseX < restartButton.maxX && mouseY > restartButton.minY && mouseY < restartButton.maxY) {
          location.reload()
        } else {
          restartButton.state = 'idle'
        }
      }
    })

    canvas.addEventListener('mousemove', function (event) {
      if (gameState === 'over' || gameState === 'stop') {
        const { x: mouseX, y: mouseY } = getCanvasMousePosition(event)

        if (restartButton.state !== 'pressed') {
          if (mouseX > restartButton.minX && mouseX < restartButton.maxX && mouseY > restartButton.minY && mouseY < restartButton.maxY) {
            restartButton.state = 'hover'
          } else {
            restartButton.state = 'idle'
          }
        }
      }
    })
  }

  update () {

  }

  render () {
    if (gameState === 'over' || gameState === 'stop') {
      if (this.state === 'idle') {
        ctx.fillStyle = '#6F4E8E'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)
        ctx.fillStyle = '#885fb1'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, 12)
        ctx.fillStyle = '#4D3566'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y + this.height - 13, this.width, 13)
        ctx.fillRect(this.position.x + this.offset.x + this.width - 8, this.position.y + this.offset.y, 8, this.height)
        ctx.fillStyle = '#705a88'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, 8, this.height)
        ctx.fillStyle = '#2D1F3C'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y + this.height - 10.5, this.width, 10.5)
      }

      if (this.state === 'hover') {
        ctx.fillStyle = '#A97DCC'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)
        ctx.fillStyle = '#c09ee2'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, 12)
        ctx.fillStyle = '#7b6397'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y + this.height - 13, this.width, 13)
        ctx.fillRect(this.position.x + this.offset.x + this.width - 8, this.position.y + this.offset.y, 8, this.height)
        ctx.fillStyle = '#7e6796'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, 8, this.height)
      }

      if (this.state === 'pressed') {
        ctx.fillStyle = '#4D3566'
        ctx.fillRect(this.position.x + this.offset.x, this.position.y + this.offset.y, this.width, this.height)
      }

      ctx.fillStyle = '#F3E7A1'
      this.text.offsetUponPressing.y = 0
      if (this.state === 'pressed') {
        ctx.fillStyle = '#3A2A18'
        this.text.offsetUponPressing.y = 3
      }
      ctx.font = this.text.style
      ctx.textAlign = 'center'
      ctx.fillText('Restart', this.text.position.x, this.text.position.y + this.text.offset.y + this.text.offsetUponPressing.y)
      ctx.strokeText('Restart', this.text.position.x, this.text.position.y + this.text.offset.y + this.text.offsetUponPressing.y)
    }
  }
}
