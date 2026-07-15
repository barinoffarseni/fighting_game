export class Room {
  constructor () {
    this.id = crypto.randomUUID(),
    this.players = {},
    this.gameObjects = [],
    this.fighters = {
      samurai: null,
      ninja: null
    },
    this.gameObjects = [],
    this.state = 'start'
  }

  update () {
  }
}
