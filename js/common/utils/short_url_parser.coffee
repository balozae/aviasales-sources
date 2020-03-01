{parse, format, dayOfYear, addYears, addDays, diff, isLeap} = require('finity-js')
search_re = require('./short_url_regex').default

getTripClass = (value) ->
  ## NOTE: b - business (deprecated)
  if not value
    tripClass = 'Y'
  else if value is 'b'
    tripClass = 'C'
  else
    tripClass = value.toUpperCase()

module.exports = (pathname) ->
  match = decodeURIComponent(pathname).match(search_re)
  if not match and window.Rollbar
    window.Rollbar.warning('Cant parse short url', {pathname: window.location.pathname})
  return {} if !match
  parsed_params = {}
  min_date = new Date()
  # NOTE: we should set hours to start of day for correct diff in days
  # (bug of finity-js with ceiling diff values)
  min_date.setHours(0, 0, 0, 0)
  current_year = min_date.getFullYear()
  segments = []
  first_origin = null
  for index in [1, 3, 5, 7, 9, 11, 13]
    iata = match[index]
    date_match = (match[index + 1] or '').match(/\d{2}/g)
    first_segment = index == 1
    last_segment = (index is 13) or !match[index + 4]
    break if !iata
    continue if not date_match or date_match is '-'
    trip_date = +date_match[0]
    trip_month = +date_match[1]
    date = parse("#{trip_date}-#{trip_month}-#{current_year}", 'DD-MM-YYYY')
    dateDiff = diff(date, min_date)
    # NOTE: add 1 year when trip date is before yesterday
    date = addYears(date, 1) if dateDiff < -1
    # NOTE: we should subsctract 1 day when it is 29.02 of next leap year
    # because it is parsed as 01.03 when current year is non-leap
    date = addDays(date, -1) if not isLeap(min_date) and isLeap(date) and trip_date is 29 and trip_month is 2
    if first_segment
      first_origin = iata
      segments.push({
        origin:
          iata: iata
          name: ''
          search: ''
        destination:
          iata: match[index + 2]
          name: ''
          search: ''
        date: format(date, 'YYYY-MM-DD')
      })
    else if match[index + 2]
      segments.push({
        origin:
          iata: iata
          name: ''
          search: ''
        destination:
          iata: match[index + 2]
          name: ''
          search: ''
        date: format(date, 'YYYY-MM-DD')
      })
    else if last_segment and date
      segments.push({
        origin:
          iata: iata
          name: ''
          search: ''
        destination:
          iata: first_origin
          name: ''
          search: ''
        date: format(date, 'YYYY-MM-DD')
      })
  parsed_params.segments = segments
  parsed_params.trip_class = getTripClass(match[15])
  parsed_params.passengers =
    adults: +match[16]
    children: +match[17] or 0
    infants: +match[18] or 0
  parsed_params.with_request = true
  parsed_params
