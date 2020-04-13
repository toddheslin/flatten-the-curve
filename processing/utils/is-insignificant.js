module.exports = country => {
  return country.population < 1000000 && country.highest_confirmed < 10
}
