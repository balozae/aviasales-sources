import React from 'react'
import {connect} from 'react-redux'
import {div} from 'react-dom-factories'
import StatelessElementClassnames from 'react_components/mixins/stateless_element_classnames'
import classNames from 'classnames'
import {hideFilters} from 'common/js/redux/actions/filters.actions'
import {hideBlackOverlay} from 'common/js/redux/actions/is_black_overlay_shown.actions'
import './black_overlay.scss'

BlackOverlay = (props) ->
  div
    onClick: props.hideFilters
    className: classNames(
      @blockClassName()
      'js-black-overlay'
      'is-shown': props.isFiltersShown
    )

BlackOverlay.displayName = 'BlackOverlay'

mapStateToProps = (state) ->
  {
    isFiltersShown: state.isFiltersShown
    isBlackOverlayShown: state.isBlackOverlayShown
  }

mapDispatchToProps = (dispatch) ->
  {
    hideFilters: ->
      dispatch(hideFilters())
      dispatch(hideBlackOverlay())
  }

export default connect(mapStateToProps, mapDispatchToProps)(new StatelessElementClassnames(BlackOverlay))
