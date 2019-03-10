<template lang="pug">
  tr
    td {{ time }}
    td {{ entity.PrimaryObject.ID }}
    td {{ entity.PrimaryObject.Name }}
    td {{ entity.PrimaryObject.Pilot }}
    td {{ entity.PrimaryObject.Coalition }}
    td {{ entity.PrimaryObject.Type }}
    td {{ entity.PrimaryObject.Group }}
    td {{ entity.PrimaryObject.Country }}
    td {{ entity.PrimaryObject.Parent }}

    td {{ entity.SecondaryObject && entity.SecondaryObject.ID }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Name }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Pilot }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Coalition }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Type }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Group }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Country }}
    td {{ entity.SecondaryObject && entity.SecondaryObject.Parent }}

    td {{ entity.ParentObject && entity.ParentObject.ID }}
    td {{ entity.ParentObject && entity.ParentObject.Name }}
    td {{ entity.ParentObject && entity.ParentObject.Pilot }}
    td {{ entity.ParentObject && entity.ParentObject.Coalition }}
    td {{ entity.ParentObject && entity.ParentObject.Type }}
    td {{ entity.ParentObject && entity.ParentObject.Group }}
    td {{ entity.ParentObject && entity.ParentObject.Country }}

    td {{ entity.Airport && entity.Airport.ID }}
    td {{ entity.Airport && entity.Airport.Name }}
</template>

<script>
  export default {
    props: {
      entity: { type: Object, required: true }
    },

    computed: {
      time() {
        let date1 = new Date()
        let date2 = new Date(date1.getTime() + this.entity.Time * 1000)
        let diff = date2.getTime() - date1.getTime()

        let hours = (Math.floor(diff / 1000 / 60 / 60) % 24).toString().padStart(2, '0')
        let minutes = (Math.floor(diff / 1000 / 60) % 60).toString().padStart(2, '0')
        let seconds = (Math.floor(diff / 1000) % 60).toString().padStart(2, '0')

        return `${hours}:${minutes}:${seconds}`
      }
    }
  }
</script>

<style lang="stylus">
</style>