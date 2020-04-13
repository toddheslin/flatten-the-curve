const { promisify } = require('util')
const readFile = promisify(require('fs').readFile)

module.exports = path => readFile(path, 'utf8').then(JSON.parse)
