<template lang="pug">
  tr.airbase
    td.name {{ airbase.name }}
    td.count {{ spawnsCount }}
    td.count {{ takeoffsCount }}
    td.percent {{ takeoffsPercent }}
    td.count {{ landingsCount }}
    td.percent {{ landingsPercent }}
</template>

<script>
  export default {
    props: {
      airbase: { type: Object, required: true }
    },

    computed: {
      spawnsCount() {
        return this.airbase.spawns.length
      },

      takeoffsCount() {
        return this.airbase.takeoffs.length
      },

      landingsCount() {
        return this.airbase.landings.length
      },

      takeoffsPercent() {
        let percent = this.takeoffsCount / this.spawnsCount * 100
        return Number.isFinite(percent) ? percent.toFixed(0) + '%' : '-'
      },

      landingsPercent() {
        let percent = this.landingsCount / this.spawnsCount * 100
        return Number.isFinite(percent) ? percent.toFixed(0) + '%' : '-'
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .count, .percent
    text-align: right

  .count
    font-weight: bold

  .percent
    padding-left: 0.5em
    color: #878787
    font-size: 0.8em
    vertical-align: middle
</style>