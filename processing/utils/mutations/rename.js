module.exports = (countries, renames) => {
  for (const [name, rename] of renames) {
    const original = countries.get(name)
    countries.set(rename, { ...original, ...{ name: rename } })
    countries.delete(name)
  }
}
