import Vue from 'vue'
import Vuex from 'vuex'
import App from './components/App'
import parser from './flight-log-parser'

import Airbase from './models/Airbase'
import Sortie from './models/Sortie'

Vue.use(Vuex)

function getOrCreateAirbase(event, airbases) {
  if (!event.SecondaryObject && !event.Airport) {
    event.SecondaryObject = {
      ID: 'Unknown',
      Name: 'Unknown'
    }
  }
  
  // Get the existing airbase, if any.
  let object = event.SecondaryObject || event.Airport
  let airbase = airbases[object.ID]
  // Create the airbase if it doesn't exist.
  if (!airbase) {
    airbase = new Airbase(event)
    airbases[airbase.id] = airbase
  }

  return airbase
}

function processEnteredTheArea(event, lists) {
  if (lists.entities[event.PrimaryObject.ID]) {
    console.log('ERROR: the entity already exists', event)
    return
  }
  
  lists.entities[event.PrimaryObject.ID] = event

  // There's a pilot name for this event.
  if (event.PrimaryObject.Pilot) {
    // This is a player spawning in, or on some servers the server spawning an AI aircraft.
    if (['Aircraft', 'Helicopter'].includes(event.PrimaryObject.Type)) {
      let sortie = new Sortie(event)
      sortie.airbaseStart = getOrCreateAirbase(event, lists.airbases)
      lists.sorties.push(sortie)
      event.sortie = sortie
    }
    // This is an AI unit with a pilot name that was spawned in.
    else {
      lists.aiUnits.push(event)
    }
  }
  else {
    // Neutral objects are jettisoned munitions.
    if (event.PrimaryObject.Coalition == 'Neutral') {
      lists.jettisonedMunitions.push(event)
    }
    // This is an ejected pilot. We'll keep track of it as an ejection, but we don't have any info on who it is.
    else if (event.PrimaryObject.Type == 'Parachutist') {
      lists.ejections.push(event)
    }
    // This is either a munitions launcher, which doesn't have an owner, or this is a munition launched by a unit, but
    // Tacview bugged out and didn't record who or what launched it.
    else if (['Bomb', 'Missile'].includes(event.PrimaryObject.Type) && !event.PrimaryObject.Group) {
      lists.unownedMunitions = event
    }
    // This is a spawned AI unit.
    else {
      lists.aiUnits.push(event)
    }
  }
}

function processTakenOff(event, lists) {
  let entity = lists.entities[event.PrimaryObject.ID]

  if (!entity) {
    console.log('WARN: an entity has taken off, but there is no record of it entering', event)
    lists.entities[event.PrimaryObject.ID] = event
  }
  else if (!entity.sortie) {
    console.log('WARN: an entity has taken off, but it did not have an associated sortie, this is most likely an AI unit', event, entity)
  }
  else {
    entity.sortie.takeoffs.push({ time: event.Time })
  }
}

function processLanding(event, lists) {
  let entity = lists.entities[event.PrimaryObject.ID]

  if (!entity) {
    console.log('ERROR: an entity has landed, but there is no record of it entering', event)
  }
  else if (!entity.sortie) {
    console.log('ERROR: an entity has landed, but it did not have an associated sortie', event)
  }
  else {
    entity.sortie.landings.push({ time: event.Time, airbase: getOrCreateAirbase(event, lists.airbases) })
  }
}

function processLeftTheArea(event, lists) {
  let entity = lists.entities[event.PrimaryObject.ID]

  if (!entity) {
    console.log('ERROR: an entity has left the area, but there is no record of it entering', event)
  }
  else if (!entity.sortie) {
    console.log('ERROR: an entity has left the area, but it did not have an associated sortie', event)
  }
  else {
    entity.sortie.timeEnd = event.Time
  }
}

function processFired(event, lists) {
  if (event.PrimaryObject.Type == 'Aircraft') {
    lists.debug[event.PrimaryObject.ID] = event
  }
}

function processHit(event, lists) {
  // let sortie = sorties[id]

  // Missiles that are jettisoned at the same time and hit the ground, will count as one missile hitting the other.
  if (event.PrimaryObject.Coalition == 'Neutral' && event.PrimaryObject.Coalition == 'Missile' && event.SecondaryObject.Coalition == 'Neutral' && event.SecondaryObject.Coalition == 'Missile') {
    // Don't do anything.
  }
  else {
    
  }

  // if (!sortie) {
  //   // Check if this is a munition by seeing if there's a relevant or secondary object ID.
  //   if (!event['Relevant Object ID'] && !event['Secondary Object ID']) {
  //     munitions[event['Primary Object ID']].timeEnd = event['Mission Time']
  //   }
  //   else {
  //     console.log('WARN: destroyed by non-existent sortie', event)
  //     miscellaneous[id] = event
  //   }
  // }
  // else {
  //   if (!sortie.hitBy) {
  //     sortie.hitBy = {}
  //   }

  //   sortie.hitBy[id] = munitions[event['Relevant Object ID']]

  //   if (!sorties[event['Relevant Object ID']]) {
  //     miscellaneous[event[id]] = event
  //   }
  //   else {
  //     try {
  //       if (!sorties[event['Relevant Object ID']].fired[event['Secondary Object ID']].kills) {
  //         sorties[event['Relevant Object ID']].fired[event['Secondary Object ID']].kills = []
  //         sorties[event['Relevant Object ID']].fired[event['Secondary Object ID']].kills.push(event)
  //       }
  //     }
  //     catch (e) {
  //       console.log('WARN', event)
  //     }
  //   }
  // }
}

const store = new Vuex.Store({
  state: {
    airbases: {},
    entities: {},
    debug: {},
    sorties: []
  },

  mutations: {
    setEntities(state, entities) {
      state.entities = Object.assign({}, entities)
    },

    setAirbases(state, airbases) {
      state.airbases = Object.assign({}, airbases)
    },

    setDebug(state, entities) {
      state.debug = Object.assign({}, entities)
    },

    setSorties(state, sorties) {
      state.sorties = sorties
    }
  },

  actions: {
    loadFiles({ state, commit }, files) {
      files = Array.from(files)

      files.forEach((file) => {
        let reader = new FileReader()
        reader.readAsText(file)

        reader.addEventListener('load', () => {
          let unitList = {}
          let sortieList = {}
          let munitionList = {}
          let unprocessedList = {}
          let airbaseList = state.airbases
          let ejectionList = {}
          let munitionsWithoutOwners = {}

          let lists = {
            entities: {},
            debug: {},
            airbases: {},

            ejections: [],
            munitions: [],
            jettisonedMunitions: [],
            unownedMunitions: [],
            sorties: [],
            aiUnits: []
          }

          let events = parser.parse(reader.result)

          events.forEach((event) => {
            // An entity has been created.
            if (event.Action == 'HasEnteredTheArea') {
              processEnteredTheArea(event, lists)
            }
            else if (event.Action == 'HasTakenOff') {
              processTakenOff(event, lists)
            }
            else if (event.Action == 'HasFired') {
              processFired(event, lists)
            }
            // else if (event.event == 'HasBeenDestroyed') {
            //   let sortie = sortieList[id]

            //   // An entity besides a sortie was destroyed.
            //   if (!sortie) {
            //     // Check if this is a munition by seeing if there's a relevant or secondary object ID.
            //     if (!event.relevantId && !event.secondaryId) {
            //       let munition = munitionList[event.primaryId]
            //       let ownerlessMunition = munitionsWithoutOwners[event.primaryId]
            //       let ejection = ejectionList[event.primaryId]

            //       if (munition) {
            //         munition.timeEnd = event.time
            //       }
            //       else if (ownerlessMunition) {
            //         ownerlessMunition.timeEnd = event.time
            //       }
            //       else if (ejection) {
            //         ejection.timeEnd = event.time
            //       }
            //       // An entity was destroyed, but we have no data on what destroyed it.
            //       else {
            //         console.log('WARN: entity does not exist', event)
            //         let unit = unitList[id]
            //         if (!unit) {
            //           unit = {
            //             id: event.primaryId,
            //             name: event.primaryName,
            //             timeStart: 0 // Assume this unit was alive since the beginning of the map.
            //           }

            //           unitList[id] = unit
            //         }

            //         unit.timeEnd = event.time
            //       }
            //     }
            //     // A ground unit was destroyed by a munition that belongs to a sortie. This will be the case when
            //     // munition dispensers are used.
            //     else if (event.relevantId) {
            //       let sortie = sortieList[event.relevantId]
            //       let unit = unitList[id]

            //       if (!unit) {
            //         unit = {
            //           id: event.primaryId,
            //           name: event.primaryName,
            //           timeStart: 0
            //         }

            //         unitList[id] = unit
            //       }

            //       unit.timeEnd = event.time
            //       unit.destroyedBy = sortie
            //       sortie.addKill(unit)
            //       console.log(event)
            //     }
            //     // A ground unit was destroyed directly by a sortie.
            //     else {
            //       let sortie = sortieList[event.secondaryId]
            //       let unit = unitList[id]

            //       if (!unit) {
            //         unit = {
            //           id: event.primaryId,
            //           name: event.primaryName,
            //           timeStart: 0 // Assume this unit was alive since the beginning of the map.
            //         }

            //         unitList[id] = unit
            //       }

            //       unit.timeEnd = event.time
            //       unit.destroyedBy = sortie
            //       sortie.addKill(unit)
            //     }
            //   }
            //   // A sortie was destroyed.
            //   else {
            //     sortieList[id].timeDestroyed = event.time

            //     let destroyedBy = sortieList[event.secondaryId]
  
            //     if (destroyedBy) {
            //       destroyedBy.kills[id] = {
            //         timeDestroyed: event.time
            //       }
            //     }
            //   }
            // }
            else if (event.Action == 'HasBeenHitBy') {
              processHit(event, lists)
            }
            else if (event.Action == 'HasLanded') {
              processLanding(event, lists)
            }
            else if (event.Action == 'HasLeftTheArea') {
              processLeftTheArea(event, lists)
            }
          })

          window.sorties = sortieList
          window.munitions = munitionList
          window.unprocessed = unprocessedList
          window.units = unitList
          window.airbases = airbaseList
          window.jettisonedMunitions = munitionsWithoutOwners
          window.ejections = ejectionList
          window.lists = lists

          commit('setAirbases', lists.airbases)
          commit('setEntities', lists.entities)
          commit('setDebug', lists.debug)
          commit('setSorties', lists.sorties)
        })
      })
    }
  }
})

new Vue({
  el: '#app',
  store,
  render: (h) => h(App)
})