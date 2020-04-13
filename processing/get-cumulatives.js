const _ = require('lodash')
const { produce, enableMapSet } = require('immer')

enableMapSet()

module.exports = areasRef => {
  const maxDays = 50

  /**
   * Cumulative number of cases, by number of days since 100th case
   * @param {Object} area
   */
  function aggConfirmed(area) {
    const range = [100, 250, 500, 1000, 5000]

    return range.map(range => {
      let dayCount = 0

      const time_series = area.time_series.reduce((result, day) => {
        if (day.confirmed >= range && dayCount <= maxDays) {
          result.push({
            num_day: dayCount,
            date: day.date,
            confirmed: day.confirmed,
          })
          dayCount++
          return result
        }
        return result
      }, [])

      return { range, time_series }
    })
  }

  /**
   * Cumulative number of deaths, by number of days since 10th deaths
   * @param {Object} area
   */
  function aggDeaths(area) {
    const range = [10, 50, 100, 250, 500]

    return range.map(range => {
      let dayCount = 0

      const time_series = area.time_series.reduce((result, day) => {
        if (_.has(day, 'deaths') && day.deaths >= range && dayCount <= maxDays) {
          result.push({
            num_day: dayCount,
            date: day.date,
            deaths: day.deaths,
          })
          dayCount++
          return result
        }
        return result
      }, [])

      return { range, time_series }
    })
  }

  return [
    ...produce(areasRef, areas => {
      for (const [k, area] of areas) {
        area.confirmed = aggConfirmed(area)
        area.deaths = aggDeaths(area)
        delete area.time_series
      }
      return areas
    }).values(),
  ]
}
