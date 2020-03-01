# NOTE: legacy file, mb should use single func for short url building
# /js/common/utils/search_url.coffee, for example

# NOTE: Copying is temporary solution. Can't use ES6 import with CommonJS
# TODO: import helper from static/js/common/utils/trip_class_helper.ts
tripClasses = {
  economy: 'Y',
  premiumEconomy: 'W',
  business: 'C',
  firstClass: 'F',
}

checkTripClass = (value = 'Y') ->
  # NOTE: support old format 1(Business) and 0(Economy) for affiliates
  code = String(value).toUpperCase()
  if code is '1'
    tripClasses.business
  else if code is '0' or code is tripClasses.economy
    ''
  else if Object.values(tripClasses).includes(code)
    code
  else
    tripClasses.economy


# search_params to url like /LED0903MOW26031
module.exports = (params) ->
  segments = []
  first_iata = null

  for segment, index in params.segments
    force_origin_iata = false
    origin_iata = segment.origin?.iata || params.segments[index].origin
    destination_iata = segment.destination?.iata || params.segments[index].destination
    first_iata = origin_iata if index is 0

    back_to_origin = index == params.segments.length - 1 and first_iata == destination_iata

    if !!prev_destination_iata and (prev_destination_iata != origin_iata)
      segments.push('-')
      force_origin_iata = true

    origin = if ((index is 0) or force_origin_iata) then origin_iata else ''
    destination = if back_to_origin then '' else destination_iata
    date_parts = segment.date.split('-')

    segments.push("#{origin}#{date_parts[2]}#{date_parts[1]}#{destination}")

    prev_destination_iata = destination_iata

  for i in [0..6]
    segments[i] or= ''

  tripClassValue = params.trip_class or params.tripClass

  url_obj =
    segments: segments
    trip_class: checkTripClass(tripClassValue).toLowerCase() # TODO: use trip class helper
    adults: params.passengers.adults
    children: if params.passengers.infants then params.passengers.children else (params.passengers.children or '')
    infants: params.passengers.infants or ''

  "/#{ url_obj.segments[0] }" +
    "#{ url_obj.segments[1] }#{ url_obj.segments[2] }#{ url_obj.segments[3] }" +
    "#{ url_obj.segments[4] }#{ url_obj.segments[5] }#{ url_obj.segments[6] }" +
    "#{ url_obj.trip_class }#{ url_obj.adults }#{ url_obj.children }#{ url_obj.infants }"
