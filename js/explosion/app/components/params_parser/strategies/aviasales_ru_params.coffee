{format, parse} = require('finity-js')
map = require('lodash/map')
reduce = require('lodash/reduce')

parse_query_string = (qs) ->
  unless qs and (qs.charAt 0) == '?'
    return {}

  urlParamsArray = qs.substr(1).replace(/\+/g, ' ').split '&'
  urlParams = map(urlParamsArray, (param) ->
    map (param.split '='), (p) ->
      try decodeURIComponent(p) catch e then console.log(e, p)
  )
  reduce(urlParams, ((params, [name, value]) -> params[name] = value; params), {})

date_picker_format = ['D MMMM YYYY', 'DD.MM.YY', 'DD.MM.YYYY', 'YYYY-MM-DD', 'YYYY.MM.DD', 'DD-MM-YYYY']

SEGMENT_KEY_MAP =
  destination: 'destination_name'
  destination_iata: 'destination'
  origin: 'origin_name'
  origin_iata: 'origin'
  depart_date: 'date'

parseDate = (date) ->
  try
    parse(date, date_picker_format)
  catch error
    console.warn "Error: #{error}. With unnecessary date value: #{date}"
    null

params_map = {
  '^(range|one_way|oneway|auto_subscribe)$': (p, matches, value) ->
    p[matches[1]] = value in ['true', true, '1']

  '^(utm_source|marker|show_subscriptions|unsubscribe)$': (p, matches, value) ->
    p[matches[1]] = value

  '^(trip_class)$': (p, matches, value) ->
    p[matches[1]] = value

  '^(force_marker)$': (p, matches, value) ->
    p.force_marker = true

  '^(currency)$': (p, matches, value) ->
    p.currency = value.toLowerCase()

  '^(adults|children|infants)$': (p, matches, value) ->
    p['passengers'] or= {
      adults: 0
      infants: 0
      children: 0
    }
    p['passengers'][matches[1]] = parseInt(value, 10)

  #affiliate forms
  '^(destination_iata|origin_iata)$': (p, matches, value) ->
    [key, _trash] = matches[1].split('_')
    p.segments ?= [{}]
    p.segments[0][key] = value

  '^((destination|origin)(_name)?)$': (p, matches, value) ->
    postfix = if ~matches.indexOf('_name') then '' else '_name'
    p.segments ?= [{}]
    p.segments[0]["#{matches[1]}#{postfix}"] = value

  '^depart_date$': (p, matches, value) ->
    p.segments or= [{}]
    date = parseDate(value)
    p.segments[0].date = format(date, 'YYYY-MM-DD') if date

  '^return_date$': (p, matches, value) ->
    date = parseDate(value)
    p.return_date = format(date, 'YYYY-MM-DD') if date

  '^segments\\\[([0-9]+)\\\]\\\[([a-z\_]+)\\\]$': (p, matches, value) ->
    p['segments'] or= []

    idx = +matches[1]
    p['segments'][idx] or= {}

    key = SEGMENT_KEY_MAP[matches[2]] || matches[2]
    p['segments'][idx][key] = value

  '^filter_(gates|stops|airlines)$': (p, matches, value) ->
    p.precheckedFilters = {}
    p.precheckedFilters[matches[0]] = value.split(/\s*,\s*/)
    p

  '^debug$': (p, matches, value) ->
    p['debug'] = true
    p

  '^force_desktop$': (p, matches, value) ->
    p['forceDesktop'] = value in ['true', true, '1']
    p

  '^ticket$': (p, matches, value) ->
    p['ticket'] = value
    p

  '^t$': (p, matches, value) ->
    p['t'] = value
    p

  '^(start_search|with_request|startSearch)$': (p, matches, value) ->
    p['start_search'] = value in ['true', true, '1']
    p
}

module.exports = (location) ->
  params = parse_query_string(location)
  parsed_params = {}
  for param_name, value of params
    #prepare oldest params
    param_name = param_name.replace(/search\[(\w+)\]/, '$1') if param_name.match(/^search\[.*\]$/g)
    for regex, callback of params_map
      reg = new RegExp(regex, 'g')
      matches = reg.exec(param_name)
      if matches? && value
        callback(parsed_params, matches, value)
        break

  if parsed_params.return_date and parsed_params.segments
    segment = parsed_params.segments[0]
    parsed_params.segments.push(
      origin: segment.destination
      origin_name: segment.destination_name
      destination: segment.origin
      destination_name: segment.origin_name
      date: parsed_params.return_date
    )
    delete parsed_params.return_date

  if parsed_params.oneway
    parsed_params.one_way = parsed_params.oneway
    delete parsed_params.oneway

  if parsed_params.one_way
    delete parsed_params.one_way
    parsed_params.segments = [parsed_params.segments[0]]

  if parsed_params.debug
    window.debug = true
  parsed_params
