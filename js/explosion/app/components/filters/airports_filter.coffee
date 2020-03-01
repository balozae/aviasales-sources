import React from 'react'
import PropTypes from 'prop-types'
import {div, h2, span} from 'react-dom-factories'
import CheckboxRowComponent from './checkbox_row'
import CheckboxesListComponent from './checkboxes_list'
import FilterGroupComponent from './filter_group'
import update from 'immutability-helper'
import omit from 'omit'
import PriceComponent from 'react_components/price/price'
import FilterMetrics from './checkbox_filter_metrics'
import {format} from 'finity-js'
import {dateWithoutTimezone} from 'utils_date'
import isEqual from 'is_equal'
import { dateToLowerCase } from 'shared_components/l10n/l10n';
import './styles/airports_filter.scss'

Price = React.createFactory(PriceComponent)
CheckboxRow = React.createFactory(CheckboxRowComponent)
CheckboxesList = React.createFactory(CheckboxesListComponent)
FilterGroup = React.createFactory(FilterGroupComponent)

class AirportsFilter extends React.Component
  @displayName: 'AirportsFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    unchecked: PropTypes.object.isRequired
    airportsInfo: PropTypes.object.isRequired
    segments: PropTypes.array.isRequired
    isTicketsAlreadyRendered: PropTypes.bool
    name: PropTypes.string.isRequired
    isAppliedSavedFilters: PropTypes.bool.isRequired

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    modifiedByUser: false

  componentWillReceiveProps: (newProps) ->
    isReset = Object.keys(@props.unchecked).length > 0 and
      Object.keys(newProps.unchecked).length is 0
    @setState(modifiedByUser: true) if isReset

  componentDidUpdate: (prevProps) ->
    return if @state.modifiedByUser or not @props.isTicketsAlreadyRendered
    return if not @props.boundaries
    unchecked = @_precheckedAirports()
    if not isEqual(@props.unchecked, unchecked) and not @props.isAppliedSavedFilters
      @props.onChange(unchecked, @state.modifiedByUser)

  reduceFunc: (state, [ticket, terms]) ->
    {segments_airports} = ticket
    [{unified_price}] = terms
    for [departure, arrival], key in segments_airports
      d_key = "departure-#{key}"
      a_key = "arrival-#{key}"
      state[d_key] ?= {}
      state[a_key] ?= {}
      state[d_key][departure] = Math.min(state[d_key][departure] or Infinity, unified_price)
      state[a_key][arrival] = Math.min(state[a_key][arrival] or Infinity, unified_price)
    state

  filterFunc: =>
    if Object.keys(@props.unchecked).length > 0
      filtered = Object.assign({}, @props.unchecked)
      ([{segments_airports}]) ->
        for [departure, arrival], key in segments_airports
          origin = filtered["departure-#{key}"] and departure of filtered["departure-#{key}"]
          destination = filtered["arrival-#{key}"] and arrival of filtered["arrival-#{key}"]
          return false if origin or destination
        return true
    else
      null

  renderAirportsFilters: ->
    for segmentKey, airports of @props.boundaries
      [direction, key] = segmentKey.split('-')
      segment = @props.segments[key]
      if segment
        city = if direction is 'departure'
          segment.origin_cases?.ro or
            segment.origin or
            segment.origin_city_iata
        else
          segment.destination_cases?.vi or
            segment.destination or
            segment.destination_city_iata
        {date} = segment
        div(
          className: 'airport-filter'
          key: segmentKey
          div(
            className: 'filter__sub-title',
            @props.t(
              if (direction == 'departure') then 'filters:departureFromWithDate' else 'filters:arrivalToWithDate',
              {
                date: dateToLowerCase(format(dateWithoutTimezone(date), 'DD MMM')),
                cityName: city
              }
            )
          )
          CheckboxesList(
            unchecked: @props.unchecked[segmentKey] or {}
            onChange: @handleChange.bind(this, segmentKey)
            prefix: segmentKey
            items: for iata, price of airports
              name = @props.airportsInfo[iata]?.name or iata
              key: iata
              label: name
              extra: Price(valueInRubles: price)
          )
        )

  renderAirportsOnly: ->
    div(
      className: ''
      div(
        className: 'airports-filter__badge-list'
        span(className: 'airports-filter__badge badges__item --train', null)
        span(className: 'airports-filter__badge badges__item --bus', null)
      )
      div(
        className: 'airports-filter__info'
        @props.t('filters:ticketsWithBus')
      )
      CheckboxRow(
        id: 'airports-only'
        onChange: @handleAirportsOnlyChange
        label: @props.t('filters:onlyPlane')
        showUncheckOther: false
        checked: @_airportsOnlySelected()
      )
    )

  render: ->
    airports = @renderAirportsFilters()
    airportsOnly = @_hasAirportsOnly()
    FilterGroup(
      label: @props.t("filters:titles.#{if airportsOnly then 'airports' else 'airportsAndStations'}")
      className: 'airports-filter'
      modified: Object.keys(@props.unchecked).length isnt 0
      metricsName: 'AIRPORTS'
      onReset: @props.onReset
      name: @props.name
      if airports.length
        @renderAirportsOnly() unless airportsOnly
        airports
    )

  handleChange: (segmentKey, unchecked, changes) ->
    @setState(modifiedByUser: true) unless @state.modifiedByUser
    unchecked = if Object.keys(unchecked).length is 0
      omit(@props.unchecked, segmentKey)
    else
      set = {"#{segmentKey}": {$set: unchecked}}
      update(@props.unchecked, set)
    @metricsSend(@_metricsPrefix(segmentKey), changes)
    @props.onChange(unchecked)

  handleAirportsOnlyChange: (event) =>
    checked = event.target.checked
    @metricsSend(@_metricsPrefix('AIRPORTS_ONLY'), airportsOnly: checked)
    @setState(modifiedByUser: true) unless @state.modifiedByUser
    unchecked = @props.unchecked
    for segmentKey, airports of @props.boundaries
      for iata of airports when @props.airportsInfo[iata]?.railway_station?
        if checked
          uncheckedAirports = update(unchecked[segmentKey] or {}, {"#{iata}": {$set: true}})
          unchecked = update(unchecked, {"#{segmentKey}": {$set: uncheckedAirports}})
        else
          uncheckedAirports = omit(unchecked[segmentKey] or {}, iata)
          unchecked = if Object.keys(uncheckedAirports).length is 0
            omit(unchecked, segmentKey)
          else
            update(unchecked, {"#{segmentKey}": {$set: uncheckedAirports}})
    @props.onChange(unchecked)

  _hasAirportsOnly: ->
    for segmentKey, airports of @props.boundaries
      for iata, _price of airports when @props.airportsInfo[iata]?.railway_station?
        return false
    true

  _airportsOnlySelected: ->
    for segmentKey, airports of @props.boundaries
      for iata, _price of airports when @props.airportsInfo[iata]?.railway_station?
        return false unless @props.unchecked[segmentKey]?[iata]
    true

  _metricsPrefix: (segmentKey) ->
    [direction, key] = segmentKey.split('-')
    "#{direction.toUpperCase()}_AIRPORTS_#{key}"

  _precheckedAirports: ->
    precheck = {}
    for segment, key in @props.segments
      for [direction, iataKey] in [['departure', 'origin'], ['arrival', 'destination']]
        originalIata = segment["original_#{iataKey}"]
        searchIata = segment[iataKey]
        searchCityIata = segment["#{iataKey}_city_iata"]
        # NOTE: case for search started at page load
        isOriginalIataChanged = originalIata and originalIata isnt searchIata
        # NOTE: case for search started by form submit
        isSearchForAirport = searchCityIata and searchIata isnt searchCityIata
        if isOriginalIataChanged or isSearchForAirport
          precheck["#{direction}-#{key}"] = originalIata or searchIata
    res = {}
    if Object.keys(precheck).length > 0
      for direction, precheckIata of precheck when @props.boundaries[direction]
        #NOTE: do not prechek if there are no tickets to/from chosen airport
        return {} if precheckIata not in Object.keys(@props.boundaries[direction])
        res[direction] = {}
        for iata, price of @props.boundaries[direction] when iata isnt precheckIata
          res[direction][iata] = true
    res

export default FilterMetrics(AirportsFilter)
