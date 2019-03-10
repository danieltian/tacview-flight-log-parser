class Sortie {
  constructor(event) {
    this.timeStart = event.Time
    this.timeEnd = undefined
    this.takeoffs = []
    this.landings = []
    this.event = event
    this.airbaseStart = undefined
  }

  addTakeoff(event, airbase) {
    this.takeoffs.push({
      time: event.time,
      airbase: airbase
    })
  }

  addLanding(event, airbase) {
    this.landings.push({
      time: event.time,
      airbase: airbase
    })
  }

  addKill(unit) {
    this.kills.push(unit)
  }
}

export default Sortie