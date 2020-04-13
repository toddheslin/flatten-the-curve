const { parse, format, getUnixTime, isValid, parseISO } = require('date-fns')

module.exports = date => {
  const isoDate = isValid(parseISO(date))
    ? date
    : format(parse(date, 'MM/dd/yy', new Date()), 'yyyy-MM-dd') + 'T00:00:00.000Z'

  return {
    date: isoDate,
    epoch: getUnixTime(parseISO(isoDate)),
  }
}
