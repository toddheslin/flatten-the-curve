const isInsignificant = require('../is-insignificant')

/**
 * Remove insignificant countries in terms of Covid-19
 */
module.exports = countries => {
  for (const country of countries) {
    if (isInsignificant(country)) {
      countries.delete(country)
    }
  }
}
