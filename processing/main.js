const lowerCase = require('lodash/lowerCase')
const mergeObject = require('./utils/merge-object')
const restructureInputs = require('./utils/restructure-inputs')
const fileWriter = require('./utils/file-writer')
const getCsvFromUrl = require('./utils/get-csv-from-url')
const getCsvFromDisk = require('./utils/get-csv-from-disk')
const getJsonFromDisk = require('./utils/get-csv-from-disk')
const createHashMapFromObjectArray = require('./utils/create-hashmap-from-array')

const rename = require('./utils/mutations/rename')
const addPopulation = require('./utils/mutations/add-population')
const transformTimeSeries = require('./utils/mutations/transform-timeseries')
const deleteInsignificant = require('./utils/mutations/delete-insignificant')

const NZAdvanced = require('./get-nz-advanced')
const getAdvancedCountries = require('./get-advanced')
const getCumulatives = require('./get-cumulatives')

const sources = require('./sources')

async function createFiles(dir) {
  // Creates a file
  // NZAdvanced.get(dir)

  const writeFile = fileWriter(dir)

  try {
    const confirmed = await getCsvFromUrl(sources.confirmed)
    const deaths = await getCsvFromUrl(sources.deaths)
    const recovered = await getCsvFromUrl(sources.recovered)
    const populationData = await getCsvFromDisk(sources.population).then(
      createHashMapFromObjectArray('Country Name', '2018', lowerCase, parseInt)
    )
    // const nz_data = await getJsonFromDisk(sources.country.nz)

    // new Promise((resolve, reject) => {
    //   request('https://covidtracking.com/api/states/daily', (err, _, body) => {
    //     if (err) reject(err)
    //     us_data = getUnitedStates(JSON.parse(body))
    //     us_cum = getCumulatives(us_data.states)
    //     resolve()
    //   })
    // }),

    const countries = mergeObject(
      restructureInputs(confirmed),
      restructureInputs(deaths),
      restructureInputs(recovered),
      'Country/Region'
    )

    rename(
      countries,
      new Map([
        ['US', 'United States'],
        ['Korea, South', 'South Korea'],
        ['Czechia', 'Czech Republic'],
        ['Timor-Leste', 'East Timor'],
        ['Taiwan*', 'Taiwan'],
        ["Cote d'Ivoire", 'Ivory Coast'],
      ])
    )

    addPopulation(countries, populationData)
    transformTimeSeries(countries)
    deleteInsignificant(countries)

    // countries.set('United States', us_data.total_only)
    // countries.set('New Zealand', nz_data)

    writeFile('countries', [...countries.values()])
    writeFile('cumulative', getCumulatives(countries))
    writeFile('advanced', getAdvancedCountries(confirmed, deaths, recovered, populationData))
  } catch (err) {
    console.log(err)
  }
}

if (process.argv.length == 3) {
  createFiles(process.argv[2])
} else {
  console.log('Whoops!Usage:\nnode get.js path_to_output_folder')
}
