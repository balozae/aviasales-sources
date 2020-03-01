import React from 'react'
import PropTypes from 'prop-types'
import {div, svg, span, polyline, style} from 'react-dom-factories'
import percentile from 'percentile'
import {daysInMonth, diff, isEqualDates, addDays, addMonths} from 'finity-js'
import {UNSAFE_reachGoal} from 'common/js/redux/actions/DEPRECATED_metrics.actions'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import SliderComponent from 'shared_components/slider/slider'

import './calendar_slider.scss'

Slider = React.createFactory(SliderComponent)

BORDER_SIZE = 2
DAYS_IN_GRAPH = 366

class CalendarSlider extends React.Component
  @displayName: 'CalendarSlider'

  @propTypes:
    t: PropTypes.func.isRequired
    data: PropTypes.array.isRequired
    beginningOfPeriod: PropTypes.instanceOf(Date).isRequired
    startFrom: PropTypes.instanceOf(Date)
    onChange: PropTypes.func
    height: PropTypes.number
    width: PropTypes.number
    daysInViewport: PropTypes.number.isRequired
    datesPerChunk: PropTypes.number
    cutTopPercentile: PropTypes.number

  @defaultProps:
    width: 820
    height: 18
    datesPerChunk: 10
    cutTopPercentile: 0.90
    beginningOfPeriod: new Date()
    startFrom: new Date()
    onChange: ->

  shouldComponentUpdate: (nextProps, _nextState) ->
    @_isPropChanged(['data', 'width', 'daysInViewport'], nextProps)

  render: ->
    handleWidth = Math.ceil((@props.daysInViewport / DAYS_IN_GRAPH) * @props.width)
    baseWidth = @props.width - handleWidth
    startDay = @props.beginningOfPeriod.getDate()
    months = @props.t('common:dateTime', {returnObjects: true}).months
    div(
      className: @blockClassName()
      svg(
        className: @elementClassName('graph')
        viewBox: "0 0 #{@props.width} #{@props.height}"
        width: @props.width
        height: @props.height
        polyline(
          points: @_getPoints()
        )
      )
      div(
        style:
          width: baseWidth - BORDER_SIZE
        className: @elementClassName('wrap')
        # style(null, "html:not([dir='rtl']) .calendar-slider .slider.noUi-horizontal .noUi-handle { width: #{handleWidth + BORDER_SIZE}px; right: -#{(handleWidth + BORDER_SIZE - 17) / 2}px}")
        Slider(
          range:
            min: 0
            max: DAYS_IN_GRAPH - @props.daysInViewport
          start: [@_getStart()]
          step: 1
          connect: false
          onUpdate: ([value]) =>
            @props.onChange(addDays(@props.beginningOfPeriod, value))
          onChange: -> UNSAFE_reachGoal('PREDICTION_SLIDER_MOVE')
        )
      )
      div(
        className: @elementClassName('months')
        style:
          left: "-#{startDay / DAYS_IN_GRAPH * 100}%"
        for i in [0..12]
          date = addMonths(@props.beginningOfPeriod, i)
          hideLabel = startDay * 1 > 2 and not i
          span(
            key: i
            className: @elementClassName('month-name')
            style: width: "#{daysInMonth(date) / DAYS_IN_GRAPH * 100}%"
            if hideLabel then '' else months[date.getMonth()]
          )
      )
    )

  _getStart: ->
    if not isEqualDates(@props.startFrom, @props.beginningOfPeriod)
      start = diff(@props.beginningOfPeriod, @props.startFrom, true)
    else
      0

  _getPoints: ->
    averagePrices = []
    i = 0
    while i < @props.data.length
      chunk = @props.data.slice(i, i + @props.datesPerChunk)
      chunkPrices = (value for {value} in chunk when value)
      average = if chunkPrices.length > 0
        sum = chunkPrices.reduce(((prev, cur) -> prev + cur), 0)
        Math.round(sum / chunkPrices.length)
      else
        0
      averagePrices.push(average)
      i += @props.datesPerChunk
    sortedPrices = (price for price in averagePrices when price > 0).sort((a, b) -> a - b)
    return '' if sortedPrices.length is 0
    min = sortedPrices[0]
    max = percentile(sortedPrices, @props.cutTopPercentile)
    median = percentile(sortedPrices, 0.5)
    points = for value, i in averagePrices
      # NOTE: use median value when no prices available
      value ||= median
      # NOTE: y = 0 for max price, y = @props.height for min price
      columnHeight = if min is max then 0.5 else (value - min) / (max - min)
      y = @props.height * (1 - columnHeight)
      # NOTE: add 1px for max price and substruct 1px from min price for better line drawing
      y = Math.min(@props.height - 1, Math.max(1, y))
      x = i / (averagePrices.length - 1) * @props.width
      "#{x},#{y}"
    points.join(' ')

  _isPropChanged: (propNamesArray, nextProps) ->
    propNamesArray.some((propName) =>
      @props[propName] isnt nextProps[propName]
    )

export default BlockElementClassnames(CalendarSlider)
