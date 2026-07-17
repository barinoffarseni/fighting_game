export class Room {
  constructor () {
    this.id = crypto.randomUUID(),
    this.players = {},
    this.gameObjects = [],
    this.fighters = {},
    this.gameTimer = null
    this.waitTimer = null
    this.gameObjects = [],
    this.state = 'start',
    this.fightersData = {}
    this.gameOver = false
  }

  update () {
    this.gameObjects.forEach(gameObject => {
      gameObject.update()
    })
  }
}
