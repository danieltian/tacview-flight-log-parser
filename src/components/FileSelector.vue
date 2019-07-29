<template lang="pug">
  #file-selector(ref="fileSelector")
    input(type="file" accept=".xml" multiple @change="onFileChange")
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    methods: {
      onFileChange(e) {
        this.$store.dispatch('loadFiles', e.target.files)
      }
    }
  }
</script>

<style lang="stylus">

</style>
