export class Timer {
  constructor () {
    this.timeRemaining = 31
    this.timeOut = false
    this.startTimer()
    this.timeStop = false
  }

  update () {
    if (this.timeRemaining <= 0) {
      this.timeOut = true
    }
  }

  startTimer () {
    const intervalId = setInterval(() => {
      if (this.timeOut || this.timeStop) {
        clearInterval(intervalId)
      } else {
        this.timeRemaining--
      }
    }, 1000)
  }
}
