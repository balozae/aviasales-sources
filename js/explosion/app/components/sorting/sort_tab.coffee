import React from 'react'
import PropTypes from 'prop-types'
import {li, span} from 'react-dom-factories'
import {withTranslation, Trans} from 'react-i18next'
import PriceComponent from 'react_components/price/price'
import classNames from 'classnames'

Price = React.createFactory(PriceComponent)

getTitleKey = ({title, tabKey}, hasDirect) ->
  switch tabKey
    when 'duration' then (if hasDirect then title[0] else title[1])
    else title[0]

SortTab = (props) ->
  components = [
    span
      key: 'sorting__title'
      className: 'sorting__title-wrap',
  ]
  if props.price
    components.push(Price(
      key: 'sorting__price',
      valueInRubles: props.price.unified_price,
      originalValue: props.price.price,
      originalCurrency: props.price.currency
    ))

  li
    className: classNames(
      'sorting__tab'
      'is-active': props.isActive
    )
    onClick: props.onClick
    Trans
      i18nKey: getTitleKey(props, props.hasDirect)
      ns: 'tickets_sorting'
      components: components

SortTab.propTypes =
  pirce: PropTypes.number
  title: PropTypes.array.isRequired
  tabKey: PropTypes.string.isRequired
  onClick: PropTypes.func.isRequired
  isActive: PropTypes.bool.isRequired
  hasDirect: PropTypes.bool.isRequired

export default withTranslation('tickets_sorting')(SortTab)
