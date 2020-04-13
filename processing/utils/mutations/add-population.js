const lowerCase = require('lodash/lowerCase')

module.exports = (countries, populationData) => {
  for (const [k, country] of countries) {
    // Add the population
    country.population = populationData.get(lowerCase(country.name))
  }
}
