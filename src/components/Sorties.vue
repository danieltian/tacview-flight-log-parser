<template lang="pug">
  .sorties(v-if="aircraft")
    h1 Sorties
    table.table.is-bordered.is-striped.is-hoverable.is-narrow
      thead
        tr
          th Aircraft
          th Spawns
          th Takeoffs
          th Multiple Takeoffs
          th Landings
          th Fired Weapons
          th Hit with Weapon
          th Hit by Weapon
          th Destroyed
      tbody
        tr(v-for="entry in Object.entries(aircraftSorties).sort((a, b) => b[1].spawns - a[1].spawns)")
          td {{ entry[0] }}
          td {{ entry[1].spawns }}
          td {{ entry[1].takeoffs }}
          td {{ entry[1].multipleTakeoffs }}
          td {{ entry[1].landings }}
          td {{ entry[1].fired }}
          td {{ entry[1].hits }}
          td {{ entry[1].hitBy }}
          td {{ entry[1].destroyed }}
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      ...mapState(['categories']),

      aircraft() {
        if (!this.categories) { return }
        return this.categories.Aircraft.concat(this.categories.Helicopter)
      },

      aircraftSorties() {
        let sorties = {}
        let aircraftData = {
          spawns: 0,
          takeoffs: 0,
          landings: 0,
          fired: 0,
          hits: 0,
          hitBy: 0,
          destroyed: 0,
          multipleTakeoffs: 0
        }

        this.aircraft.forEach((x) => {
          let name = x.Name
          let stats = sorties[name]

          if (!stats) {
            stats = Object.assign({}, aircraftData)
            sorties[name] = stats
          }

          stats.spawns = stats.spawns + 1
          stats.takeoffs = stats.takeoffs + x.HasTakenOff.length
          stats.landings = stats.landings + x.HasLanded.length
          stats.fired = stats.fired + x.HasFired.length
          stats.hits = stats.hits + x.HasHit.length
          stats.hitBy = stats.hitBy + x.HasBeenHitBy.length

          if (x.HasTakenOff.length > 1) {
            stats.multipleTakeoffs = stats.multipleTakeoffs + 1
          }

          if (x.HasBeenDestroyed) {
            stats.destroyed = stats.destroyed + 1
          }
        })

        return sorties
      }
    }
  }
</script>

<style lang="stylus" scoped>
  h1
    font-size: 1.4em

  .table
    font-size: 0.8em
</style>
