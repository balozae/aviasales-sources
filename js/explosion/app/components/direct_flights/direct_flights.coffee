import React from 'react'
import {connect} from 'react-redux'
import {div, a, p, span, h3} from 'react-dom-factories'
import PropTypes from 'prop-types'
import MinPriceFetcher from '../prediction/min_price_fetcher'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {CSSTransition as CSSTransitionComponent} from 'react-transition-group'
import DirectFlightsSegmentComponent from './direct_flights_segment'
import PriceComponent from 'react_components/price/price'
import {format, addDays, getDatesRange, diff} from 'finity-js'
import {dateWithoutTimezone} from 'utils_date'
import {getTripType, getSegmentTitle, isCurrentSearchDates, haveChilds} from 'trip_helper'
import ErrorBoundaryComponent from 'shared_components/error_boundary/error_boundary'
import {directFlightsSearchClick, directFlightsDayClick} from 'common/js/redux/actions/direct_flights.actions'
import {withTranslation, Trans as TransComponent} from 'react-i18next'
import {dateToLowerCase} from 'shared_components/l10n/l10n'
import './direct_flights.scss'

CSSTransition = React.createFactory(CSSTransitionComponent)
DirectFlightsSegment = React.createFactory(DirectFlightsSegmentComponent)
Price = React.createFactory(PriceComponent)
ErrorBoundary = React.createFactory(ErrorBoundaryComponent)
Trans = React.createFactory(TransComponent)

class DirectFlights extends React.Component
  @displayName: 'DirectFlights'

  @propTypes:
    searchParams: PropTypes.object
    daysInSegment: PropTypes.number.isRequired
    cheapestStops: PropTypes.object

  constructor: (props) ->
    super(props)
    @state =
      selectedDays: @getInitialSelectedDays()
      currentSearchCheapestPrice: undefined
      prices: undefined
      isUserClicked: false

  componentDidMount: =>
    @minPrices = new MinPriceFetcher(
      onMatrixResponse: @handleMinPricesResponse
    )
    # TODO: use matrix prices from store, if it is available
    unless getTripType(@props.searchParams) is 'multiway'
      @fetchPrices()

  componentWillUnmount: =>
    @minPrices.abort()

  componentWillReceiveProps: (nextProps) =>
    if nextProps.cheapestStops isnt @props.cheapestStops
      @handleCheapestStopsUpdated(nextProps.cheapestStops)

  handleCheapestStopsUpdated: (cheapestStops) =>
    directFlightPrice = cheapestStops?[0]
    if directFlightPrice and not haveChilds(@props.searchParams)
      @setState(currentSearchCheapestPrice: directFlightPrice / @props.searchParams.passengers.adults)

  handleMinPricesResponse: (errors, response, data) =>
    if data?
      @setState(prices: data)

  handleDayClick: (segmentIndex, date) =>
    @setState({isUserClicked: true})
    @props.directFlightsDayClick('DIRECT_FLIGHTS_DATE_CLICK')
    selectedDays = @state.selectedDays.slice()
    selectedDays[segmentIndex] = date
    @setState({selectedDays})

  handleSearchClick: (e) =>
    e.preventDefault()
    [departDate, returnDate] = @state.selectedDays
    @props.directFlightsSearchClick(departDate, returnDate)

  fetchPrices: ->
    [there, back] = @props.searchParams.segments
    params =
      originCityIata: there.origin_city_iata ? there.origin
      destinationCityIata: there.destination_city_iata ? there.destination
      departDate: there.date
      departRange: @props.daysInSegment
    if back
      params.returnDate = back.date
      params.returnRange = @props.daysInSegment
    @minPrices.fetch(params, 'matrix')

  render: =>
    segmentsDays = @getSegmentsDays()

    div
      className: @blockClassName()
      h3
        className: @elementClassName('title')
        @props.t('direct_flights:title')
      if @haveDirectFlights(segmentsDays)
        div null,
          if haveChilds(@props.searchParams)
            p
              className: @elementClassName('note')
              @props.t('direct_flights:note')
          div
            className: @elementClassName('segments')
            for segmentDays, segmentIndex in segmentsDays
              DirectFlightsSegment
                days: segmentDays
                selectedDay: @state.selectedDays[segmentIndex]
                title: getSegmentTitle(@props.searchParams, segmentIndex)
                tripType: getTripType(@props.searchParams)
                key: segmentIndex
                onDayClick: @handleDayClick.bind(this, segmentIndex)
                t: @props.t
          @renderSearchButton()
      else
        p
          className: @elementClassName('error')
          @props.t('direct_flights:error')

  renderSearchButton: =>
    if getTripType(@props.searchParams) isnt 'multiway'
      price = @getDatePrice(@getSelectedDaysFlightDates())
    CSSTransition
      in: @state.isUserClicked
      classNames: 'is'
      timeout: 300
      unmountOnExit: true
      div
        className: @elementClassName('search')
        a
          className: @elementClassName('search-button')
          type: 'submit'
          href: '#search'
          onClick: @handleSearchClick
          if price
            span null,
            Trans
              ns: 'direct_flights',
              i18nKey: 'btnSearchWithPrice',
              Price
                valueInRubles: price
          else
            @props.t('direct_flights:btnSearch')
        p
          className: @elementClassName('search-summary')
          @getSearchSummary()

  getSearchSummary: =>
    locale = @props.t('common:dateTime', {returnObjects: true})
    segmentsText = for segment, segmentIndex in @props.searchParams.segments
      {destination_cases, destination_name, destination: iata} = segment
      destination = destination_cases?.vi or destination_name or iata
      "#{dateToLowerCase(format(@state.selectedDays[segmentIndex], 'D MMM', null, locale))} #{destination}"
    segmentsText.join(', ')

  getSegmentsDays: =>
    for segmentData, segmentIndex in @props.searchParams.segments
      @getSegmentDays(segmentData, segmentIndex)

  getSegmentDays: (segmentData, segmentIndex) =>
    tripType = getTripType(@props.searchParams)
    flightDate = segmentData.date
    daysGap = (@props.daysInSegment - 1) / 2
    flightsDate = getDatesRange(addDays(flightDate, -daysGap), addDays(flightDate, daysGap))
    for date in flightsDate
      {
        date: date
        isDisabled: @isDisabledDay(segmentIndex, date)
        isDirect: @isDirectDay(segmentData, date)
        price: @getDatePrice(@getFlightDates(segmentIndex, date)) if tripType isnt 'multiway'
      }

  isDirectDay: ({direct_flights_days}, date) ->
    return false unless direct_flights_days
    {days: directFlightBitmap, start: startDateOfBitmap} = direct_flights_days
    dateBitmapPosition = diff(date, new Date(startDateOfBitmap)) - 1
    directFlightBitmap[dateBitmapPosition] is '1'

  isDisabledDay: (segmentIndex, date) =>
    today = new Date().setHours(0, 0, 0, 0)
    return true if date < today
    isFirstSegment = (segmentIndex is 0)
    isLastSegment = (segmentIndex + 1 is @props.searchParams.segments.length)
    prevSegmentDate = if isFirstSegment then -Infinity else @state.selectedDays[segmentIndex - 1]
    nextSegmentDate = if isLastSegment then Infinity else @state.selectedDays[segmentIndex + 1]
    date > nextSegmentDate or date < prevSegmentDate

  getDatePrice: ({departDate, returnDate}, numberOfChanges = 0) =>
    return unless @state.prices
    flights = if returnDate
      @state.prices[departDate]?[returnDate]
    else
      @state.prices[departDate]
    return unless flights
    price = (flight.value for flight in flights when flight.number_of_changes is numberOfChanges)?[0]
    # NOTE: if search with childs, return price for 1 adult
    if haveChilds(@props.searchParams)
      price
    else
      if isCurrentSearchDates(@props.searchParams, {departDate, returnDate}) and @state.currentSearchCheapestPrice
        price = @state.currentSearchCheapestPrice
      price * @props.searchParams.passengers.adults

  getFlightDates: (segmentIndex, date) =>
    tripType = getTripType(@props.searchParams)
    if tripType is 'oneway'
      departDate: format(date, 'YYYY-MM-DD')
    else if tripType is 'roundtrip'
      segmentType = if segmentIndex is 0 then 'depart' else 'return'
      switch segmentType
        when 'depart'
          departDate: format(date, 'YYYY-MM-DD')
          returnDate: format(@state.selectedDays[1], 'YYYY-MM-DD')
        when 'return'
          departDate: format(@state.selectedDays[0], 'YYYY-MM-DD')
          returnDate: format(date, 'YYYY-MM-DD')

  haveDirectFlights: (segmentsDays) ->
    segmentsDays.some((days) ->
      days.some ({isDirect, price}) -> isDirect or price
    )

  getSelectedDaysFlightDates: =>
    {selectedDays} = @state
    switch getTripType(@props.searchParams)
      when 'oneway'
        {departDate: format(selectedDays[0], 'YYYY-MM-DD')}
      when 'roundtrip'
        {
          departDate: format(selectedDays[0], 'YYYY-MM-DD'),
          returnDate: format(selectedDays[1], 'YYYY-MM-DD')
        }

  getInitialSelectedDays: =>
    return [] unless @props.searchParams.segments
    @props.searchParams.segments.map (segment) -> dateWithoutTimezone(segment.date)

mapStateToProps = (state) ->
  cheapestStops: state.cheapestStops
  searchParams: state.searchParams
  daysInSegment: if getTripType(state.searchParams) is 'multiway' then 3 else 5

mapDispatchToProps = (dispatch) ->
  directFlightsDayClick: () -> dispatch(directFlightsDayClick())
  directFlightsSearchClick: (departDate, returnDate) -> dispatch(directFlightsSearchClick(departDate, returnDate))


DirectFlightsWithConnect = React.createFactory(
  connect(mapStateToProps, mapDispatchToProps)(
    withTranslation('direct_flights')(BlockElementClassnames(DirectFlights))
  )
)

export default ErrorBoundary(null, DirectFlightsWithConnect())
