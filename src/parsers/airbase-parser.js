const knownAirbases = ['Nalchik', 'Stennis', 'Sochi', 'Mineralnye Vody', 'Bomber Group']

function guessAirbase(event) {
  let airbaseName = event.PrimaryObject.Group

  for (let known of knownAirbases) {
    if (airbaseName.startsWith(known)) {
      airbaseName = known
      break
    }
  }

  return airbaseName
}

const airbaseParser = {
  airbases: {},
  aircraftNames: new Set(),
  debug: {},

  setup(eventProcessor) {
    eventProcessor.addEventListener('HasEnteredTheArea', (event) => {
      if (['Aircraft', 'Helicopter'].includes(event.PrimaryObject.Type)) {
        // Either this is not a player, or it's an AI unit that looks like a player. We'll ignore these events.
        if (!event.PrimaryObject.Pilot || event.PrimaryObject.Group.includes('INTERCEPT')) {
          return
        }
  
        // If the unit spawned at an airfield, it will have an Airport. If it spawned at a FARP or ship, it will
        // have a SecondaryObject.
        let object = event.SecondaryObject || event.Airport

        if (!object) {
          let guess = guessAirbase(event)
          object = {
            ID: guess,
            Name: guess
          }
        }
        
        let airbase = this.airbases[object.Name]

        if (object.ID == 'Unknown') {
          this.debug[event.PrimaryObject.ID] = event
        }
  
        // If the airbase doesn't exist, create it with the data we need to track.
        if (!airbase) {
          let name = (object.Name == 'FARP') ? `FARP (ID: ${object.ID})` : object.Name

          airbase = Object.assign({}, object, {
            spawns: {},
            spawnCount: 0,
            Name: name
          })
  
          this.airbases[airbase.Name] = airbase
        }
  
        this.aircraftNames.add(event.PrimaryObject.Name)
        airbase.spawns[event.PrimaryObject.Name] = (airbase.spawns[event.PrimaryObject.Name] || 0) + 1
        airbase.spawnCount = airbase.spawnCount + 1
      }
    })

    eventProcessor.addEventListener('getResults', () => {
      return {
        airbases: this.airbases,
        aircraftNames: this.aircraftNames,
        debug: this.debug
      }
    })
  }
}

export default airbaseParser