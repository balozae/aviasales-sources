import PropTypes from 'prop-types'
import React from 'react'
import dispatcher from 'dispatcher'
import {div} from 'react-dom-factories'
import classNames from 'classnames'
import {CSSTransition as CSSTransitionComponent} from 'react-transition-group'
import {connect} from 'react-redux'
import {format, addDays, addYears, isLeap} from 'finity-js'
import {withTranslation} from 'react-i18next'
import cookies from 'oatmeal-cookie'
import marker from 'marker'
import deepCopy from 'deep_copy'
import Rollbar from 'common/utils/rollbar'
import update from 'immutability-helper'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {updateGraphPrices, updateMatrixPrices, updateGraphTripDuration} from 'common/js/redux/actions/prediction.actions'
import {updateAviaParams} from 'common/js/redux/actions/avia_params.actions'
import {updateTabParams} from 'common/js/redux/actions/page_header.actions'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'
import MinPriceFetcher from './min_price_fetcher'
import PredictionHeaderComponent from './header/header'
import PredictionExpandedComponent from './prediction_expanded'
import {ErrorConnection, ErrorServer} from './errors'
import ErrorBoundaryComponent from 'shared_components/error_boundary/error_boundary'
import {ErrorType} from 'shared_components/error_boundary/error_boundary.types'
import mapStateToProps from './map_state_to_props'
import MinimizedCalendarMatrixComponent from './calendar_matrix/minimized_calendar_matrix'
import CalendarMatrixComponent from './calendar_matrix/calendar_matrix'
import CalendarGraphComponent from './calendar_graph/calendar_graph'
import {addBodyClass, removeBodyClass} from 'common/js/redux/actions/body_class.actions'
import {updateSegmentDate} from 'form/components/avia_form/utils'

import './styles/prediction.scss'

CSSTransition = React.createFactory(CSSTransitionComponent)
PredictionExpanded = React.createFactory(PredictionExpandedComponent)
MinimizedCalendarMatrix = React.createFactory(MinimizedCalendarMatrixComponent)
CalendarMatrix = React.createFactory(CalendarMatrixComponent)
CalendarGraph = React.createFactory(CalendarGraphComponent)
PredictionHeader = React.createFactory(PredictionHeaderComponent)
ErrorBoundary = React.createFactory(ErrorBoundaryComponent)

CLASS_CALENDAR_HIDDEN = 'is-calendar-hidden'
CLASS_PREDICTION_EXPANDED = 'is-prediction-expanded'

class Prediction extends React.Component
  @displayName: 'Prediction'

  @propTypes:
    searchParams: PropTypes.object.isRequired
    isAffiliate: PropTypes.bool.isRequired
    searchId: PropTypes.string
    initialFlight: PropTypes.object.isRequired
    showCountdown: PropTypes.bool
    showCalendar: PropTypes.bool
    graph: PropTypes.shape(
      initialPrices: PropTypes.array
      prices: PropTypes.array
      tripDuration: PropTypes.number
    )
    hasMatrixPrices: PropTypes.bool.isRequired
    cheapestStops: PropTypes.object
    matchMedia: PropTypes.object

  @defaultProps:
    matchMedia: matchMedia('(max-width: 1023px)')
    isAffiliate: marker.is_affiliate(marker.get())
    matrix:
      prices: {}
      initialPrices: {}
    graph:
      prices: []
      initialPrices: []
      tripDuration: null

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    isExpanded: false
    isSmallScreen: @props.matchMedia.matches
    isLoading: true
    calendarType: cookies.get('calendar_type') or 'matrix'
    error: null
    cheapestStops: {}
    graph:
      initialGraphStartDay: null
      departDate: @props.initialFlight.departDate
    matrix:
      selectedFlight:
        departDate: @props.initialFlight.departDate
        returnDate: @props.initialFlight.returnDate
      departDateStart: @props.initialFlight.departDate
      returnDateStart: @props.initialFlight.returnDate

  componentDidMount: ->
    @props.matchMedia.addListener(@handleResize)
    @minPrices = new MinPriceFetcher(
      onGraphResponse: @handlePricesResponse.bind(this, 'graph')
      onMatrixResponse: @handlePricesResponse.bind(this, 'matrix')
    )
    @setBodyClassnames()

  componentDidCatch: (error, errorType) ->
    @setState({error: new ErrorServer(), isLoading: false})
    Rollbar.error(error)

  componentDidUpdate: (prevProps, prevState) ->
    unless @_resetPrediction(prevProps)
      if (prevProps.graph.tripDuration isnt @props.graph.tripDuration) and
          @props.graph.initialPrices.length
        @_performCalendarGraphRequest()
      if (prevState.matrix.departDateStart isnt @state.matrix.departDateStart or
          prevState.matrix.returnDateStart isnt @state.matrix.returnDateStart) and
          @props.hasMatrixPrices
        @_performCalendarMatrixRequest()
    if prevState.isExpanded isnt @state.isExpanded or prevState.calendarType isnt @state.calendarType
      @setBodyClassnames()

  componentWillUnmount: ->
    @props.matchMedia.removeListener(@handleResize)
    @minPrices?.abort()
    @props.removeBodyClass(CLASS_PREDICTION_EXPANDED)

  _isOneWay: ->
    not @props.initialFlight.returnDate

  _resetPrediction: (prevProps) ->
    if (@props.searchStatus isnt prevProps.searchStatus and @props.searchStatus is 'STARTED') or
        (@props.searchId and not prevProps.searchId)
      @minPrices = new MinPriceFetcher(
        onGraphResponse: @handlePricesResponse.bind(this, 'graph')
        onMatrixResponse: @handlePricesResponse.bind(this, 'matrix')
      )
      @setState(@getInitialState(), @_performCalendarRequest)
      true
    else
      false

  render: ->
    return null if @state.isSmallScreen
    return null unless Object.keys(@props.initialFlight).length
    div
      className: @blockClassName()
      div(
        className: classNames(
          @elementClassName('wrap')
          "--#{@state.calendarType}"
          'is-hidden': not (@props.showCalendar or @props.showCountdown)
        )
        PredictionHeader(
          t: @props.t
          showCountdown: @props.showCountdown
          showCalendar: @props.showCalendar
          onExpand: @handleExpand
          calendarType: @state.calendarType
          isExpanded: @state.isExpanded
          initialFlight: @props.initialFlight
          error: @state.error
          onRefresh: @handleErrorRefreshClick
          searchId: @props.searchId
        )
        PredictionExpanded(
          t: @props.t
          isVisible: @props.showCalendar
          calendarType: @state.calendarType
          error: @state.error
          onRefresh: @handleErrorRefreshClick
          onCalendarTypeChange: @handleCalendarTypeChange
          if @state.calendarType is 'graph'
            CalendarGraph(
              t: @props.t
              prices: @props.graph.prices
              cheapestStops: @props.cheapestStops
              passengers: @props.searchParams.passengers
              departDate: @state.graph.departDate
              tripDuration: @props.graph.tripDuration
              initialGraphStartDay: @state.graph.initialGraphStartDay
              isSmallScreen: @state.isSmallScreen
              isLoading: @state.isLoading
              isExpanded: @state.isExpanded
              onParamsChange: @handleCalendarParamsChange.bind(this, 'graph')
              onExpand: @handleExpand
              onDatesSelect: @handleDatesSelect
            )
          else
            div(null,
              CSSTransition
                timeout: 300
                classNames: 'is'
                unmountOnExit: true
                in: @state.isExpanded
                CalendarMatrix(
                  t: @props.t
                  departDateStart: @state.matrix.departDateStart
                  returnDateStart: @state.matrix.returnDateStart
                  selectedFlight: @state.matrix.selectedFlight
                  isLoading: @state.isLoading
                  onParamsChange: @handleCalendarParamsChange.bind(this, 'matrix')
                  key: 'matrix'
                  onDatesSelect: @handleDatesSelect
                )
              CSSTransition
                timeout: 300
                classNames: 'is'
                unmountOnExit: true
                in: !@state.isExpanded
                MinimizedCalendarMatrix(
                  t: @props.t
                  departDateStart: @state.matrix.departDateStart
                  returnDateStart: @state.matrix.returnDateStart
                  selectedFlight: @state.matrix.selectedFlight
                  onExpand: @handleExpand
                  onParamsChange: @handleCalendarParamsChange.bind(this, 'matrix')
                  key: 'matrix-minimized'
                  onDatesSelect: @handleDatesSelect
                )
            )
        )
        div(
          className: @elementClassName('canvas')
          unless @_adultsOnly()
            div(
              className: classNames(
                @elementClassName('notice')
                '--oneway': @_isOneWay()
              )
              @props.t('prediction:approximatePrices')
            )
        )
      )

  handleResize: (media) =>
    isSmallScreen = media.matches
    # hide on screens < 1024px
    if isSmallScreen && @state.isExpanded
      @handleExpand(@state.calendarType)
    @setState(isSmallScreen: isSmallScreen)

  handleCalendarParamsChange: (type, params, setStateCallback = ->) ->
    @setState(
      "#{type}": update(@state[type], $merge: params)
      setStateCallback
    )
    if params.tripDuration and type is 'graph'
      @props.updateGraphTripDuration(params.tripDuration)

  # TODO: delete data. get prices from response
  handlePricesResponse: (type, errors, response, data) =>
    data = deepCopy(data)
    error = if errors
      new ErrorConnection()
    else if response and response.statusCode isnt 200
      new ErrorServer()
    else
      # NOTE: when many adults without children come together we calculate summary price for them
      # TODO: move all prices manipulations to connect
      if @_adultsOnly() and @props.searchParams.passengers.adults > 1
        data = this["_#{type}PricesForAdults"](data)
      newPrices = @_preparePrices(type, data, @state.tripDuration)
      @props.updatePrices(type, newPrices)
      null
    @setState(isLoading: false, error: error)

  handleErrorRefreshClick: =>
    @_performCalendarGraphRequest()
    @props.reachGoal('PREDICTION_MIN_PRICES_REFRESH')

  handleExpand: (calendarType) =>
    @props.reachGoal('PREDICTION_EXPAND_CLICK', isOpening: not @state.isExpanded)
    calendarType = if calendarType and typeof calendarType is 'string'
      calendarType
    else
      @state.calendarType
    isExpanded = if calendarType is @state.calendarType then not @state.isExpanded else true
    @setState({isExpanded, calendarType}, @_performCalendarRequest)

  handleCalendarTypeChange: (calendarType) =>
    @props.reachGoal("PREDICTION_CHANGED_TO_#{calendarType.toUpperCase()}")
    cookies.set('calendar_type', calendarType)
    @setState({calendarType}, @_performCalendarRequest)

  handleDatesSelect: (departDate, returnDate) =>
    segments = updateSegmentDate('departDate', departDate, @props.formParams.segments)
    segments = updateSegmentDate('returnDate', returnDate, segments) if returnDate
    @props.updateFormParams({segments})

  _performCalendarRequest: =>
    switch @state.calendarType
      when 'graph' then @_performCalendarGraphRequest()
      when 'matrix' then @_performCalendarMatrixRequest()

  _performCalendarGraphRequest: ->
    return unless @props.showCalendar
    {origin, destination} = @props.searchParams.segments[0]
    params = {
      origin
      destination
      tripClass: @props.searchParams.trip_class
      isAffiliate: @props.isAffiliate
      tripDuration: @props.graph.tripDuration
      onlyDirect: false
    }
    @setState(isLoading: true)
    @minPrices.abort()
    @minPrices.fetch(params, 'graph')

  _performCalendarMatrixRequest: ->
    return unless @props.showCalendar and @props.initialFlight.isPlacesRestored
    params = Object.assign({}, @props.initialFlight, {
      departDate: @state.matrix.departDateStart
      returnDate: @state.matrix.returnDateStart
    })
    @setState(isLoading: true)
    @minPrices.abort()
    @minPrices.fetch(params, 'matrix')

  _preparePrices: (type, data, tripDuration) ->
    return data if type is 'matrix'
    beginningOfPeriod = new Date()
    days = if isLeap(addYears(beginningOfPeriod, 1)) then 365 else 364
    prices = {}
    prices[depart_date] = value for {depart_date, value} in data
    for key in [0..days]
      departDate = addDays(beginningOfPeriod, key)
      value = prices[format(departDate, 'YYYY-MM-DD')] or 0
      {departDate, value}

  _adultsOnly: ->
    not (@props.searchParams.passengers.children or @props.searchParams.passengers.infants)

  _priceForAdults: (price) ->
    update(price, {value: {$set: price.value * @props.searchParams.passengers.adults}})

  _graphPricesForAdults: (prices) ->
    @_priceForAdults(price) for price in prices

  _matrixPricesForAdults: (data) ->
    result = {}
    if @_isOneWay()
      for departDate, prices of data
        result[departDate] = (@_priceForAdults(price) for price in prices)
    else
      for departDate, returnDates of data
        result[departDate] ?= {}
        for returnDate, prices of returnDates
          result[departDate][returnDate] = (@_priceForAdults(price) for price in prices)
    result

  setBodyClassnames: ->
    if @props.showCalendar
      @props.removeBodyClass(CLASS_CALENDAR_HIDDEN)
    else
      @props.addBodyClass(CLASS_CALENDAR_HIDDEN)
    if @state.isExpanded
      @props.addBodyClass(CLASS_PREDICTION_EXPANDED)
    else
      @props.removeBodyClass(CLASS_PREDICTION_EXPANDED)
    if @state.calendarType is 'matrix'
      @props.removeBodyClass('is-calendar-graph')
      @props.addBodyClass('is-calendar-matrix')
    else if @state.calendarType is 'graph'
      @props.removeBodyClass('is-calendar-matrix')
      @props.addBodyClass('is-calendar-graph')

mapDispatchToProps = (dispatch) -> {
  updatePrices: (key, prices) ->
    switch key
      when 'graph' then dispatch(updateGraphPrices(prices))
      when 'matrix' then dispatch(updateMatrixPrices(prices))
      else ->
  removeBodyClass: (className) -> dispatch(removeBodyClass(className))
  addBodyClass: (className) -> dispatch(addBodyClass(className))
  updateGraphTripDuration: (tripDuration) -> dispatch(updateGraphTripDuration(tripDuration))
  updateFormParams: (params) ->
    dispatch(updateAviaParams(params))
    dispatch(updateTabParams('avia', {showFormHint: true}))
  reachGoal: (event, data) -> dispatch(reachGoal(event, data))
}

PredictionWithConnect = React.createFactory(
  connect(mapStateToProps, mapDispatchToProps)(
    withTranslation('prediction')(BlockElementClassnames(Prediction))
  )
)

export default ErrorBoundary(null, PredictionWithConnect())
