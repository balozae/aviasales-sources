{dateWithoutTimezone} = require('utils_date')
finity = require('finity-js')
i18next = require('i18next')

getFormTripType = (segments) ->
  if segments[0].origin.iata is segments[1].destination.iata and segments[0].destination.iata is segments[1].origin.iata
    return 'roundtrip'
  else 'multiway'

getSearchTripType = (segments) ->
  if segments[0].origin is segments[1].destination and segments[0].destination is segments[1].origin
    return 'roundtrip'
  else 'multiway'

# Trip type
#
# @return {String} oneway | roundtrip | multiway
getTripType = (searchParams) ->
  segments = searchParams.segments
  return false unless segments
  switch
    when segments.length is 1 then 'oneway'
    when segments.length is 2
      if (segments[0] and segments[1] and
          segments[0].origin and segments[0].destination and
          segments[1].origin and segments[1].destination
          )
        if (segments[0].origin.iata and
            segments[0].destination.iata and
            segments[1].origin.iata and
            segments[1].destination.iata
            )
          getFormTripType(segments)
        else if (typeof segments[0].origin is 'string' and
            typeof segments[0].destination is 'string' and
            typeof segments[1].origin is 'string' and
            typeof segments[1].destination is 'string'
            )
          getSearchTripType(segments)
    else 'multiway'

# @return {String} из Владивостока в Хабаровск | в Хабаровск
getSegmentTitle = (searchParams, segmentIndex) ->
  tripType = getTripType(searchParams)
  segmentData = searchParams.segments[segmentIndex]
  if tripType is 'oneway'
    {
      destination_cases, destination_name, destination: destinationIata,
      origin_cases, origin_name, origin: originIata
    } = segmentData
    origin = origin_cases?.ro or origin_name or originIata
    # NOTE: destination_cases?.vi берется из searchParams и должно обновляться при смене языка
    destination =
      destination_cases?.vi or
      i18next.t('common:toDestination', {destination: destination_name}) or
      i18next.t('common:toDestination', {destination: destinationIata})
    i18next.t('common:fromOriginToDestination', {origin: origin, destination: destination})
  else
    {destination_cases, destination_name, destination: destinationIata} = segmentData
    # NOTE: destination_cases?.vi берется из searchParams и должно обновляться при смене языка
    destination_cases?.vi or
    i18next.t('common:toDestination', {destination: destination_name}) or
    i18next.t('common:toDestination', {destination: destinationIata})

# @return {Bool}
# TODO: multiway case
isCurrentSearchDates = (searchParams, {departDate, returnDate}) ->
  searchDepartDate = dateWithoutTimezone(searchParams.segments[0].date)
  if returnDate
    searchReturnDate = dateWithoutTimezone(searchParams.segments[1].date)
    searchDepartDate == departDate and searchReturnDate == returnDate
  else
    searchDepartDate == departDate

# @return {Bool}
haveChilds = (searchParams) ->
  return unless searchParams.passengers
  not (searchParams.passengers.children is 0 and searchParams.passengers.infants is 0)

# @return {Number}
getPassengersAmount = (searchParams) ->
  return 0 unless searchParams?.passengers
  passengersAmount = 0
  for type, value of searchParams.passengers
    passengersAmount += value
  passengersAmount

# @return {Array[String]} ['MOW', 'AER']
getRouteArray = (searchParams) ->
  tripType = getTripType(searchParams)
  segments = searchParams.segments
  switch tripType
    when 'oneway', 'roundtrip'
      [segments[0].origin, segments[0].destination]
    when 'multiway'
      segments.reduce((result, segment, i) ->
        if (segments[i - 1]?.destination is segment.origin)
          result.push(segment.destination)
        else
          result.push(segment.origin, segment.destination)
        result
      , [])

# @return {String} 23.04 - 28.04, MOW ⇄ AER | MOW ⇄ AER, 23.04 - 28.04
searchParamsToTitle = (searchParams, datesFirstFormat = false) ->
  return unless searchParams
  tripType = getTripType(searchParams)
  icon = if tripType is 'roundtrip' then '⇄' else '→'
  # NOTE: add locale argument if change finity format with months/days names
  dates = (finity.format(segment.date, 'DD.MM') for segment in searchParams.segments).join(' - ')
  route = getRouteArray(searchParams).join(" #{icon} ")
  if datesFirstFormat
    dates + ', ' + route
  else
    route + ', ' + dates

module.exports = {
  getTripType
  getSegmentTitle
  isCurrentSearchDates
  haveChilds
  getRouteArray
  searchParamsToTitle
  getPassengersAmount
}
