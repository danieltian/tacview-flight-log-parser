<template lang="pug">
  .munition-table
    h1 {{ title }}

    table.table.is-bordered.is-striped.is-hoverable.is-narrow
      thead
        tr
          th Munition
          th Average
          th Median
      tbody
        tr(v-for="name in names" v-if="stats[name]")
          td(@mouseover="showHistogram(name)" @mouseout="hideHistogram") {{ getShortName(name) }}
          td.time {{ getAverage(stats[name]) }}
          td.time {{ getMedian(stats[name]) }}
    
    .histogram-wrapper(v-show="isHistogramVisible")
      .histogram(ref="histogram")
</template>

<script>
  import shortNames from '../short-names'

  export default {
    props: {
      title: { type: String, required: true },
      names: { type: Array, required: true },
      stats: { type: Object, required: true }
    },

    data() {
      return {
        isHistogramVisible: false
      }
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

    mounted() {
      google.charts.load('current', { packages: ['corechart'] })
    },

    methods: {
      getAverage(array) {
        let sum = array.reduce((sum, current) => sum + current, 0)
        let average = sum / array.length
        return this.getTime(average)
      },

      getMedian(array) {
        if (array.length == 1) { return this.getTime(array[0]) }

        let newArray = array.slice(0)
        newArray.sort()
        let length = newArray.length
        let midpoint = Math.floor(length / 2) - 1

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
      },

      showHistogram(name) {
        this.isHistogramVisible = true
        let relevantData = this.stats[name].map((x) => [x / 1000])
        let data = google.visualization.arrayToDataTable([
          ['Time'],
          ...relevantData
        ])

        let options = {
          title: name + ' Shot Times',
          legend: { position: 'none' }
        }

        let chart = new google.visualization.Histogram(this.$refs.histogram)
        chart.draw(data, options)
      },

      hideHistogram() {
        this.isHistogramVisible = false
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .munition-table
    position: relative

  h1
    font-size: 1.1em
    margin-bottom: 0.2em

  .table
    font-size: 0.85em
  
  .time
    text-align: right
  
  .histogram-wrapper
    position: absolute
    top: 0
    left: 300px
    width: 800px
    height: 500px
    z-index: 1
    border: 2px solid black
    display: flex
  
    .histogram
      height: 100%
      width: 100%
</style>