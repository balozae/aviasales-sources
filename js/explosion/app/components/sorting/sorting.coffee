import React from 'react'
import PropTypes from 'prop-types'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {div, ul} from 'react-dom-factories'
import {connect} from 'react-redux'
import classNames from 'classnames'
import SortTabComponent from './sort_tab'
import {updateSort} from 'common/js/redux/actions/sort.actions'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'
import TABS from './constants'
import {getSortState, topTicketsPriceInfoSelector} from 'common/js/redux/selectors/sort.selectors'
import './sorting.scss'

SortTab = React.createFactory(SortTabComponent)

class Sorting extends React.Component
  @displayName: 'Sorting'

  @propTypes:
    tickets: PropTypes.array.isRequired
    topTicketsPriceInfo: PropTypes.object.isRequired
    sort: PropTypes.string.isRequired
    isSearchFinished: PropTypes.bool.isRequired

  handleTabClick: (tab) ->
    if tab.key isnt @props.sort
      @props.updateSort(tab.key, tab.goalMessage, search_finished: @props.isSearchFinished)

  hasDirect: ->
    return true for ticket in @props.tickets when ticket[0].is_direct
    false

  render: ->
    hasDirect = @hasDirect()
    div
      className: @blockClassName()
      ul
        className: classNames(
          @elementClassName('tabs')
        )
        for tab in TABS
          SortTab(Object.assign({}, tab, {
            price: @props.topTicketsPriceInfo[tab.key]
            hasDirect,
            tabKey: tab.key
            onClick: @handleTabClick.bind(this, tab)
            isActive: tab.key is @props.sort
          }))

mapDispatchToProps = (dispatch) ->
  updateSort: (sort, event, eventData) ->
    dispatch(updateSort(sort))
    dispatch(reachGoal(event, eventData))

mapStateToProps = (state, props) ->
  isSearchFinished: state.isSearchFinished
  sort: getSortState(state),
  topTicketsPriceInfo: topTicketsPriceInfoSelector(state, props.tickets)

export default connect(mapStateToProps, mapDispatchToProps)(BlockElementClassnames(Sorting))
