export class Room {
  constructor () {
    this.id = crypto.randomUUID(),
    this.players = {},
    this.state = 'start'
  }
}
