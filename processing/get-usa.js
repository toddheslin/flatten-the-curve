const getUnitedStates = json_data => {
  const state_codes = [
    'AK',
    'AL',
    'AR',
    'AS',
    'AZ',
    'CA',
    'CO',
    'CT',
    'DC',
    'DE',
    'FL',
    'GA',
    'GU',
    'HI',
    'IA',
    'ID',
    'IL',
    'IN',
    'KS',
    'KY',
    'LA',
    'MA',
    'MD',
    'ME',
    'MI',
    'MN',
    'MO',
    'MP',
    'MS',
    'MT',
    'NC',
    'ND',
    'NE',
    'NH',
    'NJ',
    'NM',
    'NV',
    'NY',
    'OH',
    'OK',
    'OR',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VA',
    'VI',
    'VT',
    'WA',
    'WI',
    'WV',
    'WY',
  ]
  const states = []
  state_codes.forEach(state => {
    const time_series = json_data.filter(day => day.state == state)
    const latest = time_series[0]
    const highest_confirmed = latest.positive
    const highest_deaths = latest.death
    const highest_hospitalized = latest.hospitalized
    const highest_tests = latest.totalTestResults
    const highest_recovered = latest.recovered
    states.push({
      name: state,
      time_series: time_series.reverse().map(day => ({
        date: format(parse(day.date, 'yyyyMMdd', new Date()), 'yyyy-MM-dd') + 'T00:00:00Z',
        confirmed: day.positive || 0,
        // confirmed_per_mil,
        deaths: day.death || 0,
        // deaths_per_mil
        hospitalized: day.hospitalized || 0,
        tests: day.totalTestResults || 0,
        old_date: day.date,
        recovered: day.recovered || 0,
      })),
      highest_confirmed,
      highest_deaths,
      highest_hospitalized,
      highest_tests,
      highest_recovered,
    })
  })

  const total_time_series = {}

  states.forEach(state => {
    state.time_series.forEach(day => {
      if (total_time_series.hasOwnProperty(day.old_date)) {
        total_time_series[day.old_date].confirmed += day.confirmed
        total_time_series[day.old_date].deaths += day.deaths
        total_time_series[day.old_date].hospitalized += day.hospitalized
        total_time_series[day.old_date].tests += day.tests
        total_time_series[day.old_date].recovered += day.recovered
      } else {
        total_time_series[day.old_date] = Object.assign({}, day)
      }
    })
  })

  const US_time_series = _.map(total_time_series, day => day)
  const most_recent_day = US_time_series[US_time_series.length - 1]

  const total = {
    name: 'United States',
    population: 327167434,
    time_series: US_time_series,
    highest_confirmed: most_recent_day.confirmed,
    highest_deaths: most_recent_day.deaths,
    highest_hospitalized: most_recent_day.hospitalized,
    highest_tests: most_recent_day.tests,
    highest_recovered: most_recent_day.recovered,
  }

  total.time_series.forEach(day => {
    day.confirmed_per_mil = day.confirmed / (total.population / 1000000)
    day.deaths_per_mil = day.deaths / (total.population / 1000000)
    day.hospitalized_per_mil = day.hospitalized / (total.population / 1000000)
    day.tests_per_mil = day.tests / (total.population / 1000000)
    day.recovered_per_mil = day.recovered / (total.population / 1000000)
  })

  states.push(total)

  return {
    states,
    total_only: total,
  }
}
