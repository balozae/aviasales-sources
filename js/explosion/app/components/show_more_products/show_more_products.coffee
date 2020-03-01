import React from 'react'
import PropTypes from 'prop-types'
import {div, button} from 'react-dom-factories'
import utils from 'utils'
import {withTranslation} from 'react-i18next'
import classNames from 'classnames'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import './show_more_products.scss'
import {UNSAFE_reachGoal} from 'common/js/redux/actions/DEPRECATED_metrics.actions'

class ShowMoreProducts extends React.Component
  @displayName: 'ShowMoreProducts'

  constructor: (props) ->
    super(props)

  @propTypes:
    productsAmount: PropTypes.number
    visibleProductsAmount: PropTypes.number
    productsPerPage: PropTypes.number
    onClick: PropTypes.func

  handleClick: =>
    UNSAFE_reachGoal('SHOW_MORE_BUTTON')
    @props.onClick()

  getTicketsCount: =>
    if @props.visibleProductsAmount + @props.productsPerPage > @props.productsAmount
      @props.productsAmount - @props.visibleProductsAmount
    else
      @props.productsPerPage

  render: ->
    t = this.props.t
    ticketsCount = @getTicketsCount()
    div
      className: @blockClassName()
      button
        className: classNames(@elementClassName('button'), 'blue-button')
        onClick: @handleClick
        t('common:showMoreProducts', {ticketsCount})

export default withTranslation('common')(BlockElementClassnames(ShowMoreProducts))
