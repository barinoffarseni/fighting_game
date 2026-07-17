export class Timer {
  constructor (timeRemaining) {
    this.timeRemaining = timeRemaining
    this.timeStop = false
    this.timeOut = false
    this.startTimer()
  }

  update () {
    if (this.timeRemaining <= 0) {
      this.timeOut = true
    }
  }

  startTimer () {
    const intervalId = setInterval(() => {
      if (this.timeOut || this.timeStop) {
        this.timeStop = false
        clearInterval(intervalId)
      } else {
        this.timeRemaining--
      }
    }, 1000)
  }
}
