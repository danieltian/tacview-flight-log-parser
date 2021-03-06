import xmlParser from 'fast-xml-parser'
import Entity from './models/Entity'
import airbaseParser from './parsers/airbase-parser'
//import dexie, { Dexie } from 'dexie'

const FlightLogParser = {
  parse(fileContents, storeData) {
    let options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      parseAttributeValue: true
    }

    let data = xmlParser.parse(fileContents, options)
    let tacviewId = data.TacviewDebriefing.FlightRecording.RecordingTime
    let events = data.TacviewDebriefing.Events.Event || []

    let results = storeData

    function getId(object) {
      return `${tacviewId}:${object.ID}`
    }

    function getEntity(object) {
      let entity = results.entities[object && `${tacviewId}:${object.ID}`]
      return entity
    }

    function createEntity(object) {
      let entity = new Entity(object)

      results.entities[`${tacviewId}:${object.ID}`] = entity
      results.categories[entity.Type] = results.categories[entity.Type] || []
      results.categories[entity.Type].push(entity)
      
      return entity
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Dexie DB setup
    // -----------------------------------------------------------------------------------------------------------------
    //const db = new Dexie('test')

    events.forEach((event) => {
      let entity = getEntity(event.PrimaryObject)

      // ---------------------------------------------------------------------------------------------------------------
      // An entity has been created in the game world.
      // ---------------------------------------------------------------------------------------------------------------
      if (event.Action == 'HasEnteredTheArea') {
        // If the entity already exists, display an error message. There should never be an existing entity that has
        // entered the area unless it's a parachutist. Tacview will first record the parachutist as being fired by
        // an aircraft, and then send a HasEnteredTheArea event for it. This seems to only apply to parachutists.
        // NOTE: Check if this is true across different Tacviews.
        if (entity && entity.Type !== 'Parachutist') {
          console.log('ERROR: HasEnteredTheArea but already exists, existing:', entity, 'event:', event)
        }
        else {
          entity = createEntity(event.PrimaryObject)

          entity.addEvent({
            event: event.Action,
            time: event.Time,
            location: event.SecondaryObject || event.Airport
          })
        }
      }
      // ---------------------------------------------------------------------------------------------------------------
      // An entity has been destroyed and removed from the game world.
      // ---------------------------------------------------------------------------------------------------------------
      else if (event.Action == 'HasBeenDestroyed') {
        // This entity has existed since the Tacview started.
        if (!entity) {
          entity = createEntity(event.PrimaryObject)
        }

        let destroyedBy = getEntity(event.SecondaryObject)

        if (destroyedBy) {
          destroyedBy.addEvent({
            event: 'HasDestroyed',
            time: event.Time,
            destroyedId: getId(entity)
          })
        }

        entity.addEvent({
          event: event.Action,
          time: event.Time,
          destroyedById: (destroyedBy && getId(destroyedBy)) || null
        })
      }
      // ---------------------------------------------------------------------------------------------------------------
      // An entity has taken off from the ground.
      // ---------------------------------------------------------------------------------------------------------------
      else if (event.Action == 'HasTakenOff') {
        // This entity has existed since the Tacview started.
        if (!entity) {
          entity = createEntity(event.PrimaryObject)
        }
        
        entity.addEvent({
          event: event.Action,
          time: event.Time,
          location: event.SecondaryObject || event.Airport
        })
      }
      // ---------------------------------------------------------------------------------------------------------------
      // An entity has left the map, most likely due to the player quitting on the ground.
      // ---------------------------------------------------------------------------------------------------------------
      else if (event.Action == 'HasLeftTheArea') {
        if (!entity) {
          console.log('ERROR: HasLeftTheArea but does not exist', event)
        }
        else {
          entity.addEvent({
            event: event.Action,
            time: event.Time,
            location: event.SecondaryObject || event.Airport
          })
        }
      }
      // ---------------------------------------------------------------------------------------------------------------
      // An entity has fired a munition.
      // ---------------------------------------------------------------------------------------------------------------
      else if (event.Action == 'HasFired') {
        // This entity has existed since the Tacview started.
        if (!entity) {
          entity = createEntity(event.PrimaryObject)
        }

        let munition = getEntity(event.SecondaryObject)
        if (munition) {
          console.log('ERROR: HasFired but the munition already exists, event:', event, 'munition:', munition)
        }
        else {
          munition = createEntity(event.SecondaryObject)
        }
        
        entity.addEvent({
          event: event.Action,
          time: event.Time,
          occurrences: event.Occurrences,
          munitionId: getId(munition) || null
        })

        munition.addEvent({
          event: 'HasBeenFired',
          time: event.Time,
          occurrences: event.Occurrences,
          firedById: getId(entity)
        })
      }
      // ---------------------------------------------------------------------------------------------------------------
      // An entity has been hit by a munition.
      // ---------------------------------------------------------------------------------------------------------------
      else if (event.Action == 'HasBeenHitBy') {
        // This entity has existed since the Tacview started.
        if (!entity) {
          entity = createEntity(event.PrimaryObject)
        }

        let munition = getEntity(event.SecondaryObject)
        if (!munition) {
          munition = createEntity(event.SecondaryObject)
          //console.log('WARN: HasBeenHitBy but the munition does not exist, event:', event)
        }

        let parent = getEntity(event.ParentObject)
        if (parent) {
          parent.addEvent({
            event: 'HasHit',
            time: event.Time,
            targetId: getId(entity)
          })
        }

        entity.addEvent({
          event: event.Action,
          time: event.Time,
          munitionId: getId(munition),
          parentId: (parent && getId(parent)) || null
        })

        munition.addEvent({
          event: 'HasHit',
          time: event.Time,
          targetId: getId(entity),
          parentId: (parent && getId(parent)) || null
        })
      }
      // ---------------------------------------------------------------------------------------------------------------
      // An entity has landed on the ground or in the ocean.
      // ---------------------------------------------------------------------------------------------------------------
      else if (event.Action == 'HasLanded') {
        if (!entity) {
          console.log('ERROR: HasLanded but does not exist', event)
        }
        else {
          entity.addEvent({
            event: event.Action,
            time: event.Time,
            location: event.SecondaryObject || event.Airport
          })
        }
      }
    })
    

    //console.log('results before', results)
    //Object.assign(results, airbaseParser.process(results))

    //console.log('results after', results)
    window.results = results
    return results
  }
}

export default FlightLogParser