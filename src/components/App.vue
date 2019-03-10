<template lang="pug">
  #app
    FileSelector
    table.table.is-bordered.is-striped.is-hoverable.is-fullwidth.is-narrow
      thead
        tr
          th Time
          th P ID
          th P Name
          th P Pilot
          th P Coal
          th P Type
          th P Grp
          th P Country
          th P Parent

          th S ID
          th S Name
          th S Pilot
          th S Coal
          th S Type
          th S Grp
          th S Country
          th S Parent

          th Pt ID
          th Pt Name
          th Pt Pilot
          th Pt Coal
          th Pt Type
          th Pt Grp
          th Pt Country
          
          th Apt ID
          th Apt Name
      tbody
        Entity(v-for="entity in debug" :entity="entity" :key="entity.PrimaryObject.ID")


    //- table.table.is-bordered.is-striped.is-hoverable.is-narrow
    //-   thead
    //-     tr
    //-       th Name
    //-       th Spawns
    //-       th(colspan=2) Takeoffs
    //-       th(colspan=2) Landings
    //-   tbody
    //-     Airbase(v-for="airbase in airbases" :airbase="airbase" :key="airbase.id")
</template>

<script>
  import { mapState } from 'vuex'
  import FileSelector from './FileSelector'
  import Airbase from './Airbase'
  import Entity from './Entity'

  export default {
    components: { FileSelector, Airbase, Entity },

    computed: {
      ...mapState(['airbases', 'entities', 'debug'])
    }
  }
</script>

<style lang="stylus">
  body
    padding: 2em
</style>
