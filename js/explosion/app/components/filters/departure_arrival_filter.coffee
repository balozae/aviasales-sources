import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import update from 'immutability-helper'
import FilterGroupComponent from './filter_group'
import FilterMetrics from './slider_filter_metrics'
import SegmentFilterComponent from './departure_arrival_filter/segment_filter'
import omit from 'omit'

FilterGroup = React.createFactory(FilterGroupComponent)
SegmentFilter = React.createFactory(SegmentFilterComponent)

class DepartureArrivalFilter extends React.Component
  @displayName: 'DepartureArrivalFilter',
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.array.isRequired
    changes: PropTypes.array.isRequired
    airportsInfo: PropTypes.object.isRequired
    segments: PropTypes.array.isRequired
    priceReduceStep: PropTypes.number
    name: PropTypes.string.isRequired

  @defaultProps: priceReduceStep: 1800

  @initialBoundaries: -> []
  @initialValue: -> []

  convertStepFunc: (timestamp) =>
    Math.floor(timestamp / @props.priceReduceStep)

  reduceFunc: (result, [ticket, terms]) =>
    for [departure, arrival], index in ticket.segments_time
      flights = ticket.segment[index].flight
      # Initial result
      result[index] ?=
        origin: flights[0].departure
        destination: flights[flights.length - 1].arrival
        departureRange: {min: departure, max: departure}
        arrivalRange: {min: arrival, max: arrival}
        departurePrices: {}
        arrivalPrices: {}
      # Update min max boundaries for timestamps
      for key, time of {departureRange: departure, arrivalRange: arrival}
        result[index][key] = {
          min: Math.min(time, result[index][key].min),
          max: Math.max(time, result[index][key].max)
        }
      # Prices boundaries update
      departure_price_key = @convertStepFunc(departure)
      arrival_price_key = @convertStepFunc(arrival)
      price = terms[0].unified_price
      result[index].departurePrices[departure_price_key] = Math.min(
        result[index].departurePrices[departure_price_key] or price,
        price
      )
      result[index].arrivalPrices[arrival_price_key] = Math.min(
        result[index].arrivalPrices[arrival_price_key] or price,
        price
      )
    result

  filterFunc: =>
    checks = []
    for segment, segmentIndex in @props.changes when segment
      for key, index of {departureRange: 0, arrivalRange: 1} when segment[key]
        {min, max} = segment[key]
        checks.push({segmentIndex, index, min}) if min
        checks.push({segmentIndex, index, max}) if max
    if checks.length > 0
      ([ticket, _terms]) ->
        {segments_time} = ticket
        for {segmentIndex, index, min, max} in checks
          if min isnt undefined
            return false if segments_time[segmentIndex][index] < min
          else
            return false if max < segments_time[segmentIndex][index]
        true
    else
      null

  render: ->
    showFilter = false
    for {arrivalRange, departureRange} in @props.boundaries
      if arrivalRange.min isnt arrivalRange.max or departureRange.min isnt departureRange.max
        showFilter = true
        break
    FilterGroup(
      className: '--departure-arrival'
      label: @props.t('filters:titles.departureArrival')
      modified: @_isModified()
      metricsName: 'DEPARTURE_ARRIVAL'
      initialOpened: true
      onReset: @props.onReset
      name: @props.name
      if showFilter
        for segment, index in @props.boundaries
          if @props.segments[index]
            SegmentFilter(
              key: index
              boundaries: segment
              convertStepFunc: @convertStepFunc
              changes: @props.changes[index]
              airportsInfo: @props.airportsInfo
              segment: @props.segments[index]
              onChange: @handleChange.bind(this, index)
            )
    )

  handleChange: (index, key, [min, max]) ->
    changes = {}
    if min isnt @props.boundaries[index][key].min
      changes.min = min
    if max isnt @props.boundaries[index][key].max
      changes.max = max
    segmentChange = if Object.keys(changes).length > 0
      update(@props.changes[index] or {}, {"#{key}": {$set: changes}})
    else
      result = omit(@props.changes[index], key)
      if Object.keys(result).length > 0 then result else undefined
    newChanges = update(@props.changes, {"#{index}": {$set: segmentChange}})
    @metricsSend(@_metricsPrefix(index, key), [min, max])
    @props.onChange(newChanges)

  _metricsPrefix: (index, key) ->
    keys = departureRange: 'DEPARTURE', arrivalRange: 'ARRIVAL'
    [keys[key], 'TIME_SLIDER', index].join('_')

  _isModified: (props = @props) ->
    for change in props.changes when change
      return true
    false

export default FilterMetrics(DepartureArrivalFilter)
