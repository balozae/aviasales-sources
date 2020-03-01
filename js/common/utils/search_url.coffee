{format} = require('finity-js')
toParam = require('utils/to_param')
{checkTripClass} = require('utils/trip_class_helper.ts')
{TripClass} = require('common/types')

fullUrl = (params) ->
  '?' + toParam(params)

isShortUrlPossible = (params) ->
  for {origin, destination} in params.segments
    return false unless origin?.iata or destination?.iata
  true

_buildShortUrl = (segments, {passengers: {adults, children, infants}, tripClass = 'Y'}) ->
  segments[i] or= '' for i in [0..6]
  '/' + [
    segments.join(''),
    if checkTripClass(tripClass) isnt TripClass.Economy then checkTripClass(tripClass).toLowerCase() else '',
    adults,
    if infants then children else (children or ''),
    infants or ''
  ].join('')

shortUrl = (params) ->
  segments = []
  firstIata = null
  for segment, index in params.segments
    forceOriginIata = false
    originIata = segment.origin?.iata
    destinationIata = segment.destination?.iata
    unless originIata and destinationIata
      window.Rollbar.error('Cannot build search url', {search_params: params})
    firstIata = originIata if index is 0
    backToOrigin = index is params.segments.length - 1 and firstIata is destinationIata
    if !!prevDestinationIata and (prevDestinationIata isnt originIata)
      segments.push('-')
      forceOriginIata = true
    origin = if ((index is 0) or forceOriginIata) then originIata else ''
    destination = if backToOrigin then '' else destinationIata
    date = if segment.date then format(segment.date, 'DDMM') else ''
    segments.push("#{origin}#{date}#{destination}")
    prevDestinationIata = destinationIata
  _buildShortUrl(segments, params)

module.exports = (params) ->
  if isShortUrlPossible(params)
    shortUrl(params)
  else
    fullUrl(params)
