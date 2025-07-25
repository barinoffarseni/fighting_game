// export class WinIndicator {
//   constructor(health1, health2, timer) {
//     this.health1 = health1
//     this.health2 = health2
//     this.timer = timer
//     this.winner = 'jopa'
//     this.tie = false
//   }

//   update() {
//     if (this.health1 == 0) {
//       this.winner = 'Player 2'
//       gameOver = true

//       socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//     }
//     if (this.health2 == 0) {
//       this.winner = 'Player 1'
//       gameOver = true

//       socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//     }
//     if (this.timer.timeOut) {
//       if (this.health1 > this.health2) {
//         this.winner = 'Player 1'
//         gameOver = true

//         socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//       }
//       if (this.health2 > this.health1) {
//         this.winner = 'Player 2'
//         gameOver = true

//         socket.emit('game-over', { gameOver: gameOver, gameWinIndicator: this.winner })
//       }
//       if (this.health2 == this.health1) {
//         this.tie = true
//       }
//     }
//   }
// }