import {format} from 'finity-js'

export CHEAPEST_TICKET_FACTOR = 1.02

export eachPrice = (prices, iteratee) ->
  if Array.isArray(prices)
    for item in prices
      if item.hasOwnProperty('value')
        return if iteratee(item) is false
      else
        eachPrice(item, iteratee)
  else
    for key, item of prices
      if item.hasOwnProperty('value')
        return if iteratee(item) is false
      else
        eachPrice(item, iteratee)

export getCheapestValue = (prices) ->
  return Infinity if not prices or not Object.keys(prices).length
  result = []
  eachPrice(prices, ({value}) ->
    result.push(value) if value
  )
  Math.min.apply(null, result)

export isCheap = (value, cheapestValue) ->
  return false unless value
  value <= Math.round(cheapestValue * CHEAPEST_TICKET_FACTOR)

export getKey = (date1, date2) ->
  key = format(date1, 'YYYY-MM-DD')
  key += "-#{format(date2, 'YYYY-MM-DD')}" if date2
  key
