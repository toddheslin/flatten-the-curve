const _ = require('lodash')
const validKey = require('./valid-key')

/* eslint-disable camelcase */
module.exports = all_countries => {
  const seen_countries = []
  all_countries.forEach(c => {
    const found = _.find(seen_countries, seen_country => seen_country.name == c['Country/Region'])
    if (found) {
      found.count += 1
    } else {
      seen_countries.push({
        name: c['Country/Region'],
        count: 1,
      })
    }
  })

  countries_multiple_column_names = seen_countries.filter(c => c.count > 1).map(c => c.name)

  countries = all_countries.filter(c => !countries_multiple_column_names.includes(c))

  countries_multiple_column_names.forEach(name => {
    countries.push(combine_regions(all_countries.filter(result => result['Country/Region'] == name)))
  })

  return countries.filter(remove_negatives)
}

const combine_regions = initial_regions => {
  const combined = {}
  initial_regions.forEach(region => {
    _.forEach(region, (val, key) => {
      if (validKey(key)) {
        if (combined.hasOwnProperty(key)) combined[key] += parseInt(val)
        else combined[key] = parseInt(val)
      } else if (key == 'Country/Region') combined[key] = val
    })
  })
  return combined
}

const remove_negatives = area => {
  let found_case = false
  _.forEach(area, (val, key) => {
    if (validKey(key)) if (parseInt(val) != 0) found_case = true
  })
  return found_case
}
