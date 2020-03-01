import {connect} from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import {div, a} from 'react-dom-factories'
import update from 'immutability-helper'
import classNames from 'classnames'
import bench from 'console_bench'
import deepCopy from 'deep_copy'
import isEqual from 'is_equal'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {updateFilters} from 'common/js/redux/actions/filters.actions'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'
import {removeHighlightedTicketParams} from 'common/js/redux/actions/highlighted_ticket_params.actions'
import StopsFilterComponent from './stops_filter'
import BaggageFilterComponent from './baggage_filter'
import StopsDurationFilterComponent from './stops_duration_filter'
import DepartureArrivalFilterComponent from './departure_arrival_filter'
import GatesFilterComponent from './gates_filter'
import PaymentMethodsFilterComponent from './payment_methods_filter'
import AirportsFilterComponent from './airports_filter'
import AirlinesFilterComponent from './airlines_filter'
import FlightDurationFilterComponent from './flight_duration_filter'
import VisaFilterComponent from './visa_filter'
import ChinaFilterComponent from './china_filter'
import StopoverFilterComponent from './stopover_filter'
import PriceFilterComponent from './price_filter'
import PopularFiltersComponent from 'components/popular_filters/popular_filters'
import ErrorBoundaryComponent from 'shared_components/error_boundary/error_boundary'
import {ErrorType} from 'shared_components/error_boundary/error_boundary.types'
import {withTranslation} from 'react-i18next'
import tripHelper from 'trip_helper.coffee'
import makeResponsive from './filters_responsive_hoc'
import reduceFuncCache from './reduce_func_cache'

import './styles/filters.scss'
import './styles/filter.scss'
import './styles/reset-button.scss'

ErrorBoundary = React.createFactory(ErrorBoundaryComponent)
StopoverFilter = React.createFactory(StopoverFilterComponent)
AirportsFilter = React.createFactory(AirportsFilterComponent)
AirlinesFilter = React.createFactory(AirlinesFilterComponent)
BaggageFilter = React.createFactory(BaggageFilterComponent)
GatesFilter = React.createFactory(GatesFilterComponent)
StopsFilter = React.createFactory(StopsFilterComponent)
PaymentMethodsFilter = React.createFactory(PaymentMethodsFilterComponent)
DepartureArrivalFilter = React.createFactory(DepartureArrivalFilterComponent)
FlightDurationFilter = React.createFactory(FlightDurationFilterComponent)
PriceFilter = React.createFactory(PriceFilterComponent)
StopsDurationFilter = React.createFactory(StopsDurationFilterComponent)
VisaFilter = React.createFactory(VisaFilterComponent)
PopularFilters = React.createFactory(PopularFiltersComponent)
ChinaFilter = React.createFactory(ChinaFilterComponent)

FILTER_COMPONENTS = {
  stops: StopoverFilterComponent
  stopsDuration: StopsDurationFilterComponent
  departureArrival: DepartureArrivalFilterComponent
  gates: GatesFilterComponent
  airlines: AirlinesFilterComponent
  airports: AirportsFilterComponent
  stopover: StopoverFilterComponent
  duration: FlightDurationFilterComponent
  paymentMethods: PaymentMethodsFilterComponent
  price: PriceFilterComponent
  baggage: BaggageFilterComponent
  visa: VisaFilter
  china: ChinaFilter
}

class Filters extends React.Component
  @displayName: 'Filters'

  @propTypes:
    t: PropTypes.func.isRequired
    gates: PropTypes.object.isRequired
    airlines: PropTypes.object.isRequired
    airports: PropTypes.object.isRequired
    segments: PropTypes.array.isRequired

  constructor: (props) ->
    super(props)
    @state = @getInitialState()
    @filterRefs = {}
    @popularFilters = React.createRef()

  getInitialState: ->
    boundaries: @_initialBoundaries()
    filters: @_initialFilters()
    precheckedFilters: []
    isAppliedSavedFilters: false
    isChangedByUser: false
    filtersChangedByUser: new Set()

  componentDidUpdate: (prevProps, {filters}) ->
    if filters isnt @state.filters
      @updateStoreFiltersState()

  componentDidMount: ->
    # Calculate boundaries form incoming tickets
    @calculateBoundaries()
    @updateStoreFiltersState()

  componentWillReceiveProps: (nextProps) ->
    @updateVisaFilterStateOnStoreChange(nextProps)
    @updateChinaFilterStateOnStoreChange(nextProps)
    if @props.savedFilters isnt nextProps.savedFilters and nextProps.savedFilters
      newFilters = Object.assign({}, @state.filters)
      newChangedFilters = []
      Object.keys(nextProps.savedFilters).forEach((filterKey) ->
        newFilters[filterKey] = nextProps.savedFilters[filterKey]
        newChangedFilters.push(filterKey)
      )
      @setState(
        filters: newFilters
        changedFilters: newChangedFilters
        isAppliedSavedFilters: true
      )
    if (nextProps.tickets isnt @props.tickets) or (nextProps.openedFilters.length > @props.openedFilters.length)
      @calculateBoundaries(nextProps.tickets, nextProps.searchParams, nextProps.openedFilters)
    if @props.storeFilters.changedFilters.length isnt 0 and nextProps.storeFilters.changedFilters.length is 0 and nextProps.storeFilters.filtersChangedByUser.length is 0
      @handleResetAllFilters()
    else if not @props.storeFilters.resetFilter and nextProps.storeFilters.resetFilter
      @handleResetFilter(nextProps.storeFilters.resetFilter)
    # NOTE: check only isCodeshareIncluded, not whole object with deepEqual
    #       because dont wanna loose perforamce for one edge case, rewrite when filters refactor
    else if nextProps.storeFilters?.filters? and @state.filters?.airlines?.isCodeshareIncluded isnt
      nextProps.storeFilters?.filters?.airlines?.isCodeshareIncluded
        @handleChangeFilter('airlines', nextProps.storeFilters.filters.airlines)

  # defining the ref callback as a bound method on the class
  # because of caveats with callback refs
  setFilterRef: (ref) =>
    if ref && ref.props && ref.props.name
      @filterRefs[ref.props.name] = ref

  render: ->
    div(
      className: 'filters__wrapper'
      ErrorBoundary(
        errorText: 'PopularFilters component error.'
        PopularFilters(
          ref: @popularFilters
          popularFilters: @props.popularFilters
          boundaries: @state.boundaries
          onChange: @handleChangeFilter.bind(this)
          airlinesInfo: @props.airlines
          airportsInfo: @props.airports
          gatesInfo: @props.gates
          isLoading: !@props.isSearchFinished
          routeArray: tripHelper.getRouteArray(@props.searchParams)
          calculateBoundaries: @calculateBoundaries.bind(this, @props.tickets, @props.searchParams)
          filters: @state.filters
          reachGoal: @props.reachGoal
        )
      )
      div(
        className: 'filters'
        StopsFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.stops
          name: 'stops'
          unchecked: @state.filters.stops
          onChange: @handleChangeFilter.bind(this, 'stops')
          onReset: @handleResetFilter.bind(this, 'stops')
          isTicketsAlreadyRendered: @props.isTicketsAlreadyRendered
          precheckedFilters: @state.precheckedFilters
          isAppliedSavedFilters: @state.isAppliedSavedFilters
          filtersChangedByUser: Array.from(@state.filtersChangedByUser)
        )
        ChinaFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.china
          name: 'china'
          unchecked: @state.filters.china
          onChange: @handleChangeFilter.bind(this, 'china')
          onReset: @handleResetFilter.bind(this, 'china')
          calculateBoundaries: @calculateBoundaries.bind(this, @props.tickets, @props.searchParams)
          isTicketsAlreadyRendered: @props.isTicketsAlreadyRendered
        )
        VisaFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.visa
          name: 'visa'
          unchecked: @state.filters.visa
          onChange: @handleChangeFilter.bind(this, 'visa')
          onReset: @handleResetFilter.bind(this, 'visa')
          calculateBoundaries: @calculateBoundaries.bind(this, @props.tickets, @props.searchParams)
          isLoading: !@props.isSearchFinished
        )
        DepartureArrivalFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.departureArrival
          name: 'departureArrival'
          changes: @state.filters.departureArrival
          onChange: @handleChangeFilter.bind(this, 'departureArrival')
          onReset: @handleResetFilter.bind(this, 'departureArrival')
          airportsInfo: @props.airports
          segments: @props.segments
        )
        BaggageFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.baggage
          name: 'baggage'
          unchecked: @state.filters.baggage
          airlines: @props.airlines
          onChange: @handleChangeFilter.bind(this, 'baggage')
          onReset: @handleResetFilter.bind(this, 'baggage')
        )
        StopsDurationFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.stopsDuration
          name: 'stopsDuration'
          range: @state.filters.stopsDuration
          onChange: @handleChangeFilter.bind(this, 'stopsDuration')
          onReset: @handleResetFilter.bind(this, 'stopsDuration')
        )
        FlightDurationFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.duration
          name: 'duration'
          range: @state.filters.duration
          onChange: @handleChangeFilter.bind(this, 'duration')
          onReset: @handleResetFilter.bind(this, 'duration')
          segments: @props.segments
          airportsInfo: @props.airports
        )
        AirlinesFilter(
          t: @props.t
          onChange: @handleChangeFilter.bind(this, 'airlines')
          onReset: @handleResetFilter.bind(this, 'airlines')
          ref: @setFilterRef
          keys: @state.filters.airlines.keys
          checkStatus: @state.filters.airlines.checkStatus
          isCodeshareIncluded: @state.filters.airlines.isCodeshareIncluded
          boundaries: @state.boundaries.airlines
          name: 'airlines'
          airlinesInfo: @props.airlines
        )
        AirportsFilter(
          t: @props.t
          boundaries: @state.boundaries.airports
          name: 'airports'
          unchecked: @state.filters.airports
          onChange: @handleChangeFilter.bind(this, 'airports')
          onReset: @handleResetFilter.bind(this, 'airports')
          airportsInfo: @props.airports
          segments: @props.segments
          ref: @setFilterRef
          isTicketsAlreadyRendered: @props.isTicketsAlreadyRendered
          isAppliedSavedFilters: @state.isAppliedSavedFilters
        )
        StopoverFilter(
          t: @props.t
          onChange: @handleChangeFilter.bind(this, 'stopover')
          onReset: @handleResetFilter.bind(this, 'stopover')
          ref: @setFilterRef
          unchecked: @state.filters.stopover
          boundaries: @state.boundaries.stopover
          name: 'stopover'
          airportsInfo: @props.airports
          segments: @props.segments
        )
        GatesFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.gates
          name: 'gates'
          unchecked: @state.filters.gates
          onChange: @handleChangeFilter.bind(this, 'gates')
          onReset: @handleResetFilter.bind(this, 'gates')
          gatesInfo: @props.gates
        )
        PaymentMethodsFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.paymentMethods
          name: 'paymentMethods'
          unchecked: @state.filters.paymentMethods
          onChange: @handleChangeFilter.bind(this, 'paymentMethods')
          onReset: @handleResetFilter.bind(this, 'paymentMethods')
          gatesInfo: @props.gates
        )
        PriceFilter(
          t: @props.t
          ref: @setFilterRef
          boundaries: @state.boundaries.price
          name: 'price'
          range: @state.filters.price
          onChange: @handleChangeFilter.bind(this, 'price')
          onReset: @handleResetFilter.bind(this, 'price')
        )
        div(
          className: 'filters__item --reset-all'
          a
            className: classNames(
              @elementClassName('reset-all-link'),
              'is-disabled': not @_changedFilters().length
            )
            onClick: @handleResetAllFilters
            @props.t('filters:resetAllFilters')
        )
      )
    )

  updateStoreFiltersState: () =>
    @props.updateFilters({
      filterFunc: @_buildFilterFunc()
      filters: deepCopy(@state.filters)
      changedFilters: @_changedFilters()
      precheckedFilters: @state.precheckedFilters
      isFiltersChangedByUser: @state.isChangedByUser
      filtersChangedByUser: Array.from(@state.filtersChangedByUser)
    })

  updateVisaFilterStateOnStoreChange: (nextProps) =>
    if nextProps.storeFilters.filters and (JSON.stringify(nextProps.storeFilters.filters.visa) isnt JSON.stringify(@state.filters.visa))
      newFilters = Object.assign({}, @state.filters, {visa: nextProps.storeFilters.filters.visa})
      @setState(
        filters: newFilters
      )

  updateChinaFilterStateOnStoreChange: (nextProps) =>
    if nextProps.storeFilters.filters and (nextProps.storeFilters.filters.china.china isnt @state.filters.china.china)
      newFilters = Object.assign({}, @state.filters, {china: nextProps.storeFilters.filters.china})
      @setState(
        filters: newFilters
      )

  handleResetAllFilters: (_event) =>
    @props.resetFilterGoal()
    @setState(
      filters: @_initialFilters()
      filtersChangedByUser: new Set()
    )
    if @popularFilters.current
      @popularFilters.current.handleResetAllFilters()

  handleResetFilter: (ref) ->
    set = {"#{ref}": {$set: @_initialFilters()[ref]}}
    @setState(filters: update(@state.filters, set))
    if @popularFilters.current
      @popularFilters.current.handleResetFilter(ref)
    @props.resetFilterSuccess(ref)

  handleResetFilterByEvent: (_event, ref) ->
    @handleResetFilter(ref)

  handleChangeFilter: (filterName, filterState, changedByUser = true, isChangedFromPopularFilters = false) ->
    if not changedByUser
      if filterName not in @state.precheckedFilters
        @setState(precheckedFilters: [@state.precheckedFilters..., filterName])
    else
      precheckedFilters = @state.precheckedFilters.filter((filter) -> filter != filterName)
      filtersChangedByUser = @state.filtersChangedByUser
      filtersChangedByUser.add(filterName)
      @setState({
        isChangedByUser: changedByUser
        precheckedFilters: precheckedFilters
        filtersChangedByUser: filtersChangedByUser
      })
      @props.removeHighlightedTicketParams()
    set = {"#{filterName}": {$set: filterState}}
    @setState((prevState) -> filters: update(prevState.filters, set))
    if not isChangedFromPopularFilters and @popularFilters.current
      @popularFilters.current.handleResetFilter(filterName)


  _initialBoundaries: ->
    initialBoundaries = {}
    for filterName, filterComponent of FILTER_COMPONENTS
      initialBoundaries[filterName] = if filterComponent.initialBoundaries
        filterComponent.initialBoundaries()
      else
        {}
    initialBoundaries

  _initialFilters: ->
    initialFilters = {}
    for filterName, filterComponent of FILTER_COMPONENTS
      initialFilters[filterName] = if filterComponent.initialValue then filterComponent.initialValue() else {}
    initialFilters

  # Get list of changed filters
  #
  # @return [Array] list of filters
  _changedFilters: ->
    initialFilters = @_initialFilters()
    changedFilters = []
    for filterName, state of @state.filters
      if FILTER_COMPONENTS[filterName].isChanged
        changedFilters.push(filterName) if FILTER_COMPONENTS[filterName].isChanged(state)
      else if not isEqual(initialFilters[filterName], state)
        changedFilters.push(filterName)
    changedFilters

  _buildFilterFunc: ->
    filtersFunc = []
    for key, state of @state.filters when state and @filterRefs[key]
      filterFunc = if (typeof @filterRefs[key].filterFunc isnt 'function')
        console.warn("Filter '#{key}' must have 'filterFunc' method")
        null
      else
        @filterRefs[key].filterFunc()
      filtersFunc.push(filterFunc) if filterFunc
    # NOTE: Filter func return ticket or null
    # NOTE: Do not use @state below this line
    if filtersFunc.length > 0
      (ticket) ->
        result = ticket
        for filterFunc in filtersFunc
          filteredTicket = filterFunc(result)
          switch filteredTicket
            when true then break # use same result in next filter
            when false then return null
            else result = filteredTicket
        result
    else
      null

  calculateBoundaries: (
    tickets = @props.tickets,
    searchParams = @props.searchParams,
    openedFilters = @props.openedFilters
  ) ->
    initialBoundaries = Object.assign({}, @_initialBoundaries(), @state.boundaries)
    for key of initialBoundaries when (typeof @filterRefs[key]?.reduceFunc isnt 'function')
      console.warn("Filter '#{key}' must have 'reduceFunc' method")

    reduceFunc = (result, ticket) =>
      for filterName, filterResult of result
        isFilterOpened = openedFilters.indexOf(filterName) isnt -1
        isFilterPrechecked = searchParams.precheckedFilters?["filter_#{filterName}"]
        # NOTE: have to calc boundaries for airport filter to precheck airport
        isAirportsFilter = filterName is 'airports'
        isChinaFilter = filterName is 'china'
        if isFilterOpened or isFilterPrechecked or isAirportsFilter or isChinaFilter
          result[filterName] = reduceFuncCache(
            filterName,
            ticket,
            () => @filterRefs[filterName].reduceFunc(filterResult, ticket)
          )
      result

    boundaries = bench("Reduce boundaries from #{tickets.length} tickets", ->
      tickets.reduce(reduceFunc, initialBoundaries)
    )
    for key of initialBoundaries when (searchParams.precheckedFilters?["filter_#{key}"] and
        typeof @filterRefs[key].initialPrecheck is 'function')
      @filterRefs[key].initialPrecheck(searchParams.precheckedFilters?["filter_#{key}"], boundaries[key])
    bench('apply boundaries', => @setState(boundaries: boundaries))

mapStateToProps = (state) ->
  storeFilters: state.filters
  airlines: state.airlines
  airports: state.airports
  gates: state.gates
  tickets: state.tickets
  segments: state.searchParams.segments
  searchParams: state.searchParams
  isTicketsAlreadyRendered: state.searchStatus in ['SHOWN', 'FINISHED', 'EXPIRED']
  openedFilters: state.filters.openedFilters
  isSearchFinished: state.isSearchFinished
  savedFilters: state.savedFilters
  popularFilters: state.popularFilters

mapDispatchToProps = (dispatch) ->
  updateFilters: (data) -> dispatch(updateFilters(data))
  resetFilterSuccess: -> dispatch({type: 'RESET_FILTER_SUCCESS'})
  resetFilterGoal: -> dispatch(reachGoal('RESET_ALL_FILTER_CLICK')),
  removeHighlightedTicketParams: -> dispatch(removeHighlightedTicketParams()),
  reachGoal: (event, data) => dispatch(reachGoal(event, data))

namespaces = [
  'filters',
  'baggage',
  'stops'
]

FiltersComponentBlockElementClassnames = BlockElementClassnames(Filters)
FiltersComponentWithTranslation = withTranslation(namespaces)(FiltersComponentBlockElementClassnames)
FiltersComponent = makeResponsive(FiltersComponentWithTranslation)
FiltersWithConnect = React.createFactory(connect(mapStateToProps, mapDispatchToProps)(FiltersComponent))


export default ErrorBoundary(
  errorType: ErrorType.Critical
  FiltersWithConnect()
)
