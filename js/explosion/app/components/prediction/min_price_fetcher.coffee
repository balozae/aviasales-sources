import xhr from 'xhr'
import {addDays, format} from 'finity-js'
import marker from 'marker'
import {TripClass} from 'common/types'

MIN_PRICES_SERVER = 'https://lyssa.aviasales.ru'
MIN_PRICE_API_URL = "#{MIN_PRICES_SERVER}/v1/latest_prices?show_errors=true&"
PRICE_MATRIX_API_URL = "#{MIN_PRICES_SERVER}/price_matrix?"
# TODO: move it to props
RECONNECT_ATTEMPTS = 2
RECONNECT_DELAY = 1000 # in ms
MATRIX_RANGE = 6
MATRIX_MID_RANGE = MATRIX_RANGE / 2

groupBy = (collection, groupKey) ->
  result = {}
  for item in collection
    key = item[groupKey]
    result[key] ?= []
    result[key].push(item)
  result

groupPrices = (group) ->
  result = {}
  for returnDate, prices of group
    if returnDate is 'null' # We group by return_date so it has string key
      result = prices
    else
      result[returnDate] = prices
  result

export default class MinPriceFetcher
  constructor: (@props) ->
    @graphCache = {}
    @matrixCache = {}

  _prepareGraphParams: ({origin, destination, tripDuration, isAffiliate, onlyDirect, tripClass}) ->
    obj =
      origin_iata: origin
      destination_iata: destination
      affiliate: isAffiliate
      only_direct: onlyDirect
      trip_class: if tripClass is TripClass.Economy then 0 else 1 # Lyssa supports only economy
    if tripDuration or tripDuration is 0
      obj.min_trip_duration = obj.max_trip_duration = tripDuration
    else
      obj.one_way = true
    obj

  _prepareMatrixParams: (params) ->
    departRange = if params.departRange then params.departRange else MATRIX_RANGE
    returnRange = if params.returnRange then params.returnRange else MATRIX_RANGE
    departDateShift = if departRange then (departRange - 1) / 2 else MATRIX_MID_RANGE
    returnDateShift = if returnRange then (returnRange - 1) / 2 else MATRIX_MID_RANGE
    {
      origin_iata: params.originCityIata
      destination_iata: params.destinationCityIata
      depart_start: format(addDays(params.departDate, -departDateShift), 'YYYY-MM-DD')
      return_start: format(addDays(params.returnDate, -returnDateShift), 'YYYY-MM-DD') if params.returnDate
      depart_range: departRange
      return_range: returnRange if params.returnDate
      affiliate: marker.is_affiliate(marker.get())
    }

  _castMatrixData: (data) ->
    result = groupBy(data, 'depart_date')
    for departDate, prices of result
      result[departDate] = groupPrices groupBy(prices, 'return_date')
    result

  _prepareQuery: (paramsObj) ->
    params = for name, param of paramsObj when typeof(param) isnt 'undefined'
      name + '=' + encodeURIComponent(param)
    params.join('&')

  abort: ->
    @_graphXHR.abort() if @_graphXHR
    @_matrixXHR.abort() if @_matrixXHR

  _getCache: (type, {tripDuration, departDate, returnDate}) ->
    if type is 'graph'
      if tripDuration? then @graphCache[tripDuration] else @graphCache
    else if type is 'matrix'
      return @matrixCache if @_hasMatrixCache(departDate, returnDate)
    else

  _hasMatrixCache: (departDate, returnDate = null) ->
    departDateStart = format(addDays(departDate, -MATRIX_MID_RANGE), 'YYYY-MM-DD')
    departDateEnd = format(addDays(departDate, MATRIX_MID_RANGE), 'YYYY-MM-DD')
    if returnDate
      returnDateStart = format(addDays(returnDate, -MATRIX_MID_RANGE), 'YYYY-MM-DD')
      returnDateEnd = format(addDays(returnDate, MATRIX_MID_RANGE), 'YYYY-MM-DD')
      @matrixCache[departDateStart]?[returnDateStart]? and @matrixCache[departDateEnd]?[returnDateEnd]?
    else
      @matrixCache[departDateStart]? and @matrixCache[departDateEnd]?

  fetch: (params, type = 'graph') ->
    callback = null
    req = null
    switch type
      when 'graph'
        callback = @props.onGraphResponse
        req = @_makeGraphRequest
      when 'matrix'
        callback = @props.onMatrixResponse
        req = @_makeMatrixRequest
    cache = @_getCache(type, params)
    if cache and Object.keys(cache).length
      callback(null, null, cache)
      return
    @abort()
    req.call(this, params, callback)

  _mergeMatrixCache: (matrixCache, newData, oneway = false) ->
    if oneway
      for departDate, price of newData
        matrixCache[departDate] or= price
    else
      for departDate, prices of newData
        matrixCache[departDate] or= {}
        for returnDate, price of prices
          matrixCache[departDate][returnDate] or= price

  _makeMatrixRequest: (rawParams, callback, retries = RECONNECT_ATTEMPTS) ->
    params = @_prepareMatrixParams(rawParams)
    url = PRICE_MATRIX_API_URL + @_prepareQuery(params)
    @_matrixXHR = xhr({
      url: url
      method: 'get'
    }, (error, response, body) =>
      return if response.statusCode is 0
      if not error and response.statusCode is 200
        result = JSON.parse(body)
        if Object.keys(result.errors).length > 0
          console.warn('Price matrix prices errors: ', result.errors)
        @_mergeMatrixCache(@matrixCache, @_castMatrixData(result.prices), not rawParams.returnDate)
        callback(null, response, @matrixCache)
      else if retries > 0
        req = @_makeMatrixRequest.bind(this, rawParams, callback)
        setTimeout(->
          console.debug("[#{retries}] Retry", url)
          req(retries - 1)
        , RECONNECT_DELAY)
      else if error
        console.warn('Price matrix connection error', error)
        callback(error)
      else
        console.warn('Price matrix server error', error)
        callback(null, response)
    )

  _makeGraphRequest: (rawParams, callback, retries = RECONNECT_ATTEMPTS) ->
    params = @_prepareGraphParams(rawParams)
    url = MIN_PRICE_API_URL + @_prepareQuery(params)
    # TODO: request timeout
    @_graphXHR = xhr({
      url: url
      method: 'get'
    }, (error, response, body) =>
      return if response.statusCode is 0
      if not error and response.statusCode is 200
        result = JSON.parse(body)
        if Object.keys(result.errors).length > 0
          console.warn('Graph prices errors: ', result.errors)
        if params.one_way
          @graphCache = result.prices
        else
          @graphCache[rawParams.tripDuration] = result.prices
        callback(null, null, result.prices)
      else if retries > 0
        req = @_makeGraphRequest.bind(this, rawParams, callback)
        setTimeout(->
          console.debug("[#{retries}] Retry", url)
          req(retries - 1)
        , RECONNECT_DELAY)
      else if error
        console.warn('Min prices connection error', error)
        callback(error)
      else
        console.warn('Min prices server error', error)
        callback(null, response)
    )

  getCache: (tripDuration) ->
    @_getCache('graph', {tripDuration})

  getRequestsQuantity: ->
    Object.keys(@getCache() or {}).length
