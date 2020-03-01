import React from 'react'
import PropTypes from 'prop-types'
import SliderRangeComponent, {SliderRangeFromToLabel as SliderRangeFromToLabelComponent} from 'shared_components/slider/slider_range.tsx'
import FilterGroupComponent from './filter_group'
import FilterMetrics from './slider_filter_metrics'
import PriceComponent from 'react_components/price/price'

Price = React.createFactory(PriceComponent)
FilterGroup = React.createFactory(FilterGroupComponent)
SliderRange = React.createFactory(SliderRangeComponent)
SliderRangeFromToLabel = React.createFactory(SliderRangeFromToLabelComponent)

class PriceFilter extends React.Component
  @displayName: 'PriceFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    range: PropTypes.object.isRequired
    name: PropTypes.string.isRequired

  reduceFunc: (state, [_ticket, terms]) ->
    state.min = Math.min(state.min or Infinity, terms[0].unified_price)
    state.max = Math.max(state.max or 0, terms[terms.length - 1].unified_price)
    state

  filterFunc: =>
    if @_isModified()
      {min, max} = @props.range
      min ?= 0
      max ?= Infinity
      ([ticket, terms]) ->
        new_terms = (term for term in terms when min <= term.unified_price <= max)
        if new_terms.length > 0
          [ticket, new_terms]
        else
          false
    else
      null

  renderSliderLabel: (value, type) ->
    SliderRangeFromToLabel
      key: type
      type: type
      Price(valueInRubles: value)

  render: ->
    FilterGroup
      className: '--price'
      label: @props.t('filters:titles.price')
      modified: @_isModified()
      metricsName: 'PRICE'
      onReset: @props.onReset
      name: @props.name
      if @props.boundaries.min and @props.boundaries.max and
          @props.boundaries.min isnt @props.boundaries.max
        SliderRange(
          range: @props.boundaries
          minValue: @props.range.min || @props.boundaries.min
          maxValue: @props.range.max || @props.boundaries.max
          renderLabel: @renderSliderLabel
          className: 'filter__slider --price'
          onChange: @handleChange
          step: 200
        )

  handleChange: (values, handle) =>
    nextProps = {}
    [min, max] = @_filterValues(values, handle)
    nextProps.min = min if min
    nextProps.max = max if max
    @metricsSend('PRICE', values)
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

export default FilterMetrics(PriceFilter)
