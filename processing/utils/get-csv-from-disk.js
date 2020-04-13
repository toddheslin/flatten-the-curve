const csv = require('csv-parser')
const fs = require('fs')

module.exports = path => {
  const output = []
  return new Promise(resolve => {
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', d => output.push(d))
      .on('end', () => resolve(output))
  })
}
