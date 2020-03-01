import React from 'react'
import isEqual from 'is_equal'
import PriceComponent from 'react_components/price/price'
import PropTypes from 'prop-types'
import CheckboxesListComponent from './checkboxes_list'
import FilterGroupComponent from './filter_group'
import FilterMetrics from './checkbox_filter_metrics'
import store from 'common/js/redux/store'
import { getStopsFilterName } from './filters.utils'

CheckboxesList = React.createFactory(CheckboxesListComponent)
FilterGroup = React.createFactory(FilterGroupComponent)
Price = React.createFactory(PriceComponent)

EXPENSIVE_STOP_PERCENT = 1.20

class StopsFilter extends React.Component
  @displayName: 'StopsFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    unchecked: PropTypes.object.isRequired
    isTicketsAlreadyRendered: PropTypes.bool
    precheckedFilters: PropTypes.array
    name: PropTypes.string.isRequired
    isAppliedSavedFilters: PropTypes.bool.isRequired

  constructor: (props) ->
    super(props)
    @isPrecheckedByUrlParams = false
    @state = @getInitialState()

  getInitialState: ->
    modifiedByUser: false

  componentWillReceiveProps: (newProps) ->
    isReset = Object.keys(@props.unchecked).length > 0 and
      Object.keys(newProps.unchecked).length is 0
    @setState(modifiedByUser: true) if isReset

  componentDidUpdate: (prevProps) ->
    return if @state.modifiedByUser or not @props.isTicketsAlreadyRendered or @isPrecheckedByUrlParams
    unchecked = @_expensiveStops()
    if not @props.filtersChangedByUser.includes('stops') and not isEqual(@props.unchecked, unchecked) and not @props.isAppliedSavedFilters
      @props.onChange(unchecked, false)

  reduceFunc: (state, [ticket, terms]) ->
    {max_stops} = ticket
    # NOTE: terms are sorted by price, so first term has minimum unified_price
    [{unified_price}] = terms
    state[max_stops] = Math.min(state[max_stops] or Infinity, unified_price)
    state

  filterFunc: ->
    if Object.keys(@props.unchecked).length > 0
      # NOTE: do not use @props by reference here
      unchecked = @props.unchecked
      ([ticket, _terms]) -> ticket.max_stops not of unchecked
    else
      null

  initialPrecheck: (checked, boundaries) ->
    unchecked = {}
    @isPrecheckedByUrlParams = true if checked and not @isPrecheckedByUrlParams
    for k of boundaries when k not in checked
      unchecked[k] = true
    @props.onChange(unchecked, false)

  render: ->
    FilterGroup(
      className: '--stops'
      label: @props.t('filters:titles.stops')
      modified: Object.keys(@props.unchecked).length > 0
      initialOpened: true
      metricsName: 'STOPS'
      onReset: @props.onReset
      name: @props.name
      CheckboxesList(
        onChange: @handleChange
        prefix: 'stops'
        unchecked: @props.unchecked
        items: for key, price of @props.boundaries
          key: key
          label: getStopsFilterName(key)
          extra: Price(valueInRubles: price)
      )
    )

  handleChange: (unchecked, changes) =>
    @setState(modifiedByUser: true) unless @state.modifiedByUser
    @metricsSend('STOPS', changes, (value) -> +value)
    @props.onChange(unchecked)

  # NOTE: Пересадка считается невыгодной если билет дороже прямого на EXPENSIVE_STOP_PERCENT
  _expensiveStops: ->
    res = {}
    return res unless @props.boundaries[0]
    for key, price of @props.boundaries when key isnt '0'
      if @props.boundaries[0] * EXPENSIVE_STOP_PERCENT < price
        res[key] = true
    res

export default FilterMetrics(StopsFilter)
