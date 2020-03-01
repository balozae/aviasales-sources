_ =
  isEmpty: require('lodash/isEmpty')
  uniq: require('lodash/uniq')
  isUndefined: require('lodash/isUndefined')
  sortedLastIndexBy: require('lodash/sortedLastIndexBy')
  includes: require('lodash/includes')
  union: require('lodash/union')
  filter: require('lodash/filter')
  map: require('lodash/map')
  flatten: require('lodash/flatten')

utils = require('utils.coffee')
YasenClient = require('./yasen_client').default
marker = require('marker.coffee')
store = require('redux/store').default
{updateSearchData} = require('common/js/redux/actions/search_params.actions')
{reachGoal} = require('common/js/redux/actions/metrics.actions')
{getTopTicketBySortKey} = require('common/js/redux/selectors/tickets.selectors.ts')
{TripClass} = require('common/types')
{getSegmentSignature} = require('shared_components/ticket/utils/common.utils')
{default: patchTicketTarrifs} = require('./ticket_tariffs_processor/ticket_tariffs_processor')
{default: TicketsBadgesFetcher} = require('./tickets_badges_fetcher')
{promoTicketCreated, updateTicketsBadges} = require('common/js/redux/actions/tickets_badges.actions')
{filterBannerInfo} = require('./request_processor.utils')
{default: extractPromoTickets} = require('./extract_promo_tickets')
Cookies = require('oatmeal-cookie')

isMagicGate = (gateId) ->
  return false unless gateId?
  parseInt(gateId) < 0

# Hack for Globus -> S7 renaming
AIRLINES_MERGE_MAP =
  GH:
    id: 444,
    name: 'S7 Airlines',
    iata: 'S7'
AEROFLOT_GATE_ID = '236'
AZAL_IATA = 'J2'

carriers_key = (carriers) ->
  carriers.sort().join(',')

is_valid_banner = (banner_campaign, banner_data) ->
  if _.isEmpty(banner_data) or /backup_/.test(banner_campaign) or _.isUndefined(banner_data.data?.main_color)
    utils.once_log('invalid banner', banner_campaign, banner_data)
    false
  else
    true

replace_carrier = (object, from, to) ->
  object.operating_carrier = to if object.operating_carrier is from
  object.validating_carrier = to if object.validating_carrier is from

class RequestProcessor
  _should_raise_productivity: (carriers, gate_id) ->
    'raise_productivity_airlines' of @gates[gate_id] and
      carriers_key(carriers) in @gates[gate_id].raise_productivity_airlines

  _merge_proposals: (ticket) ->
    terms = ticket.xterms
    # NOTE: use trusted ticket instead new one, if it is available
    [ticket, proposals] = @tickets_by_sign[ticket.sign] ? [ticket, []]
    for gate_id, gate_proposals of terms
      if @gates[gate_id].top_placement_type isnt 'only'
        should_raise_productivity = @_should_raise_productivity(ticket.carriers, gate_id)
        for key, proposal of gate_proposals
          proposal.gate_id = gate_id
          proposal.is_charter = Boolean(ticket.is_charter)
          proposal.fare_codes = key.split(';').map((codes) -> codes.split(','))
          proposal.fare_codes_key = key
          if should_raise_productivity
            # we have to increase productivity only for gate_proposals
            proposal.productivity = 1
          insert_to = _.sortedLastIndexBy(proposals, proposal, (p) =>
            # sort by price and then by productivity
            # Store productivity in proposal instead of change gate productivity by reference
            # to prevent losing of it on next chunk when other gate has more productivity
            productivity = p.productivity or @gates[p.gate_id].productivity or 0
            multiplier = p.multiplier or @gates[p.gate_id].multiplier or 1
            p.debugProductivity = productivity
            p.debugMultiplier = multiplier
            p.debugProposalMultiplier = p.proposal_multiplier
            parseFloat(p.unified_price) - ((productivity * multiplier) / 1000)
          )
          proposals.splice(insert_to, 0, proposal)
    proposals

  constructor: (@id, @di_callbacks, @sort_order) ->
    @params = {}
    @filters_state = {}
    @yasen_client = null
    @tickets_by_sign = {}
    @tickets_list = []
    @tickets = []
    @gates = {}
    @search_id = {}
    @airlines = {}
    @airline_rules = {}
    @airports = {}
    @average_prices = {}
    @currencies = {}
    @boundaries = {}
    @banner_info = {}
    @flight_info = {}
    @segments = []
    @products = []
    @gates_meta = []
    @top_placement_ticket = null
    @tariff_mapping = {}
    @cheapest_top_placement_ticket = null
    @top_placement_strike_price = null
    @heaviest_top_placement = null
    @geoIpCountry = null
    @geoip_city = null
    @market = null
    @top_filters = []
    @showGatesFeedbackData = {isShowForAll: false, gateIds: []}
    @bestSellerData = {}
    @withPromoTickets = false
    @badgesBySign = {}

  start: (@params) ->
    @yasen_client = new YasenClient(@params, {
      on_update: @on_update
      on_finish: @on_finish
      on_error: @on_error
    })

  stop: ->
    if @yasen_client
      @yasen_client.abort()

  checkTopPlacementProperty: (property, ticket) ->
    value = @heaviest_top_placement.data[property]
    value is undefined or value is ticket[property]

  checkTopPlacementCarrier: (ticket) ->
    value = @heaviest_top_placement.data.operating_carrier
    value is undefined or (ticket.carriers.length is 1 and ticket.carriers[0] is value)

  _find_top_placement_ticket: (ticket) ->
    gate_id = parseInt(Object.keys(ticket.terms)[0])
    return unless @heaviest_top_placement.data.gate_id is gate_id
    return unless @checkTopPlacementProperty('validating_carrier', ticket)
    return unless @checkTopPlacementProperty('max_stops', ticket)
    return unless @checkTopPlacementCarrier(ticket)
    if @gates[gate_id].top_placement_type is 'only'
      @_add_top_placement_ticket(ticket, gate_id)
    else # 'mixed'
      price = @cheapest_top_placement_ticket?.terms[gate_id].unified_price
      if price is undefined or ticket.terms[gate_id].unified_price < price
        @cheapest_top_placement_ticket = ticket

  processGate: (gateId, gate) ->
    if gate.show_feedback_popup
      @showGatesFeedbackData.gateIds = [gateId, @showGatesFeedbackData.gateIds...]

  getBestSellerData: ->
    return unless @cheapest_ticket and @tickets.length
    ticketsWithWeight = []
    for ticket, i in @tickets
      if ticket[0].flight_weight
        ticketsWithWeight.push({ticket, position: i})
    ticketsWithWeight.sort((a, b) -> b.ticket[0].flight_weight - a.ticket[0].flight_weight)
    for obj, i in ticketsWithWeight
      if obj.ticket[0].sign is @cheapest_ticket[0].sign and i isnt 0
        return
      else if obj.ticket[1][0].unified_price < @cheapest_ticket[1][0].unified_price * 1.3
        @bestSellerData =
          ticketSign: obj.ticket[0].sign
          ticketPosition: obj.position
          ticketPrice: obj.ticket[1][0].unified_price
        return

  process_ticket: (ticket) ->
    if @heaviest_top_placement
      @_find_top_placement_ticket(ticket)
      @_find_top_placement_strike_price(ticket)
    # NOTE: process business class tickets in economy search
    {terms, trip_class, request_trip_class} = ticket
    gate_term = terms[AEROFLOT_GATE_ID]
    if gate_term and trip_class is TripClass.Business and request_trip_class is TripClass.Economy
      if not @cheapest_business or gate_term.unified_price < @cheapest_business.value
        gate_term.gate_id = AEROFLOT_GATE_ID
        @cheapest_business =
          value: gate_term.unified_price
          terms: [gate_term]
          sign: ticket.sign

  _find_top_placement_strike_price: (ticket) ->
    # NOTE: Ищем пропозал от гейта, который был передан в @heaviest_top_placement.data.meta.strike_price_from_gate
    # Берём unified_price этого пропозала и отправляем в сёрч, чтобы на кнопке отрендерить зачёкнутую цену
    # При этом, проверяем, что цена действительно скидочная
    # Так же, нужно сравнивать и искать только цены одинаковых перелётов и а/к.
    # Поэтому, подписываем каждый флайт и сравниваем их с топ-плейсмент билетом
    try
      strike_price_gate_id = @heaviest_top_placement.data.meta.strike_price_from_gate
      if strike_price_gate_id and ticket.terms[strike_price_gate_id] and
          ticket.carriers.join('') is @top_placement_ticket.ticket_info[0].carriers.join('') and
          getSegmentSignature(ticket.segment) is getSegmentSignature(@top_placement_ticket.ticket_info[0].segment) and
          ticket.terms[strike_price_gate_id].unified_price > @top_placement_ticket.min_price and
          (not @top_placement_strike_price or ticket.terms[strike_price_gate_id].unified_price < @top_placement_strike_price)
        @top_placement_strike_price = ticket.terms[strike_price_gate_id].unified_price

  _add_top_placement_ticket: (ticket, gate_id) ->
    ticket.terms[gate_id].gate_id = gate_id
    ticket_copy = Object.assign({}, ticket)
    ticket_info = patchTicketTarrifs([ticket_copy, [ticket_copy.terms[gate_id]]])
    @top_placement_ticket =
      carrier: @gates[gate_id].airline_iatas?[0],
      min_price: ticket_copy.terms[gate_id].unified_price
      ticket_info: ticket_info

  # NOTE: returns a banner proportionally to its weight
  _get_top_placement: (banner_info) ->
    # NOTE: it's a temporary filter for mobile top_placement
    banner_info = filterBannerInfo(banner_info)
    return unless banner_info
    weight_sum = 0
    accumulated_weights = for campaign, data of banner_info
      continue unless is_valid_banner(campaign, data)
      continue unless data.data.show_to_affiliates or not marker.is_affiliate(marker.get())
      weight_sum += data.weight
      [campaign, weight_sum]
    rand = Math.random() * weight_sum
    for [campaign, weight] in accumulated_weights when weight >= rand
      return Object.assign({name: campaign}, banner_info[campaign])
    undefined

  find_ticket_by: (tickets_list, sortKey) ->
    getTopTicketBySortKey(tickets_list, sortKey, @badgesBySign)

  set_ticket_rating: (filtered_tickets, cheapest_ticket) ->
    # https://goo.gl/i8iHsX
    fastest_ticket = @find_ticket_by(filtered_tickets, 'duration')
    fastest_ticket_duration = fastest_ticket[0].total_duration
    cheapest_ticket_price = cheapest_ticket[1][0].unified_price
    for ticket in filtered_tickets
      price = ticket[1][0].unified_price
      # Dont care about duration for direct flights
      duration = if ticket[0].is_direct
        fastest_ticket_duration
      else
        ticket[0].total_duration

      ticket[0].ticket_rating = (duration / fastest_ticket_duration) *
        (price / cheapest_ticket_price)
      if ticket[0].min_stop_duration and ticket[0].min_stop_duration < 60
        ticket[0].ticket_rating += 1

  _compose_products: ->
    return unless @tickets_list
    @cheapest_ticket = @find_ticket_by(@tickets_list, 'price')
    @set_ticket_rating(@tickets_list, @cheapest_ticket) if @tickets_list.length > 0
    @tickets = @tickets_list.slice()
    # .sort(sorter[@sort_order])

  is_innovata: (ticket) ->
    _.includes(Object.keys(ticket.terms), '666')

  merge_airlines: (ticket) ->
    # Hack for J2 azal/buta https://aviasales.atlassian.net/browse/SERP-682
    ticket_by_sign = @tickets_by_sign[ticket.sign]
    if (ticket_by_sign? and AZAL_IATA in ticket_by_sign[0]?.carriers and AZAL_IATA not in ticket.carriers)
      ticket.carriers = ticket_by_sign[0].carriers
      for segment, segmentIndex in ticket.segment
        for flight, flightIndex in segment.flight
          flight_from_ticket_by_sign = ticket_by_sign[0]?.segment[segmentIndex]?.flight[flightIndex]
          flight.operated_by = flight_from_ticket_by_sign.operated_by
          flight.operating_carrier = flight_from_ticket_by_sign.operating_carrier
    if 'J21' in ticket.carriers
      ticket.carriers[ticket.carriers.indexOf('J21')] = AZAL_IATA

    # Hack for Globus -> S7 renaming
    for from, to of AIRLINES_MERGE_MAP
      to = to.iata
      if from in ticket.carriers
        meet_to = false
        carriers = []
        for carrier in ticket.carriers
          if carrier is from or carrier is to
            carriers.push(to) unless meet_to
            meet_to = true
          else
            carriers.push(carrier)
        # Hack for Globus -> S7 (exclude SIP airport: SERP-523)
        isSipAirport = false
        for segment in ticket.segment
          for flight in segment.flight
            if flight.arrival is 'SIP' or flight.departure is 'SIP'
              isSipAirport = true
            else
              replace_carrier(flight, from, to)
        if not isSipAirport
          ticket.carriers = carriers
          replace_carrier(ticket, from, to)

  # Hack for Globus -> S7
  # Include s7 to airlines data, if we dont have any s7 tickets
  merge_airlines_dict: (airlines) ->
    if airlines.GH and not airlines.S7
      airlines.S7 = AIRLINES_MERGE_MAP.GH
    for key, {name, alliance_name, site_name} of airlines
      @airlines[key] = {name, iata: key, allianceName: alliance_name, siteName: site_name}
    @airlines

  merge_left_seats: (ticket) =>
    previous_ticket_seats = @tickets_by_sign[ticket.sign]?[0]?.seats
    seats = []
    for segment in ticket.segment
      for flight in segment.flight when flight.seats
        seats.push(parseInt(flight.seats, 10))
    seats = Math.min(seats...)
    if (not previous_ticket_seats and seats) or seats < previous_ticket_seats
      ticket.seats = seats
    else if previous_ticket_seats
      ticket.seats = previous_ticket_seats

  merge_transport_type: (from_ticket, to_ticket) ->
    return unless from_ticket.is_mixed
    to_ticket.is_mixed = from_ticket.is_mixed
    for segment, segment_index in to_ticket.segment
      for flight, flight_index in segment.flight
        from_flight = from_ticket.segment[segment_index].flight[flight_index]
        flight.is_train = true if from_flight.is_train
        flight.is_bus = true if from_flight.is_bus

  # NOTE: list of proceeses that must fired just once time per search
  once_key_processes: [
    'segments', 'city_distance', 'search_id', 'currency_rates', 'banner_info',
    'adsense_query', 'airline_rules', 'airline_features', 'preroll_question'
  ]

  # NOTE: you should use data name as part of event_name
  # for example: event - currencies_updated, data name - currencies
  # FOO_updated
  # city_distance_updated
  key_processes: ->
    segments: (@segments) =>
      Rollbar?.configure({payload: {yasen_response:{segments: @segments}}})
      @callback_accum[1].push('segments_updated')
    city_distance: (@city_distance) =>
      @callback_accum[0].push('city_distance_updated')
    search_id: (search_id) =>
      @search_id = {search_id: search_id}
      Rollbar?.configure({payload: {yasen_response: {search_id: search_id}}})
      @callback_accum[0].push('search_id_updated')
    currency_rates: (currency_rates) =>
      @currencies = currency_rates
      @callback_accum[0].push('currencies_updated')
    credit_partner: (@credit_partner) =>
      @callback_accum[0].push('credit_partner_updated')
    banner_info: (banner_info) =>
      @heaviest_top_placement = @_get_top_placement(banner_info) if banner_info
    geoip_country: (geoip_country) =>
      @geoIpCountry = geoip_country
    geoip_city: (geoip_city) =>
      @geoip_city = geoip_city
    market: (market) =>
      @market = market
    top_filters: (top_filters) =>
      @top_filters = top_filters
    flight_info: (flight_info) =>
      Object.assign(@flight_info, flight_info)
    gates_info: (gates_info) =>
      for gateId, gate of gates_info
        @processGate(gateId, gate)
      @gates = Object.assign(@gates, gates_info)
      @callback_accum[0].push('gates_updated')
    airports: (airports) =>
      @airports = Object.assign(@airports, airports)
      @callback_accum[0].push('airports_updated')
    adsense_query: (@adsense_query) =>
      @callback_accum[0].push('adsense_query_updated')
    preroll_question: (@preroll_question) =>
      store.dispatch({type: 'ADD_PREROLL_QUESTIONS', prerollQuestions: @preroll_question})
    show_feedback_popup: (show_feedback_popup) =>
      @showGatesFeedbackData.isShowForAll = show_feedback_popup
    airline_features: (@airline_features) =>
      @callback_accum[0].push('airline_features_updated')
    airlines: (airlines) =>
      @merge_airlines_dict(airlines)
      @callback_accum[0].push('airlines_updated')
    airline_rules: (airline_rules) =>
      @airline_rules = Object.assign(@airline_rules, airline_rules)
      @callback_accum[0].push('airline_rules_updated')
    meta: (meta) =>
      return unless meta.gates
      @gates_meta = @gates_meta.concat(meta.gates)
      @callback_accum[1].push('gates_meta_updated')
    tariff_mapping: (mapping) =>
      @tariff_mapping = mapping
    server_name: (@server_name) =>
      @callback_accum[0].push('server_name_updated')
    proposals: (tickets) =>
      return if tickets.length is 0
      cheapest_top_placement_ticket_was = @cheapest_top_placement_ticket
      @tickets_list = @tickets_list.slice()
      # NOTE: all tickets come from same gate per event
      gate_id = +(Object.keys(tickets[0].terms)[0])
      gate = @gates[gate_id]
      isMagic = isMagicGate(gate_id)
      for ticket in tickets
        ticket.orig_gate_id = gate_id
        ticket.marketing_carrier = ticket.segment[0].flight[0].marketing_carrier
        # NOTE: chunk with magic tickets come always last, we include that tickets only when they cheaper
        #       than cheapest ticket
        continue if (isMagic and @cheapest_ticket and
          ticket.terms[gate_id].unified_price >= @cheapest_ticket[1][0].unified_price
        )
        @merge_airlines(ticket)
        @merge_left_seats(ticket)
        continue if @is_innovata(ticket)
        @process_ticket(ticket)
        # FIXME: remove when gates add is_private_jet to proposal, not to gate_info
        ticket.is_private_jet = true if gate.is_private_jet
        ticket.is_sapsan = true if gate.is_sapsan
        if ticket.sign of @tickets_by_sign
          if gate.is_trusted
            @merge_transport_type(@tickets_by_sign[ticket.sign][0], ticket)
            @tickets_by_sign[ticket.sign][0] = ticket
          else
            @merge_transport_type(ticket, @tickets_by_sign[ticket.sign][0])
          @tickets_by_sign[ticket.sign][1] = @_merge_proposals(ticket)
        else
          proposals = @_merge_proposals(ticket)
          if proposals.length > 0
            ticket_item = [ticket, proposals]
            @tickets_by_sign[ticket.sign] = ticket_item
            @tickets_list.push(ticket_item)
        if @tickets_by_sign[ticket.sign]
          @tickets_by_sign[ticket.sign] = patchTicketTarrifs(@tickets_by_sign[ticket.sign])
      if @cheapest_top_placement_ticket isnt cheapest_top_placement_ticket_was
        @_add_top_placement_ticket(@cheapest_top_placement_ticket, Object.keys(@cheapest_top_placement_ticket.terms)[0])
      @fuzzy_tickets = @tickets_list
      if @tickets_list.length
        @callback_accum[2].push('fuzzy_tickets_updated')
        @callback_accum[2].push('tickets_updated')

  # Sort and filter names for firing
  get_processes_names_for_execute: (yasen_response, key_processes) ->
    is_same_search = @search_id.search_id == yasen_response[0]?.search_id
    key_processes_names = Object.keys(key_processes)
    key_processes_names = _.union(['gates_info', 'proposals'], key_processes_names)
    # NOTE: remove events that must fire once per search
    key_processes_names = _.filter(key_processes_names, (process_name) =>
      !(is_same_search && process_name in @once_key_processes)
    )
    # NOTE:
    # Data formatting depends on order.
    # For example, airports are important for proposals.
    # We use lexical sorting and it covers this case.
    # But certainly it would be more correct to set priorities
    key_processes_names.sort()

  fire_di_callbacks: (callback_names) ->
    for callback_name in callback_names
      [data_name..., _verb] = callback_name.split('_')
      data_name = data_name.join('_')
      @di_callbacks[callback_name](@id, @[data_name])

  on_update: (yasen_response, isLastResponse) =>
    # NOTE: accum for firing by order
    @callback_accum = [[], [], []]
    key_processes = @key_processes()
    key_processes_names_for_execute = @get_processes_names_for_execute(yasen_response, key_processes)

    for yasen_data in yasen_response
      for process_name in key_processes_names_for_execute
        value = yasen_data[process_name]
        if process_name of key_processes and (!!value || !_.isEmpty(value))
          key_processes[process_name](value)

    callback_accum = _.map(@callback_accum, (callback_chunk) -> _.uniq(callback_chunk))
    callback_names = _.flatten(callback_accum)

    lastChunk = yasen_response.reverse().find((chunk) -> !!chunk.chunk_id)
    if lastChunk and lastChunk.chunk_id
      TicketsBadgesFetcher(lastChunk.chunk_id, @search_id.search_id).then(@handleTicketsBadgesFetcherCb)
    if isLastResponse and @withPromoTickets
      @extractPromoTickets(@badgesBySign)

    should_fire_products = 'tickets_updated' in callback_names
    if should_fire_products
      @_compose_products()
      callback_names.push('cheapest_ticket_updated')
      @di_callbacks.cheapest_stops_updated(@id, @tickets)

    @fire_di_callbacks(callback_names)
    @getBestSellerData()

    for meta in @gates_meta
      if @gates[meta.id]
        @gates[meta.id].search_label = meta.gate_label

    store.dispatch(updateSearchData({
      tickets: @tickets
      segments: @segments
      cityDistance: @city_distance
      searchId: @search_id.search_id
      currencies: @currencies
      creditPartner: @credit_partner
      gates: @gates
      airports: @airports
      heaviestTopPlacementCampaign: @heaviest_top_placement
      adsenseQuery: @adsense_query
      airlines: @airlines
      airlineFeatures: @airline_features
      airlineRules: @airline_rules
      flightInfo: @flight_info
      showGatesFeedbackData: @showGatesFeedbackData
      bestSellerData: @bestSellerData
      topPlacementTicket: Object.assign({}, @top_placement_ticket, {strike_price: @top_placement_strike_price})
      tariffMapping: @tariff_mapping
      geoIpCountry: @geoIpCountry
      geoip_city: @geoip_city
      market: @market
      popularFilters: @top_filters
    }))

  on_finish: =>
    if @bestSellerData.ticketSign
      store.dispatch(reachGoal('TICKET_BESTSELLER_POSITION', {
        ticket_position: @bestSellerData.ticketPosition
        search_id: @search_id.search_id
        min_price: @cheapest_ticket[1][0].unified_price
        price: @bestSellerData.ticketPrice
      }))
    @di_callbacks.finish(@id)

  on_error: (data) => @di_callbacks.error(@id, data)

  extractPromoTickets: (badgesBySign) =>
    promoTickets = extractPromoTickets(badgesBySign, @tickets_by_sign, store.getState().currencies)
    if promoTickets.length > 0
      Array::push.apply @tickets_list, promoTickets
      @_compose_products()
      store.dispatch(promoTicketCreated(@tickets, badgesBySign))

  handleTicketsBadgesFetcherCb: (badgesBySign) =>
    @badgesBySign = badgesBySign
    store.dispatch(updateTicketsBadges(badgesBySign))

module.exports = RequestProcessor
