const gravity = 0.2

export class Fighter {
  constructor({ position, velocity }) {
    this.health = 100
    this.width = 50
    this.height = 150
    this.position = position
    this.velocity = velocity
    this.canJump = false
    this.vector = 'fixedly'
  }

  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height >= 576 - 96) {
      this.velocity.y = 0
      this.position.y = 576 - 96 - this.height
      this.canJump = true
    } else {
      this.velocity.y += gravity
      this.canJump = false
    }
    this.velocity.x = 0

    this.vector = 'fixedly'
  }
}