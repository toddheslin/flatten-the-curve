const csv = require('csv-parser')
const fs = require('fs')
const _ = require('lodash')
const request = require('request')
const { parse, isEqual } = require('date-fns')




const createFiles = (country_path, cum_path, us_path, us_cum_path) => {
  let confirmed = [];
  let deaths = []
  let population_data = []

  request('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  .pipe(csv())
  .on('data', data => { confirmed.push(data) })
  .on('end', () => {    
    request('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv')
    .pipe(csv())
    .on('data', data => { deaths.push(data) })
    .on('end', () => {    
      fs.createReadStream('data/population_world_bank.csv')
      .pipe(csv())
      .on('data', data => { population_data.push(data) })
      .on('end', () => {  
        countries = merge_object(
          restructure_inputs(confirmed), 
          restructure_inputs(deaths), 
        )


        // Remove the empty time series data
        _.forEach(countries, (data) => {
          data.time_series = data.time_series.filter( (t) => t.confirmed != 0 )
        })
        // convert stupid date strings to actual dates 
        _.forEach(countries, (data) => {
          data.time_series.map( (t) => {
            t.date = parse(t.date, 'MM/dd/yy', new Date() )
          })
        })
        countries = add_population_data(countries, population_data)
        
        // Relabel country names
        _.forEach(countries, (c) => {
          c.country_name = c.country_name == 'US' ? 'United States' : c.country_name == 'Korea, South' ? 'South Korea' : c.country_name
        })
        
        
        country_array = _.map(countries, (country) => country)

        
        // Remove NZ and remove US and re-add below
        country_array = country_array.filter(country => country.country_name != 'United States' && country.country_name != 'New Zealand')

        // Get covid-tracker data
        
        request('https://covidtracking.com/api/states/daily', (err, _, body) => {    
          if(err) return console.log(err);
          const us_data = getUnitedStates(JSON.parse(body));
          const us_cum = getCumulatives(us_data.states)
          country_array.push(us_data.total_only)
          
          fs.readFile('data/new-zealand.json', (err, data) => {
            if (err) throw err;
            let new_zealand = JSON.parse(data);
            country_array.push(new_zealand)
            const cumulative = getCumulatives(country_array)
          
            fs.writeFile(country_path, JSON.stringify(country_array , null, 2), function(err) {
              if(err) return console.log(err);
              console.log("Country file was saved!");
            }); 
            fs.writeFile(cum_path, JSON.stringify(cumulative, null, 2), function(err) {
              if(err) return console.log(err);
              console.log("Cumulative was saved!");
            }); 
            fs.writeFile(us_path, JSON.stringify(us_data.states, null, 2), function(err) {
              if(err) return console.log(err);
              console.log("US State data was saved!");
            }); 
            fs.writeFile(us_cum_path, JSON.stringify(us_cum, null, 2), function(err) {
              if(err) return console.log(err);
              console.log("US Cum state data was saved!");
            }); 
        });
        });

        

        
        
      })
    })
  });
}



const add_population_data = (areas, population_data) => {

  _.forEach(areas, data => {
    population_data.forEach( (pop_data) => {
      if( pop_data['Country Name'].toLowerCase()  == data.name.toLowerCase() ){
        data.population = parseInt(pop_data['2018'])
        data.time_series.forEach( (time) => {
          if(time.confirmed)
            time.confirmed_per_mil = time.confirmed / (data.population / 1000000)
          if(time.deaths)
            time.deaths_per_mil = time.deaths / (data.population / 1000000)
        })      
      }
    })
  })
  return areas
}

const merge_object = (confirmed, deaths) => {
  let combined = {}
  
  confirmed.forEach( (country) => {
    let name = country['Country/Region'] 
    
    
    highest_confirmed = 0
    
    time_series = []
    _.forEach(country, (val, key) => {
      if(validKey(key)){
        time_series.push( { 
          date: key, confirmed: parseInt(val)
        } )
        if(val > highest_confirmed)
          highest_confirmed = parseInt(val)
      }
    })
    combined[name] = { name, time_series, highest_confirmed }
  })

  deaths.forEach( (country) => {
    highest_deaths = 0
    const name = country['Country/Region']
    _.forEach(country, (val, key) => {
      if(validKey(key)){
        if(combined.hasOwnProperty(name)){
          combined[name].time_series.forEach( (time) => {
            if(key == time.date){
              time.deaths = parseInt(val)
              if(val > highest_deaths)
                highest_deaths = parseInt(val)
            }
          })
          combined[name].highest_deaths = highest_deaths

        }
        
      }
    })
  })

  return combined

}

const restructure_inputs = (all_countries) => {

  const seen_countries = []
  all_countries.forEach( c => {
    const found = _.find( seen_countries, (seen_country) => seen_country.name == c['Country/Region'] );
    if(found){
      found.count += 1
    }
    else{
      seen_countries.push({
        name: c['Country/Region'],
        count: 1
      })
    }

  })
  
  countries_multiple_column_names = seen_countries.filter( (c) => c.count > 1 ).map( c => c.name)

  countries = all_countries.filter( c => ! countries_multiple_column_names.includes(c) )

  countries_multiple_column_names.forEach( name => {
    countries.push(combine_regions(all_countries.filter( (result) => result['Country/Region'] == name)))
  })
  
  return countries.filter(remove_negatives)
}

const combine_regions = (initial_regions) => {
  let combined = {}
  initial_regions.forEach(region => {
  _.forEach(region, (val, key) => {
      if(validKey(key)){
        if( combined.hasOwnProperty(key) ) 
          combined[key] += parseInt(val)
        else 
          combined[key] = parseInt(val)
      }
      else if(key == 'Country/Region')
        combined[key] = val
    })
  });
  return combined
}

const remove_negatives = (area) => {
  let found_case = false
  _.forEach(area, (val, key) => {
    if(validKey(key))
      if( parseInt(val) != 0) 
        found_case = true 
    
  })
  return found_case
}

const validKey = (key) => key != 'Country/Region' && key != 'Province/State' && key != 'Lat' && key != 'Long'

// Country Logic = Cumulative number of cases, by number of days since 100th case
// Death Logic = cumulative number of deaths, by number of days since 10th deaths
const getCumulatives = (areas) => {
  const max_days = 30
  const output_areas = []

  const confirmed_ranges = [50, 100, 200, 300, 400, 500, 750, 1000]
  const death_ranges = [10, 20, 30, 40, 50, 75, 100, 200,300, 400, 500]
  // The structure needs to e 
  // We get an array of countries
  
  areas.forEach(area => {
    
    const confirmed = []
    const deaths = []
    
    confirmed_ranges.forEach(range => {
      let count_of_days = 0
      const confirmed_for_range = []

      area.time_series.forEach(day => {
        if(day.confirmed >= range && count_of_days <= max_days){
          confirmed_for_range.push({
            num_day: count_of_days,
            date: day.date,
            confirmed: day.confirmed
          })
          count_of_days++
        }
      })
      confirmed.push({
        range,
        time_series: confirmed_for_range
      })
    })

    death_ranges.forEach(range => {
      count_of_days = 0
      deaths_for_range = []
      area.time_series.forEach(day => {
        if(day.hasOwnProperty('deaths') && day.deaths >= range && count_of_days <= max_days){
          deaths_for_range.push({
            num_day: count_of_days,
            date: day.date,
            deaths: day.deaths
          })
          count_of_days++
        }
      })
      deaths.push({
        range,
        time_series: deaths_for_range
      })
    })

    // Either array is populated. Then append area to cumulative output
    if(confirmed.length || deaths.length){ 
      const area_to_append = {
        highest_confirmed: area.highest_confirmed,
        highest_deaths: area.highest_deaths,
        population: area.population,
        name: area.name,
      }

      if(confirmed.length) area_to_append.confirmed = confirmed
      if(deaths.length) area_to_append.deaths = deaths
      
      output_areas.push(area_to_append)
    }
    
  })

  return output_areas

}


const getUnitedStates = (json_data) => {
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
      'WY'
    ]
    let states = []
    state_codes.forEach(state => {
      const time_series = json_data.filter(day => day.state == state)
      const latest = time_series[0]
      const highest_confirmed = latest.positive
      const highest_deaths = latest.death
      const highest_hospitalized = latest.hospitalized
      const highest_tests = latest.totalTestResults
      states.push({
        country_name: state,
        time_series: time_series.reverse().map(day => ({
          date: parse(day.date, 'yyyyMMdd', new Date() ),
          confirmed: day.positive,
          //confirmed_per_mil,
          deaths: day.death,
          //deaths_per_mil
          hospitalized: day.hospitalized,
          tests: day.totalTestResults,
          old_date: day.date
        })),
        highest_confirmed,
        highest_deaths, 
        highest_hospitalized,
        highest_tests
      })
    })

    const total_time_series = {}

    states.forEach(state => {
      state.time_series.forEach(day => {
        if(total_time_series.hasOwnProperty(day.old_date)){
          total_time_series[day.old_date].confirmed += day.confirmed
          total_time_series[day.old_date].deaths += day.deaths
          total_time_series[day.old_date].hospitalized += day.hospitalized
          total_time_series[day.old_date].tests += day.tests
        }
        else{
          total_time_series[day.old_date] = day
        }
      })
    })

    const US_time_series = _.map(total_time_series, day => day)
    const most_recent_day = US_time_series[US_time_series.length -1]
    const total = {
      name: "United States",
      population: 327167434,
      time_series: US_time_series,
      highest_confirmed: most_recent_day.confirmed,
      highest_deaths: most_recent_day.deaths,
      highest_hospitalized: most_recent_day.hospitalized,
      highest_tests: most_recent_day.tests
    }

    total.time_series.forEach(day => {
      day.confirmed_per_mil = day.confirmed / (total.population / 1000000)
      day.deaths_per_mil =    day.deaths / (total.population / 1000000)
      day.hospitalized_per_mil = day.hospitalized / (total.population / 1000000)
      day.tests_per_mil =    day.tests / (total.population / 1000000)
    })

    states.push(total)
    
    return {
      states,
      total_only: total
    }
}



if(process.argv.length == 6 ) createFiles(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
else{
  console.log("Whoops!Usage:\nnode get.js country.out cumulative.out")
  getUnitedStates()
}
