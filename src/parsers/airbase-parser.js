import Statistic from '../models/Statistic'

const knownAirbases = ['Nalchik', 'Stennis', 'Sochi', 'Mineralnye Vody', 'Krasnodar Center', 'Maykop-Khanskaya', 'Maykop']

function getAirbaseName(event, aircraft, shouldGuessAirbase = true) {  
  let location = event.location
  let name = 'Unknown'

  if (!location) {
    console.log('no location', aircraft)
    if (shouldGuessAirbase) {
      for (let known of knownAirbases) {
        if (aircraft.Group.startsWith(known)) {
          name = known
          break
        }
      }
    }
  }
  else {
    name = location.Name

    if (name == 'FARP') {
      name = `FARP (ID: ${location.ID})`
    }
  }

  return name
}

const airbaseParser = {
  process(data) {
    let airbaseEvents = new Statistic()

    // type (ai, player) -> side (allied, enemies) -> airbase -> spawns/takeoffs/landings/despawns
    for (let aircraft of data.categories.Aircraft) {
      let isAiUnit = (!aircraft.Pilot || aircraft.Group.startsWith('RED') || aircraft.Group.startsWith('BLUE'))
      let type = isAiUnit ? 'ai' : 'players'
      let side = aircraft.Coalition
      
      if (aircraft.HasEnteredTheArea) {
        let airbaseName = getAirbaseName(aircraft.HasEnteredTheArea, aircraft)
        airbaseEvents.increment(`${type}.${side}.${airbaseName}.spawns`)
      }
      if (aircraft.HasTakenOff.length) {
        aircraft.HasTakenOff.forEach((takeoff, index) => {
          let shouldGuessAirbase = (index ==  0)
          let airbaseName = getAirbaseName(takeoff, aircraft, shouldGuessAirbase)
          airbaseEvents.increment(`${type}.${side}.${airbaseName}.takeoffs`)
        })
      }
      if (aircraft.HasLanded.length) {
        aircraft.HasLanded.forEach((landing) => {
          let airbaseName = getAirbaseName(landing, aircraft, false)
          airbaseEvents.increment(`${type}.${side}.${airbaseName}.landings`)
        })
      }
      if (aircraft.HasLeftTheArea) {
        let airbaseName = getAirbaseName(aircraft.HasLeftTheArea, aircraft, false)
        airbaseEvents.increment(`${type}.${side}.${airbaseName}.despawns`)
      }
    }

    return { airbaseEvents }
  }

  // process(data) {
  //   let airbases = new Statistic()
    
  //   // type (ai, player) -> side (allied, enemies) -> airbase -> aircraft -> spawns/takeoffs/landings/despawns
  //   for (let aircraft of data.categories.Aircraft) {
  //     let isAiUnit = (!aircraft.Pilot || aircraft.Group.startsWith('RED') || aircraft.Group.startsWith('BLUE'))
  //     let type = isAiUnit ? 'ai' : 'players'
  //     let side = aircraft.Coalition
  //     let aircraftName = aircraft.Name

  //     if (aircraft.HasEnteredTheArea) {
  //       let airbaseName = getAirbaseName(aircraft.HasEnteredTheArea, aircraft)
  //       airbases.addToArray(`${type}.${side}.${airbaseName}.${aircraftName}.spawns`, aircraft.HasEnteredTheArea)
  //     }
  //     if (aircraft.HasTakenOff.length) {
  //       aircraft.HasTakenOff.forEach((takeoff, index) => {
  //         let shouldGuessAirbase = (index == 0)
  //         let airbaseName = getAirbaseName(takeoff, aircraft, shouldGuessAirbase)
  //         airbases.addToArray(`${type}.${side}.${airbaseName}.${aircraftName}.takeoffs`, takeoff)
  //       })
  //     }
  //     if (aircraft.HasLanded.length) {
  //       aircraft.HasLanded.forEach((landing) => {
  //         let airbaseName = getAirbaseName(landing, aircraft, false)
  //         airbases.addToArray(`${type}.${side}.${airbaseName}.${aircraftName}.landings`, landing)
  //       })
  //     }
  //     if (aircraft.HasLeftTheArea) {
  //       let airbaseName = getAirbaseName(aircraft.HasLeftTheArea, aircraft, false)
  //       airbases.addToArray(`${type}.${side}.${airbaseName}.${aircraftName}.despawns`, aircraft.HasLeftTheArea)
  //     }
  //   }

  //   console.log(airbases)

  //   return { airbases }
  // }
}

export default airbaseParser