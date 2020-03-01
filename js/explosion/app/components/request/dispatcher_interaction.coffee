dispatcher = require('dispatcher').default
RequestProcessor = require('./request_processor')
marker = require('marker')
cookies = require('oatmeal-cookie')
store = require('common/js/redux/store').default
{ getYasenDebug } = require('common/js/redux/selectors/debug_settings.selectors')
rollbar = require('common/utils/rollbar').default
guestia = require('guestia/client').default
{TimeoutError, ServerError} = require('utils/errors')
AnalyticsCallback = require('analytics/stoyan_analytics')
{getTopTicketsPrices} = require('common/js/redux/selectors/tickets.selectors.ts')
i18next = require('i18next').default
defer = require('utils/defer').default
{updateSearchStatus} = require('common/js/redux/actions/search_status.actions')
{reachGoal} = require('common/js/redux/actions/metrics.actions')
{setError} = require('common/js/redux/actions/error.actions')
{updateCheapestStops} = require('common/js/redux/actions/cheapest_stops.actions')
{updateCheapestTicket} = require('common/js/redux/actions/cheapest_ticket.actions')
{updateServerName} = require('common/js/redux/actions/server_name.actions')
{updateGatesMeta} = require('common/js/redux/actions/gates_meta.actions')
{setErrorDuringSearch} = require('common/js/redux/actions/error_during_search.actions')
defaultResizer = require('shared_components/resizer').default
{ isMobile } = require('shared_components/resizer')
{getTopLevelDomain} = require('common/utils/domain')

SEARCH_EXPIRED_TIMEOUT = 60 * 15 * 1000 # 15 min

send = (event, data) ->
  dispatcher.send(event, data, 'dispatcher_interaction')

getMarket = ->
  marketAttribute = document.documentElement.getAttribute('data-market')
  parsedHost = window.location.hostname.split('.')
  if marketAttribute
    marketAttribute
  else if parsedHost.length > 1
    parsedHost.pop()
  else
    'ru'

di = {
  _requests: {}
  _sent_city_distances: {}
  _send_first_tickets: {}
  _send_preroll_question: {}
  _send_adsense_query: {}
  _send_airline_features: {}
  _sent_server_names: {}
  sort_order: 'price'
  expiredTimeout: null

  start: (id, params, sort_order) ->
    clearTimeout(@expiredTimeout)
    @_stop_all()
    @_requests[id] = request = new RequestProcessor(id, @callbacks(), sort_order)
    request.start(params)

  _stop_all: ->
    @stop(req_id) for req_id, _req of @_requests

  stop: (id) ->
    @_requests[id].stop()
    delete @_requests[id]

  set_filters_state: (id, with_composing, filters_func) ->
    @_requests[id]?.set_filters(with_composing, filters_func)

  reset_filters_state: (id) ->
    @_requests[id].reset_filters()

  set_sort_order: (id, sort_order) ->
    @_requests[id].set_sort_order(sort_order)

  callbacks: ->
    currencies_updated: (request_id, currencies) ->

    city_distance_updated: (request_id, city_distance) =>
      unless @_sent_city_distances[request_id]
        send('city_distance_updated', {request_id: request_id, city_distance: city_distance}, 'disp_interaction')
        @_sent_city_distances[request_id] = true

    server_name_updated: (request_id, server_name) =>
      unless @_sent_server_names[request_id]
        store.dispatch(updateServerName(request_id, server_name))
        @_sent_server_names[request_id] = true

    segments_updated: (request_id, segments) ->
      send('segments_updated', {request_id: request_id, segments: segments}, 'disp_interaction')

    airlines_updated: (request_id, airlines) ->
      send('airlines_updated', {request_id: request_id, airlines: airlines}, 'disp_interaction')

    airline_rules_updated: (request_id, airline_rules) ->
      send('airline_rules_updated', {request_id: request_id, airline_rules: airline_rules}, 'disp_interaction')

    airports_updated: (request_id, airports) ->
      send('airports_updated', {request_id: request_id, airports: airports}, 'disp_interaction')

    gates_updated: (request_id, gates) ->
      send('gates_updated', {request_id: request_id, gates: gates}, 'disp_interaction')

    credit_partner_updated: (request_id, credit_partner) ->
      send('credit_partner_updated', {request_id: request_id, credit_partner: credit_partner}, 'disp_interaction')

    preroll_question_updated: (request_id, preroll_question) =>
      unless @_send_preroll_question[request_id]
        send('preroll_question_updated', {request_id: request_id, preroll_question: preroll_question}, 'disp_interaction')
        @_send_preroll_question[request_id] = true

    airline_features_updated: (request_id, airline_features) =>
      unless @_send_airline_features[request_id]
        send('airline_features_updated', {request_id: request_id, airline_features: airline_features}, 'disp_interaction')
        @_send_airline_features[request_id] = true

    boundaries_updated: (request_id, boundaries) ->
      send('boundaries_updated', {request_id: request_id, boundaries: boundaries}, 'disp_interaction')

    tickets_updated: (request_id, tickets, reason = 'append') =>
      unless request_id of @_send_first_tickets
        store.dispatch(updateSearchStatus('SHOWN'))
        @_send_first_tickets[request_id] = true
      AnalyticsCallback.on_update_tickets(getTopTicketsPrices(tickets))
      send('tickets_updated', {request_id: request_id, tickets: tickets, reason: reason}, 'disp_interaction')

    # TODO: extract to the request_processor and add direct to the store?
    cheapest_stops_updated: (request_id, tickets, reason = 'append') ->
      cheapest_stops = {}
      for ticket in tickets
        stops = ticket[0].max_stops
        if cheapest_stops.hasOwnProperty(stops) and ticket[1][0].unified_price < cheapest_stops[stops]
          cheapest_stops[stops] = ticket[1][0].unified_price
        else if !cheapest_stops.hasOwnProperty(stops)
          cheapest_stops[stops] = ticket[1][0].unified_price
        trip_class = ticket[0]?.segment[0]?.flight[0].trip_class
      store.dispatch(updateCheapestStops(cheapest_stops))

    cheapest_ticket_updated: (request_id, ticket) ->
      store.dispatch(updateCheapestTicket(ticket))

    fuzzy_tickets_updated: (request_id, tickets) ->
      send('fuzzy_tickets_updated', {request_id: request_id, tickets: tickets}, 'disp_interaction')

    adsense_query_updated: (request_id, adsense_query) =>
      unless @_send_adsense_query[request_id]
        send('adsense_query_updated', {request_id: request_id, adsense_query: adsense_query}, 'disp_interaction')
        @_send_adsense_query[request_id] = true

    search_id_updated: (request_id, search_id) =>
      @search_id = search_id
      send('search_id_updated', {request_id: request_id, search_id: search_id}, 'disp_interaction')

    finish: (request_id) =>
      AnalyticsCallback.on_search_finished()
      store.dispatch(reachGoal('SEARCH_FINISHED', search_id: @search_id.search_id))
      store.dispatch(updateSearchStatus('FINISHED'))
      if @_send_first_tickets[request_id]
        @expiredTimeout = setTimeout( =>
          store.dispatch(updateSearchStatus('EXPIRED'))
          store.dispatch(reachGoal('SEARCH_EXPIRED', search_id: @search_id.search_id))
        , SEARCH_EXPIRED_TIMEOUT)

    isFirstTicketShown: (request_id) =>
      @_send_first_tickets[request_id]

    error: (request_id, {err, searchId, requestParams}) ->
      type = 'search_failed'
      rollbar.configure({payload: {searchId: searchId, requestParams: requestParams}})
      rollbar.warn(err)
      if err instanceof TimeoutError
        store.dispatch(reachGoal('SEARCH_RESPONSE_TIMED_OUT'))
      else if err instanceof ServerError
        type = switch err.response?.status
          when 400
            # FIXME: rewrite when yasen can return error code
            if /date/gi.test(err.message)
              'wrong_dates'
            else if /origin|destination/gi.test(err.message)
              'wrong_places'
            else
              'bad_search_params'
          when 403 then 'access_denied'
          else 'search_failed'
        store.dispatch(reachGoal('SEARCH_RESPONSE_ERROR', {type}))
      unless @isFirstTicketShown(request_id)
        store.dispatch(setError(type))
        store.dispatch(reachGoal('SEARCH_FAILED'))
      else
        store.dispatch(setErrorDuringSearch())
        @finish(request_id)

    gates_meta_updated: (request_id, meta) ->
      store.dispatch(updateGatesMeta({request_id: request_id, meta: meta}))
}

prevRequestId = null
store.subscribe( ->
  tld = getTopLevelDomain()
  hostParam = if isMobile() then "m.aviasales.#{tld}" else window.location.host
  state = store.getState()
  searchStatus = state.searchStatus
  params = state.searchParams
  requestId = state.requestId
  if prevRequestId isnt requestId and requestId
    search_params = {
      know_english: guestia?.getSettings('know_english') is 'true'
      trip_class: params.tripClass
      debug: getYasenDebug(state)
      currency: params.currency
      passengers: params.passengers
      segments: for segment in params.segments
        {
          date: segment.date
          origin: segment.origin_iata or segment.origin
          destination: segment.destination_iata or segment.destination
        }
      market: getMarket()
      locale: i18next.language or i18next.languages[0] or 'ru'
      host: hostParam
      auid: cookies.get('auid')
      marker: marker.get()
      responsive: defaultResizer.currentMode() || 'desktop',
      challenge_result: 'ok'
    }
    rollbar.configure({payload: {yasen_request: {request_id: requestId, search_params: search_params}}})
    defer(->
      AnalyticsCallback.on_start_search(search_params)
      store.dispatch(reachGoal('SEARCH_STARTED'))
    )
    di.start(requestId, search_params, di.sort_order)
    ga?('send', 'event', 'search_page', 'start', 'search')
  if requestId
    prevRequestId = requestId
)

dispatcher.on('filters_state_updated', (event, {request_id, with_composing, filter_func}) ->
  with_composing = true if with_composing == undefined
  di.set_filters_state(request_id, with_composing, filter_func)
)

dispatcher.on('reset_filters_state', (event, {request_id}) ->
  di.reset_filters_state(request_id)
)

dispatcher.on('sort_order_updated', (event, {request_id, sort_order}) ->
  di.set_sort_order(request_id, sort_order)
)
