const _ = require('lodash')
const { produce, enableMapSet } = require('immer')

const mergeObject = require('./utils/merge-object')
const generateDates = require('./utils/generate-dates')
const transformTimeSeries = require('./utils/mutations/transform-timeseries')

const getCumulatives = require('./get-cumulatives')

enableMapSet()

// Used to structure the countries by state
const restructureRegion = (confirmed, deaths, recovered, population) => {
  const provincesMap = mergeObject(confirmed, deaths, recovered, 'Province/State')

  function buildRegionAggregate(provinces) {
    const timeSeriesMap = [...provinces.values()].reduce((map, province) => {
      for (const day of province.time_series) {
        // using the day.date in format 'MM/dd/yy' as the unique key
        if (!map.has(day.date)) {
          // add to map with ISO date if doesn't exist
          map.set(day.date, {
            ...day,
            ...generateDates(day.date),
          })
        } else {
          // otherwise mutate the object with an aggregate of cases and deaths
          _.add(map.get(day.date).confirmed, day.confirmed)
          _.add(map.get(day.date).deaths, day.deaths)
        }
      }
      return map
    }, new Map())

    const sortedTimeSeriesArray = [...timeSeriesMap.values()]
      .sort((a, b) => {
        return b.epoch - a.epoch
      })
      .map(day => {
        day.confirmed_per_mil = _.defaultTo(day.confirmed / (population / 1000000), 0)
        day.deaths_per_mil = _.defaultTo(day.deaths / (population / 1000000), 0)
        return day
      })

    const mostRecent = sortedTimeSeriesArray.slice(0, 1)[0]

    return {
      name: 'All',
      population,
      time_series: sortedTimeSeriesArray,
      highest_confirmed: mostRecent.confirmed,
      highest_deaths: mostRecent.deaths,
      highest_recovered: _.defaultTo(mostRecent.recovered, 0),
    }
  }

  return produce(provincesMap, provinces => {
    provinces.set('All', buildRegionAggregate(provinces))
    transformTimeSeries(provinces)
    return provinces
  })
}

/*
 * Used for extracting state level data from JHU
 * Accepts the raw confirmed and death and population data arrays
 * as well as a filterFn for removing specific regions that aren't applicable.
 */
const getCountry = (confirmed, deaths, recovered, populationData, filterFn, countryName) => {
  const data = restructureRegion(
    confirmed.filter(filterFn),
    deaths.filter(filterFn),
    recovered.filter(filterFn),
    populationData.get(countryName)
  )

  return { data, cum: getCumulatives(data) }
}

module.exports = (confirmed, deaths, recovered, populationData) => {
  const canada = getCountry(
    confirmed,
    deaths,
    recovered,
    populationData,
    r =>
      r['Country/Region'] === 'Canada' &&
      r['Province/State'] !== 'Recovered' &&
      r['Province/State'] !== 'Diamond Princess' &&
      r['Province/State'] !== 'Grand Princess',
    'canada'
  )

  const australia = getCountry(
    confirmed,
    deaths,
    recovered,
    populationData,
    r => r['Country/Region'] === 'Australia',
    'australia'
  )

  const china = getCountry(confirmed, deaths, recovered, populationData, r => r['Country/Region'] === 'China', 'china')

  return [
    // {
    //   name: 'United States',
    //   slug: 'united-states',
    //   data: us_data.states,
    //   cum: us_cum,
    // },
    {
      name: 'Canada',
      slug: 'canada',
      data: [...canada.data.values()],
      cum: canada.cum,
    },
    {
      name: 'Australia',
      slug: 'australia',
      data: [...australia.data.values()],
      cum: australia.cum,
    },
    {
      name: 'China',
      slug: 'china',
      data: [...china.data.values()],
      cum: china.cum,
    },
  ]
}
