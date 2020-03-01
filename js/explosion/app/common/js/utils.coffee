memoize = require('lodash/memoize')
{getTripType} = require('trip_helper')

is_open_jaw = (segments) ->
  getTripType({segments}) is 'multiway'

isFullyTrain = (segments) ->
  segments?.every((segment) ->
    segment.flight?.every((flight) -> flight.is_train)
  )

module.exports =
  min: (collection) ->
    minimal = collection[0]
    for val in collection.slice(1)
      minimal = val if val < minimal
    minimal

  max: (collection) ->
    maximal = collection[0]
    for val in collection.slice(1)
      maximal = val if val > maximal
    maximal

  generate_id: -> (0|Math.random()*9e6).toString(36)

  is_open_jaw: is_open_jaw

  chindlrenString: (str = '', count, age) ->
    return str unless count
    res = (age for i in [1..count]).join(',')
    if str.length and res.length then "#{str},#{res}" else res

  getPassengersAge: (qnty, age) ->
    return '' unless qnty
    (age + i for i in [0..(qnty - 1)]).join(',')

  once_log: memoize(->
    console.log.apply(console, arguments)
    JSON.stringify(arguments)
  )

  # XXX: with_count: false is better
  pluralize: (count, variants, with_count = false) ->
    m10 = count % 10
    m100 = count % 100
    if (m10 is 1 and m100 isnt 11)
      res = variants[0]
    else if ((2 <= m10 <= 4) and (m100 < 10 or 20 <= m100))
      res = variants[1]
    else
      res = variants[2]
    if with_count
      res = "#{count} #{res}"
    res

  getTicketDeparture: (ticket) ->
    ticket[0].segment[0].flight[0].departure

  getTicketArrival: (ticket) ->
    flights = ticket[0].segment[0].flight
    flights[flights.length - 1].arrival

  isFullyTrain: isFullyTrain

  isToday: (date) ->
    date.toDateString() is new Date().toDateString()

  isTomorrow: (date) ->
    today = new Date()
    tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000))
    date.toDateString() is tomorrow.toDateString()
