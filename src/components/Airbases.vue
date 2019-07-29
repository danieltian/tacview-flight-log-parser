<template lang="pug">
  .airbases
    table.table.is-bordered.is-striped.is-hoverable.is-narrow
      thead
        th Name
      tbody
        tr(v-for="airbase in redPlayerAirbaseNames" :key="airbase.ID")
          td {{ airbase }}
</template>

<script>
  import Vue from 'vue'
  import { mapState } from 'vuex'

  let longNameToShort = {
    'Mi-8MT Hip': 'Mi-8',
    'F/A-18C Hornet': 'F/A-18C',
    'Su-27 Flanker': 'Su-27',
    'TF-51D Mustang': 'TF-51D',
    'Su-25T Frogfoot': 'Su-25T',
    'UH-1H Huey': 'UH-1H',
    'SA 342M Gazelle': 'SA 342M',
    'Ka-50 Black Shark': 'Ka-50',
    'F-15C Eagle': 'F-15C',
    'Mirage 2000C': 'Mirage',
    'F-5E-3 Tiger II': 'F-5E',
    'AV-8B Harrier II NA': 'AV-8B',
    'Yak-52': 'Yak-52',
    'Su-33 Flanker-D': 'Su-33',
    'MiG-29A Fulcrum-A': 'MiG-29A',
    'A-10C Thunderbolt II': 'A-10C',
    'SA 342L Gazelle': 'SA 342L',
    'MiG-29S Fulcrum-C': 'MiG-29S',
    'Shenyang J-11A': 'J-11A',
    'Su-25 Frogfoot': 'Su-25',
    'MiG-21bis Fishbed-L/N': 'MiG-21bis',
    'AJ 37 Viggen': 'Viggen',
    'A-10A Thunderbolt II': 'A-10A'
  }

  export default {
    data() {
      return {
        isFlipped: false
      }
    },

    computed: {
      ...mapState(['airbaseEvents']),

      redPlayerEvents() {
        return this.airbaseEvents && this.airbaseEvents.get('players.Allies')
      },

      redPlayerAirbaseNames() {
        return this.airbaseEvents && Object.keys(this.airbaseEvents.get('players.Allies'))
      },

      bluePlayerEvents() {
        return this.airbaseEvents && this.airbaseEvents.get('players.Enemies')
      }
    },

    methods: {
      shortName(name) {
        return longNameToShort[name] || name
      },

      flipTable() {
        this.isFlipped = !this.isFlipped
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .table
    font-size: 0.9em

  .spawns
    text-align: right
  
  th.name
    font-size: 0.9em
    vertical-align: middle
    position: sticky
    top: 0
    white-space: nowrap
    padding: 0
    border: none
    
    .wrapper
      transform: rotate(-60deg)
      width: 30px

    .wrapper2
      position: absolute
      top: 0
      border-top: 1px solid #dbdbdb
      padding: 0 1.5em

    &:last-child .wrapper
      border-bottom: 1px solid #dbdbdb
  
  .count
    text-align: right
  
  .count:empty {
    background-color: #E5E5E5
  }
</style>