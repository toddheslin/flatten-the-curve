const defaultTo = require('lodash/defaultTo')
const { parse, format } = require('date-fns')

const generateDates = require('../generate-dates')

module.exports = regions => {
  for (const [_, region] of regions) {
    region.time_series = region.time_series
      .filter(t => !!t.confirmed) // Remove the empty time series data
      .map(t => {
        // Add confirmed per million
        t.confirmed_per_mil = defaultTo(t.confirmed / (region.population / 1000000), 0)
        // Add deaths per million
        t.deaths_per_mil = defaultTo(t.deaths / (region.population / 1000000), 0)
        // convert date strings to actual dates
        t.date = generateDates(t.date).date

        return t
      })
  }
}
