import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {span, a, div, button, br} from 'react-dom-factories'
import {withTranslation, Trans} from 'react-i18next'
import {resetFilters, resetFilter, updateFilter, expandFilter} from 'redux/actions/filters.actions'
import filterLabels from './filter_labels'
import {UNSAFE_reachGoal} from 'common/js/redux/actions/DEPRECATED_metrics.actions'
import clssnms from 'clssnms'
import './filter_message.scss'

cn = clssnms('filter-message')

getAdditionalLinks = (changedFilters) ->
  additionalLinks = for filter in changedFilters
    ref: filter
    textKey: filterLabels[filter]
  additionalLinks

handleRelaxFiltersClicked = (resetFilters) ->
  UNSAFE_reachGoal('SYSTEM_MESSAGE_TRIGGER_CLICK', event: 'reset_filters')
  resetFilters()

handleTriggerFilterClicked = (e, filter, expandFilter) ->
  e.preventDefault()
  UNSAFE_reachGoal('ALL_TICKETS_FILTERED_FILTER_EXPAND', {filter})
  expandFilter(filter)

handleResetFilterClicked = (e, filter, resetFilter) ->
  e.preventDefault()
  UNSAFE_reachGoal('ALL_TICKETS_FILTERED_RESET_ALL', {filter})
  resetFilter(filter)

formatAmount = (amount) ->
  amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

renderFilterLink = (link, props) ->
  t = props.t
  span
    key: link.ref
    className: cn('links-item')
    a
      onClick: (e) -> handleTriggerFilterClicked(e, link.ref, props.expandFilter)
      href: '#'
      className: 'js-trigger-filter'
      t("filters:titles.#{link.textKey}")
    a
      onClick: (e) -> handleResetFilterClicked(e, link.ref, props.resetFilter)
      href: '#'
      className: 'js-reset-filter'
      div
        className: 'reset-button'

renderCodeShareLink = (props) ->
  a
    onClick: (e) ->
      e.preventDefault()
      props.turnOnCodeshare()
    href: '#'

FilterMessage = (props) ->
  return null unless props.changedFilters and props.changedFilters.length
  flightsAmountFormatted = formatAmount(props.tickets.length)
  additionalLinks = getAdditionalLinks(props.changedFilters)
  t = props.t
  div
    className: cn()
    div
      className: cn('container')
      div
        className: cn('icon')
      div
        className: cn('title')
        t('filter_message:title', {flightsAmountFormatted: flightsAmountFormatted, flightsAmount: props.tickets.length})
      if not props.isFilterCodeshareIncluded and 'airlines' in props.changedFilters
        div
          className: cn('description')
          Trans
            i18nKey: 'sharedFlightsDescription'
            ns: 'filter_message'
            components: [renderCodeShareLink.call(this, props)]
      div
        className: cn('description')
        t('filter_message:relaxDescription')
      div
        className: cn('links-list')
        for link in additionalLinks
          renderFilterLink.call(this, link, props)
      button
        onClick: -> handleRelaxFiltersClicked(props.resetFilters)
        className: cn('preroll-trigger')
        t('filter_message:relaxFilters')

mapStateToProps = (state) ->
  {
    changedFilters: state.filters.changedFilters
    tickets: state.tickets
    isFilterCodeshareIncluded: state.filters?.filters?.airlines?.isCodeshareIncluded
  }

mapDispatchToProps = (dispatch) ->
  {
    resetFilters: ->
      dispatch(resetFilters())
    resetFilter: (filter) ->
      dispatch(resetFilter(filter))
    turnOnCodeshare: ->
      dispatch(updateFilter({filterName: 'airlines', filterField: 'isCodeshareIncluded', filterValue: true}))
    expandFilter: (filter) ->
      dispatch(expandFilter(filter))
  }

FilterMessage.displayName = 'FilterMessage'

FilterMessage.propTypes =
  resetFilters: PropTypes.func.isRequired
  resetFilter: PropTypes.func.isRequired
  expandFilter: PropTypes.func.isRequired
  changedFilters: PropTypes.array
  tickets: PropTypes.array.isRequired
  isFilterCodeshareIncluded: PropTypes.bool

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['filter_message', 'filters'])(FilterMessage))
