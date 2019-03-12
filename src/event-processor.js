const eventProcessor = {
  eventHandlers: {},

  addEventListener(eventName, fn) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] || []
    this.eventHandlers[eventName].push(fn)
  },

  process(event) {
    let handlers = this.eventHandlers[event.Action]

    if (handlers) {
      this.eventHandlers[event.Action].forEach((fn) => fn(event))
    }
  },

  getResults() {
    let results = {}

    this.eventHandlers.getResults.forEach((fn) => {
      let result = fn()
      Object.assign(results, result)
    })

    return results
  }
}

export default eventProcessor