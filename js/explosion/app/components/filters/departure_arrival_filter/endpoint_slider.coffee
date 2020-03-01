import React from 'react'
import PropTypes from 'prop-types'
import {div, p} from 'react-dom-factories'
import Graph from 'graph/graph'
import classNames from 'classnames'
import date_formatter from 'date_formatter'
import SliderRangeComponent, {SliderRangeFromToLabel as SliderRangeFromToLabelComponent} from 'shared_components/slider/slider_range.tsx'

SliderRange = React.createFactory(SliderRangeComponent)
SliderRangeFromToLabel = React.createFactory(SliderRangeFromToLabelComponent)

export default class EndpointSlider extends React.Component
  @displayName: 'EndpointSlider'
  @propTypes:
    boundaries: PropTypes.object.isRequired
    changes: PropTypes.object
    title: PropTypes.string.isRequired
    onChange: PropTypes.func.isRequired
    prices: PropTypes.object
    convertStepFunc: PropTypes.func

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    isHovered: false
    highlighted: [0, @props.boundaries.max - @props.boundaries.min]

  _presentColsData: ->
    min = @props.convertStepFunc(@props.boundaries.min)
    max = @props.convertStepFunc(@props.boundaries.max)
    (key: step, value: @props.prices[step]) for step in [min..max]

  componentWillUnmount: ->
    clearTimeout(@timeout)
    @timeout = null

  _getHighlightedRange: ([min, max]) =>
    min = @props.convertStepFunc(min)
    max = @props.convertStepFunc(max)
    boundaries_min = @props.convertStepFunc(@props.boundaries.min)
    boundaries_max = @props.convertStepFunc(@props.boundaries.max)
    index = 0
    highlighted = []
    for step in [boundaries_min..boundaries_max]
      break if highlighted.length >= 2
      highlighted.push(index) if step is min or step is max
      highlighted = [index, index] if step is min is max
      index++
    if highlighted.length is 1
      highlighted.push(index) if not max
      highlighted.unshift(0) if not min
    highlighted = [0, index - 1] if highlighted.length is 0
    highlighted

  _handleUpdate: (range) =>
    @setState(highlighted: @_getHighlightedRange(range))

  renderSliderLabel: (value, type) ->
    SliderRangeFromToLabel
      key: type
      type: type
      date_formatter.filter_arrival_short(value)

  render: ->
    return null if @props.boundaries.min is @props.boundaries.max

    cols = @_presentColsData()
    div(
      className: classNames(
        'filter__segment'
        'is-hovered': @state.isHovered and cols and cols.length
      )
      onMouseEnter: @handleMouseEnter
      onMouseLeave: @handleMouseLeave
      p(
        className: 'filter__sub-sub-title'
        @props.title
      )
      SliderRange(
        range: @props.boundaries
        minValue: @props.changes.min || @props.boundaries.min
        maxValue: @props.changes.max || @props.boundaries.max
        renderLabel: @renderSliderLabel
        className: 'filter__slider'
        onChange: @props.onChange
        onUpdate: @_handleUpdate
        step: 300
      )
      if cols and cols.length
        Graph(
          data: cols
          highlighted: @state.highlighted
          className: '--slider'
          cutTopPercentile: 0.75
        )
    )

  handleMouseEnter: =>
    @setState(isHovered: true)

  handleMouseLeave: =>
    @setState(isHovered: false)
