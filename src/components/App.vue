<template lang="pug">
  #app
    FileSelector

    ul
      li(v-for="file in files") {{ file.name }}

    Sorties
    Munitions

    //- .wrapper
    //-   ul
    //-     li.entity(v-for="entity in categories && categories.Aircraft" :class="{ selected: entity == selectedEntity }" :key="entity.ID" @click="selectEntity(entity)") {{ entity.ID }}: {{ entity.Name }} - {{ entity.Pilot }}

    //-   textarea {{ JSON.stringify(selectedEntity, undefined, 2) }}
</template>

<script>
  import { mapState } from 'vuex'
  import FileSelector from './FileSelector'
  import Airbases from './Airbases'
  import Entity from './Entity'
  import Munitions from './Munitions'
  import Sorties from './Sorties'

  export default {
    components: { FileSelector, Airbases, Entity, Munitions, Sorties },

    data() {
      return {
        selectedEntity: undefined
      }
    },

    computed: {
      ...mapState(['entities', 'categories', 'files'])
    },

    methods: {
      selectEntity(entity) {
        this.selectedEntity = entity
      }
    }
  }
</script>

<style lang="stylus">
  body
    padding: 2em

  .wrapper
    display: flex
    width: 100%

  .entity
    cursor: pointer

    &:hover
      background-color: yellow

    &.selected
      background-color: red

  textarea
    width: 500px
    height: 800px
</style>
