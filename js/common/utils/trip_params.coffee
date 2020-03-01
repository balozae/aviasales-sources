Cookie = require('oatmeal-cookie')
getJSON = require('utils/get_json')
shortUrlParser = require('./short_url_parser.coffee')
{parse, parseOld} = require('./ticket_footprint')
dateWithoutTimezone = require('utils/date_without_timezone')
finity = require('finity-js')
paramsParser = require('params_parser/strategies/aviasales_ru_params')
{checkTripClass} = require('utils/trip_class_helper.ts')
{getTripType} = require('trip_helper')
import {getPossibleParams} from 'form/utils'

MAX_POSSIBLE_FAR_DEPART_DATE_DAYS = 30 * 9
ONE_DAY = 60 * 60 * 24 * 1000
geoipResult = null
geoipRequest = null
geoipCallbacks = []

buildSegments = ({origin, destination}, {returnDate, departDate}) ->
  segments = [{origin: TripParams.ensureCity(origin), destination: TripParams.ensureCity(destination), date: departDate}]
  if returnDate
    segments.push({
      origin: TripParams.ensureCity(destination),
      destination: TripParams.ensureCity(origin),
      date: returnDate
    })
  segments

isEnoughDataForBuildingSegments = (params = {}) ->
  params.origin or
    params.destination or
    params.depart_date or
    params.return_date

parseDate = (dateString) ->
  return unless dateString
  date = finity.parse(dateString, 'YYYY-MM-DD')
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

getDates = (departDate, returnDate) ->
  result = {}
  departDate = parseDate(departDate)
  if departDate and departDate >= Date.now() - ONE_DAY
    result.departDate = departDate
  else
    return result
  returnDate = parseDate(returnDate)
  if returnDate and departDate <= returnDate
    result.returnDate = returnDate
  result

SEARCH_HOTELS_COOKIE_NAME = 'uncheck_hotel_cookie'

TripParams =
  ensureCity: (city) ->
    return unless city
    if typeof city is 'string'
      iata: ''
      search: city
      name: ''
      coordinates: city.coordinates
      type: city.type or ''
    else
      {iata, name, cityIata} = city
      name: name or ''
      iata: iata or ''
      coordinates: city.coordinates
      cityIata: cityIata ? iata
      type: city.type or ''

  getCookieParams: ->
    # NOTE: we remove old cookie cuz its sooo huge that server drop the user request
    Cookie.expire('search_params')
    searchString = Cookie.get('last_search')
    return {} unless searchString
    params = shortUrlParser(searchString)
    # NOTE: there is workaround of infinity expire date of cookie that set departure date to the next year #SERP-854
    #       we can remove that one day (after 1-07-2018)
    departDate = params.segments?[0]?.date
    if departDate and finity.diff(new Date(departDate), new Date()) > MAX_POSSIBLE_FAR_DEPART_DATE_DAYS
      Cookie.expire('last_search')
      return {}
    return params

  getPageParams: ->
    element = document.querySelector('[data-page-search-params]')
    return unless element
    params = JSON.parse(element.getAttribute('data-page-search-params'))
    if params.hasOwnProperty('segments')
      params
    else
      @oldFormatParams(params)

  getURLParams: ->
    params = paramsParser(window.location.search)
    Cookie.set('force_desktop', '1') if params.forceDesktop
    params = if params.segments
      params.segments = params.segments.reduce((segments, segment) ->
        segments.concat([
          origin: TripParams.ensureCity({iata: segment.origin, name: segment.origin_name})
          destination: TripParams.ensureCity({iata: segment.destination, name: segment.destination_name})
          date: parseDate(segment.date)
        ])
      , [])
      params
    else
      Object.assign({}, params, @oldFormatParams(params))
    Object.assign({}, params, @parseHighlightedTicket(params))

  parseHighlightedTicket: (params) ->
    highlightedTicket = parse(params.t) if params.t
    highlightedTicket = parseOld(params.ticket) if params.ticket
    Object.assign({}, params, {highlightedTicket})

  getSubscribeParams: ->
    element = document.querySelector('[data-page-subscribe-params]')
    if element
      JSON.parse(element.getAttribute('data-page-subscribe-params'))
    else
      @getPageParams()

  getParams: ->
    Object.assign {},
      getPossibleParams(),
      @getCookieParams(),
      @getPageParams(),
      @getURLParams()

  getNormalizedParams: ->
    if (@normalizedParams)
      return  @normalizedParams
    params = @getParams()
    shouldStartSearch = params.start_search and params.start_search isnt 'false'
    # HACK: Если пол-ль получил страничку серча из статики, то в [data-page-search-params] не будут лежать попаршаные
    # параметры, поэтому нам нужно запустить поиск предварительно попарсив его url js'ом.
    if @isItSearchPage() and not shouldStartSearch
      url = window.location.pathname.split('/search/')[1]
      parsedParams = shortUrlParser(url)
      if parsedParams.segments
        params = Object.assign({}, params, parsedParams)
        shouldStartSearch = true
    @normalizedParams = Object.assign({}, {
      highlightedTicket: params.highlightedTicket
      segments: @castSegments(params)
      tripClass: checkTripClass(params.trip_class)
      tripType: getTripType(params)
      searchHotels: if Cookie.get(SEARCH_HOTELS_COOKIE_NAME) then 0 else 1
      startSearch: shouldStartSearch
      passengers:
        adults: params.passengers?.adults or 1
        children: params.passengers?.children or 0
        infants: params.passengers?.infants or 0
      with_request: params.with_request
      precheckedFilters: if params.precheckedFilters then params.precheckedFilters else null
    })
    return @normalizedParams

  isItSearchPage: ->
    return true if window.location.pathname.indexOf('/search/') is 0
    false

  castSegments: ({segments = []}) ->
    for segment in segments
      Object.assign({}, segment, {
        id: Math.random().toString(36).substring(7)
        date: dateWithoutTimezone(segment.date) if segment.date
      })

  oldFormatParams: (params) ->
    return {} if not isEnoughDataForBuildingSegments(params)
    dates = getDates(params.depart_date, params.return_date)
    result = {segments: buildSegments(params, dates)}
    if params.adults or params.children or params.infants
      result.passengers =
        adults: parseInt(params.adults) or 1
        children: parseInt(params.children) or 0
        infants: parseInt(params.infants) or 0
    result

  getAllPassengersCount: (passengers) ->
    Object.values(passengers).reduce((a, b) -> a + b)

  isOpenJaw: (segments) ->
    return if segments.length is 0
    return true if segments and segments.length > 2
    if segments and segments.length is 2
      first = segments[0]
      last = segments[segments.length - 1]
      return (first.origin.iata isnt last.destination?.iata) or
          (first.destination.iata isnt last.origin?.iata)
    false

  resetPageParams: ->
    document.querySelector('[data-page-search-params]')?.setAttribute('data-page-search-params', '""')

export default TripParams
