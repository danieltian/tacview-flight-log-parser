class Airbase {
  constructor(event) {
    let airbaseObject = event.SecondaryObject || event.Airport
    
    this.id = airbaseObject.ID
    this.name = airbaseObject.Name
    this.coalition = airbaseObject.Coalition
    
    this.spawns = []
    this.landings = []
    this.takeoffs = []
  }

  addSpawn(sortie) {
    this.spawns.push({
      time: sortie.timeStart,
      sortie: sortie
    })
  }

  addTakeoff(sortie, event) {
    this.takeoffs.push({
      time: event.time
    })
  }

  addLanding(sortie, event) {
    this.landings.push({
      time: event.time,
      sortie: sortie
    })
  }
}

export default Airbase