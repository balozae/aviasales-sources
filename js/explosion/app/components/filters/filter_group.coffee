import ReactDOM from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { openFilter, closeFilter } from 'common/js/redux/actions/filters.actions'
import {div, h1, span} from 'react-dom-factories'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import viewport from 'browser-viewport'
import TooltipComponent from 'components/tooltip'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'
import { withTranslation } from 'react-i18next'

SCROLL_DURATION = 300
HIGHLIGHT_ANIMATION_DURATION = 4500

Tooltip = React.createFactory(TooltipComponent)

class FilterGroup extends React.Component
  @displayName: 'FilterGroup'

  @propTypes:
    className: PropTypes.string
    label: PropTypes.oneOfType([
      PropTypes.string
      PropTypes.object
    ])
    filterCount: PropTypes.number
    uncheckedCount: PropTypes.number
    initialOpened: PropTypes.bool
    modified: PropTypes.bool
    metricsName: PropTypes.string.isRequired
    show: PropTypes.bool
    onReset: PropTypes.func.isRequired

  @defaultProps:
    uncheckedCount: 0
    initialOpened: false
    show: true
    openedFilters: []

  constructor: (props) ->
    super(props)
    @state = {highlighted: false}

  componentDidMount: ->
    if @props.initialOpened
      @props.openFilter(@props.name)

  componentWillReceiveProps: (nextProps) ->
    if not @props.expandFilter and
        nextProps.expandFilter and
        nextProps.expandFilter is @props.name
      @highlight()

  toggleFilter: =>
    @props.reachGoal("#{@props.metricsName}_FILTER_TOGGLE", opened: not @isOpened())
    if not @isOpened()
      @props.openFilter(@props.name)
    else
      @props.closeFilter(@props.name)

  isOpened: ->
    @props.openedFilters.indexOf(@props.name) isnt -1

  resetFilter: (e) =>
    e.stopPropagation()
    @props.reachGoal("#{@props.metricsName}_FILTER_RESET")
    @props.onReset()

  _getFilterCount: ->
    if @props.filterCount and @props.uncheckedCount
      "#{@props.filterCount - @props.uncheckedCount} / #{@props.filterCount}"
    else if @props.filterCount
      @props.filterCount
    else
      ''

  highlight: ->
    el = ReactDOM.findDOMNode(this)
    viewport.scrollTo(el, SCROLL_DURATION) if el
    @props.openFilter(@props.name)
    @setState(highlighted: true)
    setTimeout((=> @setState(highlighted: false)), HIGHLIGHT_ANIMATION_DURATION)
    @props.expandFilterSuccess()

  render: ->
    div
      className: classNames(
        'filters__item filter',
        @props.className,
        'is-opened': @isOpened()
        'is-highlighted': @state.highlighted
        'is-changed': if typeof @props.modified is 'undefined' then @props.uncheckedCount else @props.modified
        'is-hidden': not @props.show
      )
      div
        className: 'filter__header'
        onClick: @toggleFilter
        @props.label
        span
          className: 'filter__count'
          @_getFilterCount()
        div
          className: 'filter__reset'
          onClick: @resetFilter
          Tooltip
            tooltip: React.createFactory(=>
              div(className: 'filter__tooltip', @.props.t('filters:resetFilters'))
            )
            wrapperClassName: 'filter__reset-button reset-button'
            fixPosition:
              top: -5

      if @isOpened()
        div
          className: 'filter__content'
          @props.children
      else
        []


mapStateToProps = (state) ->
  openedFilters: state.filters.openedFilters
  expandFilter: state.filters.expandFilter

mapDispatchToProps = (dispatch) ->
  expandFilterSuccess: -> dispatch({type: 'EXPAND_FILTER_SUCCESS'})
  openFilter: (name) -> dispatch(openFilter(name))
  closeFilter: (name) -> dispatch(closeFilter(name))
  reachGoal: (name, data) -> dispatch(reachGoal(name, data))

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('filters')(FilterGroup))
