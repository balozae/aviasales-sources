React = require('react')
PropTypes = require('prop-types')
{div, br} = require('react-dom-factories')
Highlighted = require('./highlighted')
AxisY = require('./axis-y')
AxisX = require('./axis-x')
classNames = require('classnames')
percentile = require('percentile')
createReactClass = require('create-react-class')
PriceComponent = require('react_components/price/price')
ProviderComponent = require('react-redux').Provider
import TooltipComponent from 'components/tooltip'
import {Trans} from 'react-i18next'
store = require('common/js/redux/store').default
require('./graph.scss')

Tooltip = React.createFactory(TooltipComponent)
Price = React.createFactory(PriceComponent)
Provider = React.createFactory(ProviderComponent)

NOOP = ->

export default React.createFactory(createReactClass(
  displayName: 'Graph'
  propTypes:
    data: PropTypes.array
    onClick: PropTypes.func
    highlighted: PropTypes.arrayOf(PropTypes.number)
    marginRatio: PropTypes.number
    rectWidth: PropTypes.number
    sizeType: PropTypes.oneOf(['px', '%'])
    highlightedPaddingTop: PropTypes.number
    offsetX: PropTypes.number
    cutTopPercentile: PropTypes.number
    hasTooltips: PropTypes.bool
    minHeight: PropTypes.number
    className: PropTypes.string

  getDefaultProps: ->
    onClick: NOOP
    marginRatio: 1 / 3
    highlightedPaddingTop: 10
    className: ''
    sizeType: '%'
    offsetX: 0
    cutTopPercentile: 0.95
    hasTooltips: false
    minHeight: 0

  getInitialState: ->
    hoveredColumn: null

  render: ->
    return null unless @props.data
    [max, min] = @_getYValues()
    {step, marginRight, width} = @_getColSize()
    div(
      className: "graph #{@props.className}"
      div(
        className: 'graph__wrap'
        AxisY(
          values: [max, min]
          minNeighborRelation: 0.1
          maxValue: max
          highlightedPaddingTop: @props.highlightedPaddingTop
        )
        AxisX(
          values: @props.data
          maxValue: max
          onClick: @props.onClick
          onHover: @handleHover
          step: step
          width: width
          marginRight: marginRight
          graphClassName: @props.className
          highlightedPaddingTop: @props.highlightedPaddingTop
          sizeType: @props.sizeType
          offsetX: @props.offsetX
          minHeight: @props.minHeight
          Highlighted(
            dataSize: @props.data.length
            highlighted: @props.highlighted
            marginRight: marginRight
            step: step
          )
        )
        @props.children
      )
      if @props.hasTooltips
        data = @props.data[@state.hoveredColumn]
        Tooltip(
          tooltip: React.createFactory(->
            div
              className: 'graph__tooltip'
              if data.value then [
                Trans
                  i18nKey: if data.isRoundTrip then 'graphMinPriceLabelWithBr' else 'graphMinPriceLabel'
                  values: {dates: data.titleDates}
                  components: [
                    Price(key: 'graphMinPriceLabel', valueInRubles: data.value)
                  ]
              ] else data.titleDates
          )
          nodeToShow: @hoveredCalendarItem
          showByProps: true
          isVisible: !!@hoveredCalendarItem
          noAnimation: true
        )
      else
        []
    )

  handleHover: (index, target) ->
    @hoveredCalendarItem = target
    @setState(hoveredColumn: index)

  _getYValues: ->
    nonZeroValues = (value for {value} in @props.data when value)
    if nonZeroValues.length
      sortedValues = nonZeroValues.sort((a, b) -> a - b)
      [percentile(sortedValues, @props.cutTopPercentile), sortedValues[0]]
    else
      [0, 0]

  _getColSize: ->
    if @props.rectWidth
      width = @props.rectWidth
      marginRight = width * @props.marginRatio
      step = width + marginRight
    else
      step = (1 / @props.data.length * 100)
      marginRight = step * @props.marginRatio
      width = step - marginRight
    {step, marginRight, width}
))
