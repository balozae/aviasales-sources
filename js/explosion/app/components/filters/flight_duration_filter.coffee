import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import SliderRangeComponent, {SliderRangeFromToLabel as SliderRangeFromToLabelComponent} from 'shared_components/slider/slider_range.tsx'
import FilterGroupComponent from './filter_group'
import FilterMetrics from './slider_filter_metrics'
import SegmentHeader from './departure_arrival_filter/segment_header'
import update from 'immutability-helper'
import omit from 'omit'
import date_formatter from 'date_formatter'

FilterGroup = React.createFactory(FilterGroupComponent)
SliderRange = React.createFactory(SliderRangeComponent)
SliderRangeFromToLabel = React.createFactory(SliderRangeFromToLabelComponent)

class FlightDurationFilter extends React.Component
  @displayName: 'FlightDurationFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    range: PropTypes.object.isRequired
    name: PropTypes.string.isRequired

  reduceFunc: (state, [ticket, _terms]) ->
    for duration, key in ticket.segment_durations
      state[key] or= {min: Infinity, max: 0}
      state[key].min = Math.min(state[key].min, duration)
      state[key].max = Math.max(state[key].max, duration)
    state

  isBoundariesAreSame: (boundaries) ->
    Object.values(boundaries).every((boundary) -> boundary.min is boundary.max)

  filterFunc: =>
    if @_isModified()
      range = Object.assign({}, @props.range)
      ([ticket]) ->
        for key, {min = 0, max = Infinity} of range
          duration = ticket.segment_durations[key]
          return false unless min <= duration <= max
        true
    else
      null

  renderSliderLabel: (value, type) ->
    SliderRangeFromToLabel
      key: type
      type: type
      date_formatter.flight_time_format_duration_with_units(value)

  render: ->
    FilterGroup
      className: '--flight-duration'
      label: @props.t('filters:titles.duration')
      modified: @_isModified()
      metricsName: 'FLIGHT_DURATION'
      onReset: @props.onReset
      name: @props.name
      if Object.keys(@props.boundaries).length isnt 0 and not @isBoundariesAreSame(@props.boundaries)
        for key, segment of @props.boundaries when segment and segment.min isnt segment.max
          div
            key: key
            SegmentHeader(segment: @props.segments[key])
            SliderRange(
              range: @props.boundaries[key]
              minValue: (@props.range[key] && @props.range[key].min) || @props.boundaries[key].min
              maxValue: (@props.range[key] && @props.range[key].max) || @props.boundaries[key].max
              renderLabel: @renderSliderLabel
              className: 'filter__controls filter__slider'
              onChange: @handleChange.bind(this, key)
              step: 30
            )

  handleChange: (key, values) ->
    [min, max] = @_filterValues(key, values)
    nextProps = if min or max
      segment = {}
      segment.min = min if min
      segment.max = max if max
      update(@props.range, {"#{key}": {$set: segment}})
    else
      omit(@props.range, key)
    @metricsSend("FLIGHT_DURATION_#{key}", [min, max])
    @props.onChange(nextProps)

  _filterValues: (key, [min, max]) ->
    minUnchanged = min is @props.boundaries[key].min
    maxUnchanged = max is @props.boundaries[key].max
    [
      if minUnchanged then null else min
      if maxUnchanged then null else max
    ]

  _isModified: ->
    return false if not @props.range or not Object.keys(@props.range).length
    result = false
    for key, {min, max} of @props.range
      result = true if min or max
      break if result
    result

export default FilterMetrics(FlightDurationFilter)
