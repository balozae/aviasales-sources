import React from 'react'
import {div} from 'react-dom-factories'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {diff, addDays, addYears, isEqualDates, format} from 'finity-js'
import Graph from 'graph/graph'
import DurationInputComponent from './duration_input'
import MonthsLabelsComponent from './months_labels'
import CalendarSliderComponent from './calendar_slider'
import {UNSAFE_reachGoal} from 'common/js/redux/actions/DEPRECATED_metrics.actions'
import {dateToLowerCase} from 'shared_components/l10n/l10n'

CalendarSlider = React.createFactory(CalendarSliderComponent)
MonthsLabels = React.createFactory(MonthsLabelsComponent)
DurationInput = React.createFactory(DurationInputComponent)

GRAPH_PARAMS =
  wide:
    width: 820
    days: 84
    colWidth: 8
  small:
    width: 729
    days: 35
    colWidth: 18

export default class CalendarGraph extends React.Component
  @displayName: 'CalendarGraph'

  @propTypes:
    t: PropTypes.func.isRequired
    prices: PropTypes.array.isRequired
    tripDuration: PropTypes.number
    departDate: PropTypes.instanceOf(Date).isRequired
    initialGraphStartDay: PropTypes.instanceOf(Date)
    onParamsChange: PropTypes.func.isRequired
    onExpand: PropTypes.func.isRequired
    isSmallScreen: PropTypes.bool.isRequired
    isLoading: PropTypes.bool.isRequired
    isExpanded: PropTypes.bool.isRequired
    onDatesSelect: PropTypes.func.isRequired

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    {width, days} = @_getGraphParams(@props.isSmallScreen)
    {
      daysInViewport: days
      sliderWidth: width
      graphStartDay: @props.initialGraphStartDay or @_getGraphStartDay()
    }

  componentDidUpdate: (_prevProps, prevState) ->
    @handleResize() if @props.isSmallScreen isnt _prevProps.isSmallScreen

  handleTripDurationChange: (tripDuration) =>
    @props.onParamsChange({tripDuration})

  handleSliderChange: (graphStartDay) =>
    @setState({graphStartDay})
    @props.onParamsChange(initialGraphStartDay: graphStartDay)

  handleColumnClick: (_index, columnData) =>
    {departDate} = columnData
    @props.onParamsChange({departDate})
    returnDate = addDays(departDate, @props.tripDuration) if @props.tripDuration?
    @props.onDatesSelect(departDate, returnDate)
    @_sendColumnMetrics(columnData)
    @props.onExpand() unless @props.isExpanded

  handleResize: =>
    {width, days} = @_getGraphParams(@props.isSmallScreen)
    nextState =
      daysInViewport: days
      sliderWidth: width
    # NOTE: graphStartDay was calculated and not set by user using slider
    unless @props.initialGraphStartDay
      nextState.graphStartDay = @_getGraphStartDay()
    @setState(nextState)

  render: ->
    rectWidth = @_rectWidth()
    offsetX = @_getGraphOffset()
    div(
      className: classNames(
        'prediction__graph'
        '--loader': @props.isLoading
      )
      div(
        className: 'prediction__expanded-header'
        if @props.tripDuration?
          DurationInput(
            t: @props.t
            value: @props.tripDuration
            onChange: @handleTripDurationChange
          )
        else
          null
      )
      Graph(
        className: '--prediction'
        data: @_presentColumns()
        rectWidth: rectWidth
        sizeType: 'px'
        marginRatio: 1 / rectWidth
        highlightedPaddingTop: 0
        offsetX: offsetX
        onClick: @handleColumnClick
        hasTooltips: true
        minHeight: 15
        MonthsLabels(
          t: @props.t
          data: @props.prices
          rectWidth: rectWidth
          offsetX: offsetX
          beginningOfPeriod: @_getBeginningOfPeriod()
        )
      )
      CalendarSlider(
        t: @props.t
        startFrom: @state.graphStartDay
        daysInViewport: @state.daysInViewport
        width: @state.sliderWidth
        data: @props.prices
        onChange: @handleSliderChange
        beginningOfPeriod: @_getBeginningOfPeriod()
      )
    )

  _getGraphParams: (isSmallScreen) ->
    GRAPH_PARAMS[if isSmallScreen then 'small' else 'wide']

  _getGraphStartDay: ->
    daysInViewport = @_getGraphParams(@props.isSmallScreen).days
    graphEndDay = addYears(new Date(), 1)
    departDate = new Date(@props.departDate)
    if addDays(departDate, @props.tripDuration) > graphEndDay
      addDays(graphEndDay, -daysInViewport)
    else if departDate < addDays(new Date(), daysInViewport / 2)
      new Date()
    else
      addDays(departDate, -(daysInViewport / 2))

  _getBeginningOfPeriod: ->
    new Date()

  _getGraphOffset: ->
    {days} = @_getGraphParams(@props.isSmallScreen)
    return 0 if isEqualDates(@state.graphStartDay, @_getBeginningOfPeriod())
    step = @_rectWidth() + 1
    diff(@_getBeginningOfPeriod(), @state.graphStartDay, true) * -step

  _rectWidth: ->
    {colWidth} = @_getGraphParams(@props.isSmallScreen)
    colWidth

  _isRoundTrip: ->
    @props.tripDuration?

  _presentColumns: ->
    for {departDate, value}, key in @props.prices
      returnDate = if @_isRoundTrip() then addDays(departDate, @props.tripDuration) else null
      className = @_getColClass(departDate)
      titleDates = "#{dateToLowerCase(format(departDate, 'DD MMMM, ddd', true))}"
      titleDates += " — #{dateToLowerCase(format(returnDate, 'DD MMMM, ddd', true))}" if @_isRoundTrip()
      isRoundTrip = @_isRoundTrip()
      {isRoundTrip, titleDates, key, value, className, departDate, returnDate}

  _getColClass: (colDepartDate) ->
    {departDate, tripDuration} = @props
    switch
      when isEqualDates(colDepartDate, departDate)
        '--active'
      when tripDuration and departDate < colDepartDate < addDays(departDate, tripDuration + 1)
        '--active-light'
      else
        ''

  _sendColumnMetrics: (columnData) ->
    if @props.isExpanded
      {value, departDate} = columnData
      metricsData = {departDate: format(departDate, 'YYYY-MM-DD')}
      metricsData.value = value if value?
      UNSAFE_reachGoal('PREDICTION_COLUMN_CLICK', metricsData)
    else
      UNSAFE_reachGoal('PREDICTION_EXPAND_ON_COLUMN')
