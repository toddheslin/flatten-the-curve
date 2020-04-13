const request = require('request')
const csv = require('csv-parser')

module.exports = url => {
  const output = []
  return new Promise(resolve => {
    request(url)
      .pipe(csv())
      .on('data', d => output.push(d))
      .on('end', () => resolve(output))
  })
}
