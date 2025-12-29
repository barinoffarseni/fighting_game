const gravity = 0.2

export class Fighter {
  constructor ({ position, velocity, attackFrame }) {
    this.attackBoxPositionMirroring = 1
    this.health = 100
    this.width = 50
    this.height = 150
    this.position = position
    this.velocity = velocity
    this.canJump = false
    this.command = 'idle'
    this.attackFrame = attackFrame
    this.attackBox = {
      position: this.position,
      width: 160,
      height: 90,
      offset: {
        x: 80,
        y: 0
      }
    }
  }

  update () {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height >= 576 - 96) {
      this.velocity.y = 0
      this.position.y = 576 - 96 - this.height
      this.canJump = true

      this.command = 'idle'
    } else {
      this.velocity.y += gravity
      this.canJump = false

      if (this.velocity.y > 0) {
        this.command = 'down'
      }
      if (this.velocity.y < 0) {
        this.command = 'up'
      }
    }

    this.velocity.x = 0
  }

  getAttackBoxPosition () {
    if (this.attackBoxPositionMirroring > 0) {
      return {
        x: this.position.x + this.attackBox.offset.x,
        y: this.position.y + this.attackBox.offset.y
      }
    } else {
      return {
        x: this.position.x + this.width - this.attackBox.offset.x,
        y: this.position.y + this.attackBox.offset.y
      }
    }
  }

  setAttackBoxMinMaxPosition () {
    if (this.attackBoxPositionMirroring > 0) {
      this.attackBoxXMin = this.getAttackBoxPosition().x
      this.attackBoxXMax = this.getAttackBoxPosition().x + this.attackBox.width * this.attackBoxPositionMirroring
    } else {
      this.attackBoxXMin = this.getAttackBoxPosition().x + this.attackBox.width * this.attackBoxPositionMirroring
      this.attackBoxXMax = this.getAttackBoxPosition().x
    }
  }
}
