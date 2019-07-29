class Entity {
  constructor(object) {
    Object.assign(this, object)
    this.events = []
    this.HasDestroyed = []
    this.HasTakenOff = []
    this.HasFired = []
    this.HasBeenHitBy = []
    this.HasHit = []
    this.HasLanded = []
  }

  addEvent(entry) {
    this.events.push(entry)

    switch (entry.event) {
      case 'HasEnteredTheArea':
        this.HasEnteredTheArea = entry
        break
      case 'HasBeenDestroyed':
        this.HasBeenDestroyed = entry
        break
      case 'HasDestroyed':
        this.HasDestroyed.push(entry)
        break
      case 'HasTakenOff':
        this.HasTakenOff.push(entry)
        break
      case 'HasLeftTheArea':
        this.HasLeftTheArea = entry
        break
      case 'HasFired':
        this.HasFired.push(entry)
        break
      case 'HasBeenFired':
        this.HasBeenFired = entry
        break
      case 'HasBeenHitBy':
        this.HasBeenHitBy.push(entry)
        break
      case 'HasHit':
        this.HasHit.push(entry)
        break
      case 'HasLanded':
        this.HasLanded.push(entry)
    }
  }
}

export default Entity