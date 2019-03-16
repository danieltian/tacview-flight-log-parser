class Statistic {
  get(key) {
    let parts = key.split('.')
    let object = this

    parts.forEach((part) => {
      if (object[part]) {
        object = object[part]
      }
      else {
        return
      }
    })

    return object
  }

  addToArray(key, value) {
    let parts = key.split('.')
    let object = this._createPath(parts)
    let lastKey = parts[parts.length - 1]

    object[lastKey] = object[lastKey] || []
    object[lastKey].push(value)
  }

  increment(key, amount = 1) {
    let parts = key.split('.')
    let object = this._createPath(parts)
    let lastKey = parts[parts.length - 1]

    object[lastKey] = object[lastKey] || 0
    object[lastKey] = object[lastKey] + amount
  }

  _createPath(parts) {
    let object = this
    parts = parts.slice(0, parts.length - 1)

    parts.forEach((part) => {
      if (!object[part]) {
        object[part] = {}
      }

      object = object[part]
    })

    return object
  }
}

export default Statistic