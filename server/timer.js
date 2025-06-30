export class Timer {
  constructor() {
    this.timeRemaining = 30
    this.timeOut = false
    this.startTimer()
  }

  update() {
    if (this.timeRemaining <= 0) {
      this.timeOut = true
    }
  }

  startTimer() {
    const intervalId = setInterval(() => {
      if (this.timeOut) {
        clearInterval(intervalId)
      } else {
        this.timeRemaining--
      }
    }, 1000)
  }
}