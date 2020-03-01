import React from 'react'
import PropTypes from 'prop-types'
import {div, button, span} from 'react-dom-factories'
import classNames from 'classnames'
import {addDays, getDatesRange, format} from 'finity-js'
import {isWeekend} from 'utils_date'
import PriceComponent from 'react_components/price/short_price'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {prepareMatrixPrices} from './price_utils'
import {getKey, getCheapestValue, isCheap} from '../price_utils'
# import LoaderComponent from '../loader'
import ControlComponent from './control'
import DirectFlightsTumblerComponent from './direct_flights_tumbler'
import {connect} from 'react-redux'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { dateToLowerCase } from 'shared_components/l10n/l10n';
import './calendar_matrix.scss'

DirectFlightsTumbler = React.createFactory(DirectFlightsTumblerComponent)
Price = React.createFactory(PriceComponent)
# Loader = React.createFactory(LoaderComponent)
Control = React.createFactory(ControlComponent)

CALENDAR_MATRIX_DAY_STEP = 1

class CalendarMatrix extends React.Component
  @displayName: 'CalendarMatrix'

  @propTypes:
    t: PropTypes.func.isRequired
    prices: PropTypes.object
    onParamsChange: PropTypes.func.isRequired
    departDateStart: PropTypes.instanceOf(Date).isRequired
    returnDateStart: PropTypes.instanceOf(Date)
    daysInRow: PropTypes.number
    isLoading: PropTypes.bool
    selectedFlight: PropTypes.shape(
      departDate: PropTypes.instanceOf(Date).isRequired
      returnDate: PropTypes.instanceOf(Date)
    ).isRequired
    onDatesSelect: PropTypes.func.isRequired

  @defaultProps: daysInRow: 7

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    hoverDate: undefined

  handlePriceClick: (price, departDate, returnDate) ->
    @props.reachGoal('PREDICTION_PRICE_MATRIX_PRICE_CLICK', {price, departDate, returnDate})
    @props.onDatesSelect(departDate, returnDate)
    @props.onParamsChange(selectedFlight: {departDate, returnDate})

  handleDateMouseEnter: (departDate, returnDate) ->
    @setState(hoverDate: [departDate, returnDate])

  handleDateMouseLeave: =>
    @setState(hoverDate: false)

  handleControlClick: (direction, step) ->
    @props.reachGoal('PREDICTION_PRICE_MATRIX_CONTROL_CLICK', {step, direction})
    dates =
      depart: new Date(@props.departDateStart)
      return: new Date(@props.returnDateStart)
    days = switch step
      when 'next' then CALENDAR_MATRIX_DAY_STEP
      when 'prev' then -CALENDAR_MATRIX_DAY_STEP
    if dates[direction]
      dates[direction].setDate(dates[direction].getDate() + days)
      @props.onParamsChange("#{direction}DateStart": dates[direction])

  render: ->
    departDates = @getDates(@props.departDateStart)
    returnDates = @getDates(@props.returnDateStart)
    div
      className: @blockClassName()
      @renderControls()
      div
        className: classNames(
          @elementClassName('wrap')
          '--oneway': @isOneway()
        )
        @renderHeadingDates(departDates, 'depart')
        div
          className: @elementClassName('x-wrap')
          div
            className: @elementClassName('prices-wrap')
            @renderPrices(departDates, returnDates)
          @renderHeadingDates(returnDates, 'return')
        # Loader(
        #   startAnimation: @props.isLoading
        #   sticky: false
        #   color: 'blue'
        #   speed: 'fast'
        #   background: 'white'
        #   hash: 'matrix'
        # )

  renderHeadingDates: (headingDates, type) ->
    locale = @props.t('common:dateTime', {returnObjects: true})
    div
      className: @elementClassName("#{type}-dates")
      for date in headingDates
        isCrossHover = switch type
          when 'depart' then @isCrossHover(date, null)
          when 'return' then @isCrossHover(null, date)
        div
          key: format(date, 'DD-MMM')
          className: classNames(
            @elementClassName('date')
            '--weekend': isWeekend(date)
            'is-crosshover': isCrossHover
          )
          span null, format(date, 'ddd', null, locale)
            dateToLowerCase(format(date, 'DD MMM', null, locale))

  renderPrices: (departDates, returnDates) ->
    div
      className: @elementClassName('prices')
      if returnDates.length > 0
        for returnDate in returnDates when returnDate
          div
            key: returnDate
            className: @elementClassName('row')
            @renderDepartPrices(departDates, returnDate)
      else
        div
          className: @elementClassName('row')
          @renderDepartPrices(departDates)

  renderPrice: (departDate, returnDate, cheapestValue) ->
    dateData = @getDateData(departDate, returnDate)
    div
      key: getKey(departDate, returnDate)
      className: classNames(
        @elementClassName('item')
        '--loading': @props.isLoading and not dateData?.value and not dateData?.unavailable
        '--cheap': isCheap(dateData?.value, cheapestValue)
        '--unavailable': dateData?.unavailable
        '--empty': not @props.isLoading and not dateData?.value and not dateData?.unavailable
        'is-crosshover': @isCrossHover(departDate, returnDate)
        'is-current': @isCurrentDate(departDate, returnDate)
      )
      onMouseEnter: @handleDateMouseEnter.bind(this, departDate, returnDate)
      onMouseLeave: @handleDateMouseLeave
      onClick: @handlePriceClick.bind(this, dateData?.value, departDate, returnDate)
      span
        className: @elementClassName('item-inner')
        if dateData?.value
          Price(valueInRubles: dateData?.value)
        else if @props.isLoading and not dateData?.value and not dateData?.unavailable
          '%*$&#'
        else
          ''

  renderDepartPrices: (departDates, returnDate = null) ->
    cheapestValue = getCheapestValue(@props.prices)
    for departDate in departDates
      @renderPrice(departDate, returnDate, cheapestValue)

  renderControls: ->
    div
      className: classNames(
        @elementClassName('control-wrap')
        '--oneway': @isOneway()
      )
      DirectFlightsTumbler
        t: @props.t
        className: @elementClassName('direct')
        titleClassName: @elementClassName('tumbler-title')
      Control
        label: @props.t('prediction:depart')
        type: 'depart'
        departDateStart: @props.departDateStart
        returnDateStart: @props.returnDateStart
        onClick: @handleControlClick.bind(this, 'depart')
        daysInRow: @props.daysInRow
      if @props.returnDateStart
        Control
          label: @props.t('prediction:return')
          type: 'return'
          departDateStart: @props.departDateStart
          returnDateStart: @props.returnDateStart
          onClick: @handleControlClick.bind(this, 'return')
          daysInRow: @props.daysInRow

  getDates: (date) ->
    if date
      daysGap = (@props.daysInRow - 1) / 2
      from = addDays(date, -daysGap)
      to = addDays(date, daysGap)
      getDatesRange(from, to)
    else
      []

  isCrossHover: (departDate, returnDate) ->
    return false unless @state?.hoverDate
    [hoverDepartDate, hoverReturnDate] = @state.hoverDate
    return (
      returnDate and
      returnDate?.getDay() is hoverReturnDate?.getDay() and
      (departDate >= hoverDepartDate or departDate is null)
    ) or (
      departDate?.getDay() is hoverDepartDate?.getDay() and
      returnDate <= hoverReturnDate
    )

  isCurrentDate: (departDate, returnDate) ->
    {departDate: selectedDepartDate, returnDate: selectedReturnDate} = @props.selectedFlight
    returnFlag = true
    if returnDate
      returnFlag = if +selectedReturnDate is +returnDate then true else false
    +selectedDepartDate is +departDate and returnFlag

  isOneway: ->
    not @props.returnDateStart

  getDateData: (departDate, returnDate) ->
    today = new Date().setHours(0, 0, 0, 0)
    departKey = getKey(departDate)
    dateData = if returnDate
      returnKey = getKey(returnDate)
      @props.prices?[departKey]?[returnKey]
    else
      @props.prices?[departKey]
    return dateData if dateData
    if returnDate
      return {unavailable: returnDate < departDate or departDate < today}
    else
      return {unavailable: departDate < today}

mapStateToProps = (state) ->
  prices: prepareMatrixPrices(state)

mapDispatchToProps = (dispatch) ->
  reachGoal: (name) -> dispatch(reachGoal(name)),

export default connect(mapStateToProps, mapDispatchToProps)(BlockElementClassnames(CalendarMatrix))
