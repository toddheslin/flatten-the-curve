const _ = require('lodash')
const validKey = require('./valid-key')

module.exports = (confirmed, deaths, recovered, field_to_use) => {
  const combined = {}

  confirmed.forEach(area => {
    const name = area[field_to_use]
    highest = 0
    time_series = []
    _.forEach(area, (val, key) => {
      if (validKey(key)) {
        time_series.push({
          date: key,
          confirmed: parseInt(val),
        })
        if (val > highest) highest_confirmed = parseInt(val)
      }
    })
    combined[name] = { name, time_series, highest_confirmed }
  })

  deaths.forEach(area => {
    highest = 0
    const name = area[field_to_use]
    _.forEach(area, (val, key) => {
      if (validKey(key)) {
        if (combined.hasOwnProperty(name)) {
          combined[name].time_series.forEach(time => {
            if (key == time.date) {
              time.deaths = parseInt(val)
              if (val > highest) highest = parseInt(val)
            }
          })
          combined[name].highest_deaths = highest
        }
      }
    })
  })

  recovered.forEach(area => {
    let highest = 0
    const name = area[field_to_use]
    _.forEach(area, (val, key) => {
      if (validKey(key)) {
        if (combined.hasOwnProperty(name)) {
          combined[name].time_series.forEach(time => {
            if (key == time.date) {
              time.recovered = parseInt(val)
              if (val > highest) highest = parseInt(val)
            }
          })
          combined[name].highest_recovered = highest
        }
      }
    })
  })

  return new Map(Object.entries(combined))
}
