module.exports = (key, value, keyTransform, valueTransform) => {
  return function(array) {
    return array.reduce(
      (map, object) =>
        map.set(
          keyTransform ? keyTransform(object[key]) : object[key],
          valueTransform ? valueTransform(object[value]) : object[value]
        ),
      new Map()
    )
  }
}
