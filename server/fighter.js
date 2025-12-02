const gravity = 0.2

export class Fighter {
  constructor ({ position, velocity }) {
    this.health = 100
    this.width = 50
    this.height = 150
    this.position = position
    this.velocity = velocity
    this.canJump = false
    this.direction = 'fixedly'
  }

  update () {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height >= 576 - 96) {
      this.velocity.y = 0
      this.position.y = 576 - 96 - this.height
      this.canJump = true

      this.direction = 'fixedly'
    } else {
      this.velocity.y += gravity
      this.canJump = false

      if (this.velocity.y > 0) {
        this.direction = 'down'
      }
      if (this.velocity.y < 0) {
        this.direction = 'up'
      }
    }

    this.velocity.x = 0
  }
}
