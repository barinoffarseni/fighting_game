export class Room {
  constructor () {
    this.id = crypto.randomUUID(),
    this.players = {},
    this.gameObjects = [],
    this.fighters = {},
    this.gameTimer = null
    this.waitTimer = null
    this.gameObjects = [],
    this.gameState = 'start',
    this.fightersData = {}
  }

  update () {
    this.gameObjects.forEach(gameObject => {
      gameObject.update()
    })
  }
}
