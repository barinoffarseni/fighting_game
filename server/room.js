export class Room {
  constructor () {
    this.id = this.setId(),
    this.players = {},
    this.state = 'start'
  }

  setId () {
    return crypto.randomUUID()
  }
}
