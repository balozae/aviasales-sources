import React from 'react'
import PropTypes from 'prop-types'
import FilterGroupComponent from './filter_group'
import FilterMetrics from './slider_filter_metrics'
import SliderRangeComponent, {SliderRangeFromToLabel as SliderRangeFromToLabelComponent} from 'shared_components/slider/slider_range.tsx'
import date_formatter from 'date_formatter'

FilterGroup = React.createFactory(FilterGroupComponent)
SliderRange = React.createFactory(SliderRangeComponent)
SliderRangeFromToLabel = React.createFactory(SliderRangeFromToLabelComponent)

class StopsDurationFilter extends React.Component
  @displayName: 'StopsDurationFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    range: PropTypes.object.isRequired
    name: PropTypes.string.isRequired

  reduceFunc: (state, [ticket, _terms]) ->
    return state if ticket.max_stops is 0
    state.max = Math.max(state.max or 0, ticket.max_stop_duration)
    state.min = Math.min(state.min or Infinity, ticket.min_stop_duration)
    state

  filterFunc: =>
    if @_isModified()
      {min, max} = @props.range
      min ?= 0
      max ?= Infinity
      ([ticket, _terms]) ->
        {min_stop_duration, max_stop_duration} = ticket
        (not min_stop_duration or min <= min_stop_duration) and
          (max_stop_duration is 0 or max_stop_duration <= max)
    else
      null

  renderSliderLabel: (value, type) ->
    SliderRangeFromToLabel
      key: type
      type: type
      date_formatter.flight_time_format_duration_with_units(value)

  render: ->
    FilterGroup
      className: '--stops-duration'
      label: @props.t('filters:titles.stopsDuration')
      modified: @_isModified()
      metricsName: 'STOPS_DURATION'
      onReset: @props.onReset
      name: @props.name
      if @props.boundaries.min and @props.boundaries.max and
          @props.boundaries.min isnt @props.boundaries.max
        SliderRange(
          range: @props.boundaries
          minValue: @props.range.min || @props.boundaries.min
          maxValue: @props.range.max || @props.boundaries.max
          renderLabel: @renderSliderLabel
          className: 'filter__slider filter__controls'
          onChange: @handleChange
          step: 30
        )

  handleChange: (values, handle) =>
    nextProps = {}
    [min, max] = @_filterValues(values, handle)
    nextProps.min = min if min
    nextProps.max = max if max
    @metricsSend('STOPS_DURATION', values)
    @props.onChange(nextProps)

  _filterValues: ([min, max], handle) ->
    minUnchanged = min is @props.boundaries.min or
      # NOTE: Do not assign value to min handler if user have moved only max handler
      ('min' not of @props.range and handle is 1)
    maxUnchanged = max is @props.boundaries.max or ('max' not of @props.range and handle is 0)
    [
      if minUnchanged then null else min
      if maxUnchanged then null else max
    ]

  _isModified: -> !!(@props.range.min or @props.range.max)

export default FilterMetrics(StopsDurationFilter)
