<template lang="pug">
  .munition-table
    h1 {{ title }}

    table.table.is-bordered.is-striped.is-hoverable.is-narrow
      thead
        tr.header
          th.border-right Aircraft
          th.nowrap.border-right(v-for="weapon in names" colspan="3") {{ getShortName(weapon) }}
          th.total-vertical(colspan="3") Total
        tr.sub-header
          th.border-right
          template(v-for="weapon in names")
            th F
            th.no-border-right H
            th.border-right %
          th.total-vertical F
          th.no-border-right H
          th %
      tbody
        tr(v-for="(aircraft, name) in relevantStats")
          td.nowrap.border-right.align-left {{ getShortName(name) }}
          template(v-for="weapon in names")
            td {{ aircraft[weapon] && aircraft[weapon].fired }}
            td.no-border-right {{ aircraft[weapon] && aircraft[weapon].hits }}
            td.border-right.percent {{ getPercent(aircraft[weapon]) }}
          td.total-vertical {{ getTotalForAircraft(aircraft, 'fired') }}
          td.no-border-right {{ getTotalForAircraft(aircraft, 'hits') }}
          td.percent {{ getTotalPercentForAircraft(aircraft )}}
        
        tr.total-horizontal
          td Total
          template(v-for="weapon in names")
            td {{ getTotalForWeapon(weapon, 'fired') }}
            td.no-border-right {{ getTotalForWeapon(weapon, 'hits') }}
            td.border-right.percent {{ getTotalPercentForWeapon(weapon) }}
</template>

<script>
  import shortNames from '../short-names'

  export default {
    props: {
      title: { type: String, required: true },
      names: { type: Array, required: true },
      stats: { type: Object, required: true }
    },

    computed: {
      relevantStats() {
        let stats = Object.entries(this.stats)
        let relevantStats = stats.filter((x) => Object.keys(x[1]).some((x) => this.names.includes(x)))
        
        let statsObject = relevantStats.reduce((object, current) => {
          object[current[0]] = current[1]
          return object
        }, {})
        
        return statsObject
      }
    },

    methods: {
      getShortName(name) {
        return shortNames[name] || name
      },

      getPercent(weapon) {
        if (!weapon) { return }
         
        let percent = weapon.hits / weapon.fired
        return `(${(percent * 100).toFixed(0)}%)`
      },

      getTotalForWeapon(weapon, statName) {
        if (!weapon) { return }

        let weaponStats = Object.values(this.stats).filter((x) => !!x[weapon]).map((x) => x[weapon])
        let total = weaponStats.reduce((sum, current) => sum + current[statName], 0)
        return total
      },

      getTotalPercentForWeapon(weapon) {
        let fired = this.getTotalForWeapon(weapon, 'fired')
        let hits = this.getTotalForWeapon(weapon, 'hits')
        let percent = hits / fired
        return Number.isFinite(percent) ? `(${(percent * 100).toFixed(0)}%)` : '0%'
      },

      getTotalForAircraft(aircraft, statName) {
        let names = Array.from(this.names)
        let relevantWeapons = Object.entries(aircraft).filter((x) => names.includes(x[0]))
        let sum = relevantWeapons.map((x) => x[1]).reduce((sum, current) => sum + current[statName], 0)

        return sum
      },

      getTotalPercentForAircraft(aircraft) {
        let fired = this.getTotalForAircraft(aircraft, 'fired')
        let hits = this.getTotalForAircraft(aircraft, 'hits')
        let percent = hits / fired
        return `(${(percent * 100).toFixed(0)}%)`
      }
    }
  }
</script>

<style lang="stylus" scoped>
  h1
    font-size: 1.4em
    margin-bottom: 0.2em

  .header
    font-size: 0.9em

  .sub-header
    font-size: 0.6em

  .table
    font-size: 0.8em

  th
    text-align: center
  
  td
    text-align: right

  td:empty
    background-color: #dbdbdb
  
  .nowrap
    white-space: nowrap
  
  .nowidth
    width: 0

  .border-right
    border-right: 1px solid #9A9A9A
  
  .no-border-right
    border-right: none
    padding-right: 0 !important

    & + td, & + th
      border-left: none
  
  .align-left
    text-align: left

  .percent
    font-size: 0.8em
    vertical-align: middle
    color: #8A8A8A
    padding-left: 0.2em !important
  
  .total-horizontal
    border-top: 2px solid #8A8A8A

  .total-vertical
    border-left: 2px solid #8A8A8A !important
</style>