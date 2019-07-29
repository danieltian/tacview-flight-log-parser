<template lang="pug">
  .munitions
    .legend F = Fired, H = Hit
    MunitionTable(title="Air to Air Missiles Fired" :names="airMissileNames" :stats="aircraftStats")
    MunitionTable(title="Air to Ground Missiles Fired" :names="groundMissileNames" :stats="aircraftStats")
    MunitionTable(title="Bombs Dropped" :names="bombNames" :stats="aircraftStats")
    MunitionTable(title="Rockets Launched" :names="rocketNames" :stats="aircraftStats")
    MunitionTable(title="Shell Salvos Fired" :names="shellNames" :stats="aircraftStats")

    h1 Time from Fire to Hit
    .times  
      MunitionTimeTable(title="Air to Air" :names="airMissileNames" :stats="munitionTimeStats")
      MunitionTimeTable(title="Air to Ground" :names="groundMissileNames" :stats="munitionTimeStats")
      MunitionTimeTable(title="Bombs" :names="bombNames" :stats="munitionTimeStats")
      MunitionTimeTable(title="Rockets" :names="rocketNames" :stats="munitionTimeStats")
      MunitionTimeTable(title="Shells" :names="shellNames" :stats="munitionTimeStats")
</template>

<script>
  import { mapState } from 'vuex'
  import MunitionTable from './MunitionTable'
  import MunitionTimeTable from './MunitionTimeTable'
  import shortNames from '../short-names'

  export default {
    components: { MunitionTable, MunitionTimeTable },

    computed: {
      ...mapState(['entities', 'categories']),

      playerAircraftThatFiredMunition() {
        if (!this.categories || !this.categories.Aircraft) { return }
        let allAircraft = this.categories.Aircraft.concat(this.categories.Helicopter)
        return allAircraft.filter((x) => x.HasFired.length && !!x.Pilot && !x.Group.startsWith('RED') && !x.Group.startsWith('BLUE'))
      },

      munitionsList() {
        if (!this.playerAircraftThatFiredMunition) { return [] }

        let hasFiredList = this.playerAircraftThatFiredMunition.reduce((array, current) => array.concat(current.HasFired), [])
        let munitionsList = hasFiredList.map((x) => this.entities[x.munitionId])
        return munitionsList
      },

      missileNames() {
        let set = new Set(this.munitionsList.filter((x) => x.Type == 'Missile').map((x) => x.Name))
        return Array.from(set).sort()
      },

      airMissileNames() {
        let names = this.missileNames
        let groundNames = this.groundMissileNames

        return names.filter((x) => !groundNames.includes(x))
      },

      groundMissileNames() {
        let names = this.missileNames
        let groundNames = [
          'AGM-122 Sidearm',
          'AGM-65 Maverick',
          'AGM-65G Maverick',
          'AGM-88 HARM',
          'MBDA',
          'HOT3',
          'KH-66',
          'RB04',
          'RB15',
          'RB75B',
          'ROBOT',
          'S-25L',
          'RB75',
          'RB75T',
          'weapons.missiles.AGM_88',
          'weapons.missiles.BK90_MJ1',
          'weapons.missiles.BK90_MJ2',
          'weapons.missiles.BK90_MJ1_MJ2',
          'weapons.missiles.X_25MP',
          'weapons.missiles.X_29T',
          'weapons.missiles.X_58',
          'weapons.missiles.X_25ML',
          'weapons.missiles.Vikhr_M',
          'weapons.missiles.X_29L',
          'weapons.missiles.Kh25MP_PRGS1VP'
        ]
        
        return names.filter((x) => groundNames.includes(x))
      },

      bombNames() {
        let set = new Set(this.munitionsList.filter((x) => x.Type == 'Bomb').map((x) => x.Name))
        return Array.from(set).sort()
      },

      shellNames() {
        let set = new Set(this.munitionsList.filter((x) => x.Type == 'Shell').map((x) => x.Name))
        return Array.from(set).sort()
      },

      rocketNames() {
        let set = new Set(this.munitionsList.filter((x) => x.Type == 'Rocket').map((x) => x.Name))
        return Array.from(set).sort()
      },

      aircraftStats() {
        if (!this.playerAircraftThatFiredMunition) { return {} }

        let aircraftStats = {}

        this.playerAircraftThatFiredMunition.forEach((aircraft) => {
          aircraftStats[aircraft.Name] = aircraftStats[aircraft.Name] || {}
          let weapons = aircraftStats[aircraft.Name]

          aircraft.HasFired.forEach((fired) => {
            let munition = this.entities[fired.munitionId]
            weapons[munition.Name] = weapons[munition.Name] || { fired: 0, hits: 0 }
            let stats = weapons[munition.Name]
            stats.fired = stats.fired + 1

            if (munition.HasHit.length) {
              stats.hits = stats.hits + munition.HasHit.length

              if (munition.HasHit.length > 1) {
                console.log('munition has hit more than 1 target', munition)
              }
            }
          })
        })

        let sortedStats = {}

        Object.keys(aircraftStats).sort().forEach((key) => {
          sortedStats[key] = aircraftStats[key]
        })

        return sortedStats
      },

      munitionTimeStats() {
        let stats = {}

        let firedMunitions = this.playerAircraftThatFiredMunition
          .reduce((array, current) => array.concat(current.HasFired), [])
          .map((x) => this.entities[x.munitionId])

        let hitMunitions = firedMunitions.filter((x) => !!x.HasHit.length)

        hitMunitions.forEach((munition) => {
          // Multiply by 1000 to avoid floating point rounding errors.
          let startTime = munition.HasBeenFired.time * 1000
          let endTime = munition.HasHit[0].time * 1000

          stats[munition.Name] = stats[munition.Name] || []
          stats[munition.Name].push(endTime - startTime)
        })

        return stats
      }
    },

    methods: {
      getAverage(array) {
        let sum = array.reduce((sum, current) => sum + current, 0)
        let average = sum / array.length
        return this.getTime(average)
      },

      getMedian(array) {
        let newArray = array.slice(0)
        newArray.sort()
        let length = newArray.length
        let midpoint = Math.floor(length / 2)

        if (length % 2 == 0) {
          let sumOfTwoMiddleNumbers = newArray[midpoint] + newArray[midpoint + 1]
          return this.getTime(sumOfTwoMiddleNumbers / 2)
        }
        else {
          return this.getTime(newArray[midpoint])
        }
      },

      getTime(timeInMilliseconds) {
        let hours = (Math.floor(timeInMilliseconds / 1000 / 60 / 60) % 24).toString().padStart(2, '0')
        let minutes = (Math.floor(timeInMilliseconds / 1000 / 60) % 60).toString().padStart(2, '0')
        let seconds = (Math.floor(timeInMilliseconds / 1000) % 60).toString().padStart(2, '0')

        if (hours == '00') {
          return `${minutes}:${seconds}`
        }
        else {
          return `${hours}:${minutes}:${seconds}`
        }
      },

      getShortName(name) {
        return shortNames[name] || name
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .munitions
    margin-top: 1em
  
  .munition-table
    margin-bottom: 1em

  h1
    font-size: 1.4em

  .times
    display: flex

    .munition-table
      margin-right: 1.5em
</style>