import memoize from 'lodash/memoize'
import uniq from 'lodash/uniq'
import sortBy from 'lodash/sortBy'

FOOTPRINT_PATTERN = /^(([a-zA-Z]|\d)+_([a-zA-Z]|\d)+)(_(\d+)|)$/
AIRLINE_IATA_REGEXP = /([A-Z]{2})/gi

BLANK_TICKET = {
  sign: null
  segment: []
  carriers: []
  segment_durations: []
  segments_airports: []
  stops_airports: []
  price: Infinity
  min_stop_duration: Infinity
}

BLANK_FLIGHT = {
  departure_timestamp: 0
  local_departure_timestamp: 0
  arrival_timestamp: 0
  local_arrival_timestamp: 0
  duration: 0
  airports: []
  arrival_time: '00:00'
  departure_time: '00:00'
  arrival_date: '2017-01-01'
  departure: 'MOW'
  arrival: 'LED'
}

# Example:
# DP15015888001501604400000320VKOFMMZMU15019443001501959000000185FMMVKO_775c72efe66193e1f35e2daa09bf70ef_11947
export parse = (footprint) ->
  return unless FOOTPRINT_PATTERN.test(footprint)
  [ticketData, sign, price] = footprint.split('_')
  parts = ticketData.substr(2).match(/[0-9]+[a-z]+/gi)
  segment_durations = []
  airline = ticketData.substr(0, 2)
  segment = for part in parts
    departure_timestamp = +part.substr(0, 10)
    arrival_timestamp = +part.substr(10, 10)
    duration = +part.substr(20, 6)
    airports = part.substr(26).match(/.{3}/g)
    segment_durations.push(duration)
    {
      flight: [Object.assign({}, BLANK_FLIGHT, {
        departure_timestamp: departure_timestamp
        local_departure_timestamp: departure_timestamp
        arrival_timestamp: arrival_timestamp
        local_arrival_timestamp: arrival_timestamp
        duration: duration
        airports: airports
        departure: airports[0]
        arrival: airports[airports.length - 1]
      })]
    }
  Object.assign({}, BLANK_TICKET, {
    carriers: [airline]
    price: price | Infinity
    segment: segment
    segment_durations: segment_durations
    sign: sign
  })


# NOTE: if u wanna use it - don't! Use the new version. That module only for support old version
# Example:
# 1406AZ5951406AZ6202106AZ6212206SU7018_33212
export parseOld = (footprint) ->
  [ticketData, price] = footprint.split('_')
  airlineIata = AIRLINE_IATA_REGEXP.exec(ticketData)?[0]
  Object.assign({}, BLANK_TICKET, {
    footprintOld: ticketData
    price: if price then parseInt(price, 10)
    carriers: [airlineIata]
    segment: [{flight: [Object.assign({}, BLANK_FLIGHT)]}]
    segment_durations: [0]
  })

export create = memoize((ticket) ->
  signs = [ticket.validating_carrier]
  try
    for idx, segment of ticket.segment
      signs.push("#{segment.flight[0]['local_departure_timestamp']}")
      signs.push("#{segment.flight[segment.flight.length - 1]['local_arrival_timestamp']}")
      signs.push(('000000' + ticket.segment_durations[idx]).substr(-6))

      airports = []
      for flight in segment.flight
        airports.push(flight['departure'])
        airports.push(flight['arrival'])
      Array.prototype.push.apply(signs, uniq(airports))
  catch e
    #
  [signs.join(''), ticket.sign].join('_')
, (ticket) -> ticket.sign)

export createOld = (ticket) ->
  signs = []
  for segment in ticket.segment
    for flight in segment.flight
      parts = flight['departure_date'].split('-')
      signs.push(parts[2] + parts[1] + flight['operating_carrier'] + flight['number'].toString())
  sortBy(signs).join('')

export isTicketFootprint = (ticket, footprint) ->
  createOld(ticket) is footprint

export default {parse, parseOld, create, createOld, isTicketFootprint}
