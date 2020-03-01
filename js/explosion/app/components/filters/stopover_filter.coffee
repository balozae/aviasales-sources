import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {div, span} from 'react-dom-factories'
import CheckboxRowComponent from './checkbox_row'
import CheckboxesListComponent from './checkboxes_list'
import FilterGroupComponent from './filter_group'
import FilterMetrics from './checkbox_filter_metrics'
import './styles/stopover_filter.scss'

CheckboxRow = React.createFactory(CheckboxRowComponent)
CheckboxesList = React.createFactory(CheckboxesListComponent)
FilterGroup = React.createFactory(FilterGroupComponent)
FragmentBlock = React.createFactory(Fragment)

_ticketStopovers = (ticket) ->
  for {flight}, index in ticket.segment
    lastIndex = flight.length - 1
    for {arrival}, flightIndex in flight when flightIndex isnt lastIndex
      nextIndex = flightIndex + 1
      if flight[nextIndex].departure isnt arrival
        "#{arrival}#{flight[nextIndex].departure}"
      else
        arrival

_compare = (a, b) ->
  return 1 if a > b
  return -1 if a < b
  return 0

_sortBy = (list, key) -> list.sort (a, b) -> _compare(a[key], b[key])

class StopoverFilter extends React.Component
  @displayName: 'StopoverFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    unchecked: PropTypes.object.isRequired
    airportsInfo: PropTypes.object.isRequired
    segments: PropTypes.array.isRequired
    name: PropTypes.string.isRequired

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    sameAirport: false

  # Boundaries structure: {
  #   [segment_index]: {
  #     [flightIndex]: {
  #       [countryCode]: {
  #         airport_iata: []airport_changes (length = 1 for no change)
  #       }
  #       ...
  #     }
  #     ...
  #   }
  #   ...
  # }
  reduceFunc: (result, [ticket, terms]) ->
    for segment, index in ticket.segment
      result[index] or= {}
      lastIndex = segment.flight.length - 1
      for {arrival}, flightIndex in segment.flight when flightIndex isnt lastIndex
        result[index][flightIndex] or= {}
        nextIndex = flightIndex + 1
        airports = if segment.flight[nextIndex].departure isnt arrival
          [arrival, segment.flight[nextIndex].departure]
        else
          [arrival]
        countryCode = @props.airportsInfo?[arrival].country_code
        result[index][flightIndex][countryCode] or= {}
        result[index][flightIndex][countryCode][airports.join('')] = airports
    result

  filterFunc: ->
    uncheckedStopovers = @props.unchecked
    return null if Object.keys(uncheckedStopovers).length is 0
    boundaries = @props.boundaries
    ([ticket, _terms]) ->
      ticketStopovers = _ticketStopovers(ticket)
      for segmentIndex, flights of uncheckedStopovers
        for flightIndex, countries of flights
          for countryCode, uncheckedStopover of countries
            if Object.keys(uncheckedStopover).length is 0
              continue
            if ticketStopovers[segmentIndex]?[flightIndex]?
              ticketStopover = ticketStopovers[segmentIndex][flightIndex]
              if uncheckedStopover[ticketStopover] is true
                return false
      true

  renderSegment: ({origin, origin_name, destination, destination_name}, segmentIndex) ->
    if @props.boundaries[segmentIndex] and Object.keys(@props.boundaries[segmentIndex]).length > 0
      [
        div(
          key: "segment-#{segmentIndex}"
          className: 'filter__sub-title'
          span(className: 'filter__route-origin', "#{origin_name or origin}")
          span(
            className: 'filter__route-plane-wrap'
            span(className: 'filter__route-destination', "#{destination_name or destination}")
          )
        )
        for flightIndex, countries of @props.boundaries[segmentIndex]
          @renderFlight(segmentIndex, flightIndex, countries)
      ]
    else
      []

  renderFlight: (segmentIndex, flightIndex, countries) ->
    countriesList = @sortCountries(countries)
    [
      div(
        key: "title-#{segmentIndex}-#{flightIndex}"
        className: 'filter__sub-title'
        @props.t(["stops:stopNumber.#{flightIndex}", 'stops:numStop'], {
          stopsCount: +flightIndex + 1
        })
      )
      div
        key: "segment-#{segmentIndex}_filters"
        className: 'filter__sub-filters'
        for country in countriesList
          @renderCountryGroup(segmentIndex, flightIndex, country)
    ]

  renderCountryGroup: (segmentIndex, flightIndex, country) ->
    allUnchecked = @_getUnchecked()
    [
      div(
        key: "title-#{segmentIndex}-#{flightIndex}-#{country.key}"
        className: 'filter__sub-title'
        country.name
      )
      CheckboxesList(
        key: "airports-#{segmentIndex}-#{flightIndex}-#{country.key}"
        onChange: @handleStopoverChange.bind(this, segmentIndex, flightIndex, country.key)
        showAll: true
        prefix: "stopover-#{segmentIndex}-#{flightIndex}-#{country.key}"
        unchecked: allUnchecked?[segmentIndex]?[flightIndex]?[country.key]
        items: @_extractLabelsFromAirports(country.airports)
      )
    ]

  sortCountries: (countryCodes) ->
    countries = for key, airports of countryCodes
      airportsKeys = for airportKey, airportCodes of countryCodes[key]
        airportKey
      firstAirport = airports[airportsKeys[0]][0]
      countryName = @props.airportsInfo[firstAirport]?.country
      {
        key: key
        name: countryName
        airports: airports
      }
    _sortBy(countries, 'name')

  render: ->
    FilterGroup(
      className: '--stopover'
      label: @props.t('filters:titles.stopover')
      uncheckedCount: @_uncheckedCount()
      filterCount: 0
      metricsName: 'STOPOVER'
      onReset: @props.onReset
      name: @props.name
      unless @_isEmpty()
        FragmentBlock(
          null
          if @_hasAirportChange()
            CheckboxRow(
              id: 'airports-no-change'
              onChange: @handleAirportChange
              label: @props.t('filters:withoutChangeAirport')
              showUncheckOther: false
              checked: @state.sameAirport
            )
          for segment, segmentIndex in @props.segments
            @renderSegment(segment, segmentIndex)
        )
    )

  _isEmpty: ->
    for _index, segment of @props.boundaries when Object.keys(segment).length > 0
      return false
    true

  _isFiltersApplied: (unchecked) ->
    @_uncheckedCount(unchecked) > 0

  # Get amount of unchecked airports in object or props.unchecked
  # @param {Object} optional
  #
  # @return {Number}
  _uncheckedCount: (unchecked = @props.unchecked) ->
    count = 0
    for _index, segment of unchecked
      for _flightIndex, countries of segment
        for country, airports of countries
          count += Object.keys(airports).length
    count

  _extractLabelsFromAirports: (airports) ->
    labels = for key, changes of airports
      label = (@props.airportsInfo[changes[0]]?.city or changes[0])
      title = @props.airportsInfo[changes[0]]?.name or changes[0]
      extra = span(className: '', if changes.length > 1
        title += "→ #{@props.airportsInfo[changes[1]]?.name or changes[1]}"
        "#{changes[0]} → #{changes[1]}"
      else
        "#{changes[0]}"
      )
      {key, label, title, extra}
    _sortBy(labels, 'label')

  _hasAirportChange: ->
    for index, segment of @props.boundaries
      for flightIndex, countries of segment
        for countryCode, airports of countries
          for airport, changes of airports
            return true if changes.length > 1
    false

  # Construct object with unchecked from boundaries
  #
  # @result {Object}
  _getUnchecked: ->
    result = {}
    for segmentIndex, _segment of @props.boundaries
      result[segmentIndex] = {}
      for flightIndex, countries of @props.boundaries[segmentIndex]
        result[segmentIndex][flightIndex] = {}
        for countryCode of countries
          result[segmentIndex][flightIndex][countryCode] = @props.unchecked[segmentIndex]?[flightIndex]?[countryCode] or {}
    result

  _handleChange: (unchecked) ->
    # NOTE: if we dont have unchecked stopovers, reset filters to initial,
    #       not to emptyUncheckedObject
    @props.onChange(if @_isFiltersApplied(unchecked) then unchecked else {})

  handleStopoverChange: (segmentIndex, flightIndex, countryCode, unchecked, changes) ->
    @metricsSend('STOPOVER', changes)
    allUnchecked = @_getUnchecked()
    allUnchecked[segmentIndex][flightIndex][countryCode] = unchecked
    @_handleChange(allUnchecked)

  handleAirportChange: (event) =>
    checked = event.target.checked
    @metricsSend('STOPOVER', same_airport: checked)
    @setState(sameAirport: checked)
    allUnchecked = @_getUnchecked()

    # Reset unchecked stopovers and uncheck airport changes
    for index, segment of @props.boundaries
      for flightIndex, countries of segment
        for countryCode, airports of countries
          # Do loop only when we activate this filter and reset otherway
          for airport, changes of airports when changes.length > 1
            if checked
              allUnchecked[index][flightIndex][countryCode][airport] = true if changes.length > 1
            else
              delete allUnchecked[index][flightIndex][countryCode][airport] if changes.length > 1

    @_handleChange(allUnchecked)


export default FilterMetrics(StopoverFilter)
