import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import classNames from 'classnames'
import {addDays, diff, isEqualDates} from 'finity-js'
import {UNSAFE_reachGoal} from 'common/js/redux/actions/DEPRECATED_metrics.actions'
import PriceComponent from 'react_components/price/price'
import DatesComponent from './dates'
import './minimized_calendar_matrix.scss'
import {connect} from 'react-redux'
import {prepareMatrixPrices} from './price_utils'
import {getKey, isCheap, getCheapestValue} from '../price_utils'

Price = React.createFactory(PriceComponent)
Dates = React.createFactory(DatesComponent)

BLOCK_NAME = 'minimized-calendar-matrix'

class MinimizedCalendarMatrix extends React.PureComponent
  @displayName: 'MinimizedCalendarMatrix'

  @propTypes:
    t: PropTypes.func.isRequired
    prices: PropTypes.object
    initialDates: PropTypes.shape(
      departDate: PropTypes.instanceOf(Date).isRequired
      returnDate: PropTypes.instanceOf(Date)
    ).isRequired
    departDateStart: PropTypes.instanceOf(Date).isRequired
    returnDateStart: PropTypes.instanceOf(Date)
    selectedFlight: PropTypes.shape(
      departDate: PropTypes.instanceOf(Date).isRequired
      returnDate: PropTypes.instanceOf(Date)
    ).isRequired
    onExpand: PropTypes.func
    onParamsChange: PropTypes.func
    onDatesSelect: PropTypes.func.isRequired

  handleDateClick: (price, departDate, returnDate) ->
    @props.onExpand() if @props.onExpand
    UNSAFE_reachGoal('PREDICTION_PRICE_MATRIX_EXPAND_CLICK', {price, departDate, returnDate})
    @props.onDatesSelect(departDate, returnDate)
    @props.onParamsChange(selectedFlight: {departDate, returnDate})

  render: ->
    cheapestValue = getCheapestValue(@props.prices)
    div
      className: classNames(
        BLOCK_NAME
        '--oneway': @isOneWay()
      )
      div
        className: "#{BLOCK_NAME}__wrap"
        for date in @_getCheapestDatesData()
          @renderDate(date, cheapestValue)

  renderDate: (dateData, cheapestValue) ->
    {depart_date: departDate, return_date: returnDate, value, unavailable} = dateData
    today = new Date().setHours(0, 0, 0, 0)
    key = getKey(departDate, returnDate)
    isCurrentDate = isEqualDates(departDate, @props.selectedFlight.departDate) and
      (not returnDate or isEqualDates(returnDate, @props.selectedFlight.returnDate))
    div
      key: key
      className: classNames(
        "#{BLOCK_NAME}__item"
        '--cheap': isCheap(value, cheapestValue)
        '--unavailable': unavailable
        '--empty': not value and not unavailable
        '--expired': diff(today, departDate) > 0
        'is-current': isCurrentDate
      )
      onClick: @handleDateClick.bind(this, value, departDate, returnDate)
      if departDate
        [
          Price(valueInRubles: value, key: "price-#{key}") if value
          Dates({departDate, returnDate, t: @props.t, key: "dates-#{key}"})
        ]
      else
        ''

  _assignDates: (dateData, departDate, returnDate = null) ->
    Object.assign(dateData, depart_date: departDate, return_date: returnDate) if dateData

  _getDatesData: (departDates) ->
    res = []
    for departDate in departDates
      if not @isOneWay()
        for returnDateKey, data of @props.prices[getKey(departDate)]
          # REVIEW: would be good to have dates in depart_date, return_date
          # instead of strings
          res.push(@_assignDates(data, departDate, new Date(returnDateKey)))
      else
        res.push(@_assignDates(@props.prices[getKey(departDate)], departDate))
    res

  _stubDateData: (departDate) ->
    {departDate: selectedDepartDate, returnDate: selectedReturnDate} = @props.initialDates
    returnDate = addDays(departDate, diff(selectedReturnDate, selectedDepartDate)) if selectedReturnDate
    depart_date: departDate
    return_date: returnDate

  _getCheapestDateData: (departDates) ->
    res = null
    for data in @_getDatesData(departDates)
      if data and (not res or data.value < res.value)
        res = data
    res ? @_stubDateData(departDates[0])

  _getCurrentDateData: ->
    {departDate, returnDate} = @props.initialDates
    currentDate = if returnDate
      @props.prices[getKey(departDate)]?[getKey(returnDate)]
    else
      @props.prices[getKey(departDate)]
    if currentDate
      @_assignDates(currentDate, departDate, returnDate)
    else
      @_stubDateData(departDate)

  # b.e. if today is thursday, return
  # [cheapest price for monday or tuesday,
  # cheapest price for wednesday,
  # current price,
  # cheapest price for friday,
  # cheast price for saturday or sunday]
  _getCheapestDatesData: ->
    {departDate} = @props.initialDates
    [
      @_getCheapestDateData([addDays(departDate, -3)])
      @_getCheapestDateData([addDays(departDate, -2)])
      @_getCheapestDateData([addDays(departDate, -1)])
      @_getCurrentDateData()
      @_getCheapestDateData([addDays(departDate, 1)])
      @_getCheapestDateData([addDays(departDate, 2)])
      @_getCheapestDateData([addDays(departDate, 3)])
    ]

  isOneWay: -> not @props.returnDateStart

mapStateToProps = (state) ->
  [there, back] = state.searchParams.segments
  initialDates:
    departDate: new Date(there.date)
    returnDate: if back then new Date(back.date) else null
  prices: prepareMatrixPrices(state, 'initialPrices')

export default connect(mapStateToProps)(MinimizedCalendarMatrix)
