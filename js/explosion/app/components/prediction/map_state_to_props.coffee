import {diff} from 'finity-js'
import update from 'immutability-helper'
import {is_open_jaw as isOpenJaw} from 'utils'
import marker from 'marker'
import {getKey} from './price_utils'
import {dateWithoutTimezone} from 'utils_date'
import {TripClass} from 'common/types'

_adultsOnly = ({passengers}) ->
  return false unless passengers
  not (passengers.children or passengers.infants)

_getInitialFlight = (params) ->
  [from, to] = params.segments
  departDate = dateWithoutTimezone(from.date)
  returnDate = if to then dateWithoutTimezone(to.date) else null
  {
    departDate
    returnDate
    tripClass: params.tripClass
    origin: from.origin
    originCityIata: params.originCityIata
    destinationCityIata: params.destinationCityIata
    destination: from.destination
    price: null
    isPlacesRestored: params.isPlacesRestored
  }

_getInititalTripDuration = ({segments}) ->
  return null unless segments?.length
  [from, to] = segments
  return null unless to
  returnDate = new Date(to.date)
  diff(returnDate, new Date(from.date), true) if returnDate

_extendGraphPrices = (prices, departDate, cheapestStops) ->
  return prices unless Object.keys(cheapestStops).length
  prices = prices.slice()
  index = diff(departDate, new Date())
  value = Math.min.apply(null, value for _numberOfChanges, value of cheapestStops)
  update(prices, $splice: [[index, 1, {departDate, value}]])

_prepareGraph = (state, {departDate}, initialTripDuration) ->
  {prices, initialPrices, tripDuration} = state.prediction.graph
  return {prices: [], initialPrices: [], tripDuration: tripDuration} unless prices
  if initialTripDuration is tripDuration
    prices = _extendGraphPrices(prices, departDate, state.cheapestStops)
  {
    prices
    tripDuration
    initialPrices: _extendGraphPrices(initialPrices, departDate, state.cheapestStops)
  }

export default (state) ->
  initialFlight = _getInitialFlight(state.searchParams)
  initialTripDuration = _getInititalTripDuration(state.searchParams)
  graph = _prepareGraph(state, initialFlight, initialTripDuration)
  {
    graph
    initialFlight
    hasMatrixPrices: Boolean(state.prediction.matrix.initialPrices)
    searchParams: state.searchParams
    searchId: state.searchId
    showCountdown: state.searchStatus not in ['FINISHED', 'EXPIRED', 'INITED']
    showCalendar: (
      state.searchParams.tripClass is TripClass.Economy and
        not isOpenJaw(state.searchParams.segments) and
        state.searchStatus isnt 'INITED'
    )
    cheapestStops: state.cheapestStops
    searchStatus: state.searchStatus
    formParams: state.aviaParams
  }
