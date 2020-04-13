const fs = require('fs')
const path = require('path')

module.exports = dir => {
  const base = path.resolve(dir)
  return function(name, objectToStringify) {
    fs.writeFile(`${path.join(base, name)}.json`, JSON.stringify(objectToStringify, null, 2), function(err) {
      if (err) return console.log(err)
      console.log(`${name} file was saved!`)
    })
  }
}
