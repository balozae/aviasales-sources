import update from 'immutability-helper'

CHEAPEST_TICKET_FACTOR = 1.02

extendPricesWithCurrentDay = (prices, cheapestStops, searchParams) ->
  {children, infants} = searchParams.passengers
  return prices unless children is 0 and infants is 0
  return prices unless Object.keys(cheapestStops).length
  cheapestValues = for numberOfChanges, value of cheapestStops
    {number_of_changes: +numberOfChanges, value}
  departKey = searchParams.segments[0].date
  change = if searchParams.segments.length > 1
    returnKey = searchParams.segments[1].date
    if prices[departKey]
      {"#{returnKey}": {$set: cheapestValues}}
    else
      {$set: {"#{returnKey}": cheapestValues}}
  else
    {$set: cheapestValues}
  update(prices, "#{departKey}": change)

matrixPickPrice = (prices, isOnlyDirect) ->
  if isOnlyDirect
    prices = prices.filter (price) -> price.number_of_changes is 0
  return null if prices.length is 0
  prices.reduce((prev, current) ->
    return current unless prev or prev.value
    if prev.value < current.value then prev else current
  )

getFilteredPrices = (data, isOnlyDirect) ->
  result = {}
  for departDate, prices of data
    if Array.isArray(prices)
      price = matrixPickPrice(prices, isOnlyDirect)
      result[departDate] = price if price
    else
      result[departDate] ?= {}
      returnDates = prices
      for returnDate, prices of returnDates when (price = matrixPickPrice(prices, isOnlyDirect))
        result[departDate][returnDate] = price
  result

prepareMatrixPrices = (storeState, pricesKey = 'prices') ->
  prices = storeState.prediction.matrix[pricesKey] or {}
  getFilteredPrices(
    extendPricesWithCurrentDay(prices, storeState.cheapestStops, storeState.searchParams)
    storeState.prediction.matrix.isOnlyDirect
  )

export prepareMatrixPrices = prepareMatrixPrices
export matrixPickPrice = matrixPickPrice
