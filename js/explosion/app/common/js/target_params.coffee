{format, diff} = require('finity-js')
{getPassengersAge} = require('utils')
{dateWithoutTimezone} = require('utils_date')
i18next = require('i18next').default
{getTopLevelDomain} = require('common/utils/domain')

DATE_FORMATS_MAP =
  '': 'YYYYMMDD'
  _reverse: 'DDMMYYYY'
  _dash: 'YYYY-MM-DD'
  _dot: 'YYYY.MM.DD'
  _dash_reverse: 'DD-MM-YYYY'
  _dot_reverse: 'DD.MM.YYYY'

getPassengersAgeList = (passengers) ->
  arr = []
  for [qnty, age], i in passengers
    age = getPassengersAge(qnty, age)
    arr.push(age) if age
  arr.join(',')

formatTargetDates = (depart_date, return_date) ->
  dateFormats = {}
  for key, pattern of DATE_FORMATS_MAP
    dateFormats["ddate#{key}"] = format(depart_date, pattern)
    dateFormats["rdate#{key}"] = if return_date then format(return_date, pattern) else ''
  dateFormats

getFullParams = (params, distance) ->
  departDate = dateWithoutTimezone(params.segments[0].date)
  returnDate = if params.segments.length > 1 then dateWithoutTimezone(params.segments[1].date) else null
  adults = params.passengers?.adults or 1
  children = params.passengers?.children or 0
  infants = params.passengers?.infants or 0
  Object.assign(
    formatTargetDates(departDate, returnDate),
    dest_ctry: params.segments[0].destination_country
    dest_ctry_name: params.segments[0].destination_country_name
    trp_cls: params.tripClass
    trp_type: params.tripType
    dest_city: params.segments[0].destination
    dest_airpt: params.segments[0].original_destination
    dest_nm: params.segments[0].destination_name
    orgn_ctry: params.segments[0].origin_country
    orgn_ctry_name: params.segments[0].origin_country_name
    orgn_city: params.segments[0].origin
    orgn_airpt: params.segments[0].original_origin
    orgn_nm: params.segments[0].origin_name
    distance: distance if distance > 0
    adt: adults
    cld: children
    inf: infants
    psng_age: getPassengersAgeList([[adults, 25], [children, 7], [infants, 1]])
    vld_car: params.carier
    stops: params.stops?.join(',')
    d_stops: params.depart_stops_count
    r_stops: params.return_stops_count
    td: (if returnDate then diff(returnDate, departDate) else null)
    host: getTopLevelDomain(),
    lang: i18next.language || 'ru',
    exist: params.isUserEmailExist,
  )

targetParams = (params, distance = 0) ->
  result = {}
  for key, value of getFullParams(params, distance)
    result[key] = value if value
  result

module.exports =
  targetParams: targetParams
