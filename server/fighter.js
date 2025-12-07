const gravity = 0.2

export class Fighter {
  constructor({ position, velocity, attackFrame }) {
    this.health = 100
    this.width = 50
    this.height = 150
    this.position = position
    this.velocity = velocity
    this.canJump = false
    this.command = 'idle'
    this.attackFrame = attackFrame
    this.atackBox = {
      position: this.position,
      width: 160,
      height: 90,
      offset: {
        x: 80,
        y: 0
      }
    }
  }

  update() {
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

  getAttackBoxPosition() {
    if (this.vector > 0) {
      return {
        x: this.position.x + this.atackBox.offset.x,
        y: this.position.y + this.atackBox.offset.y
      }
    } else {
      return {
        x: this.position.x + this.width - this.atackBox.offset.x,
        y: this.position.y + this.atackBox.offset.y
      }
    }
  }

  setAttackBoxMinMaxPosition() {
    if (this.vector > 0) {
      this.attackBoxXMin = this.getAttackBoxPosition().x
      this.attackBoxXMax = this.getAttackBoxPosition().x + this.atackBox.width * this.vector
    } else {
      this.attackBoxXMin = this.getAttackBoxPosition().x + this.atackBox.width * this.vector
      this.attackBoxXMax = this.getAttackBoxPosition().x
    }
  }
}
