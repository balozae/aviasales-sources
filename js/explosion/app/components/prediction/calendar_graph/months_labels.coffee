import React from 'react'
import PropTypes from 'prop-types'
import {div, span} from 'react-dom-factories'
import classNames from 'classnames'
import {daysInMonth, addMonths, addYears, isLeap} from 'finity-js'
import PriceComponent from 'react_components/price/price'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import './months_labels.scss'

Price = React.createFactory(PriceComponent)

class MonthsLabels extends React.Component
  @displayName: 'MonthsLabels'

  @propTypes:
    t: PropTypes.func.isRequired
    rectWidth: PropTypes.number.isRequired
    data: PropTypes.array.isRequired
    beginningOfPeriod: PropTypes.instanceOf(Date).isRequired
    offsetX: PropTypes.number.isRequired

  render: ->
    step = @props.rectWidth + 1
    min = 0
    labels = @_presentLabels()
    (min = Math.min(min or Infinity, price) if price) for {price} in labels
    div(
      className: @blockClassName()
      div(
        className: @elementClassName('wrap')
        style: transform: "translateX(#{@props.offsetX}px)"
        for {from, to, title, price}, i in labels
          showTitle = to - from > 25
          div(
            className: classNames(
              @elementClassName('item')
              '--good': min and price <= min
              '--bad': min and price > min
              '--unknown': not price or not min
            )
            key: i
            style:
              transform: "translateX(#{from * step - 1}px)"
              width: "#{(to - from) * step - 1}px"
            if showTitle
              div(
                className: @elementClassName('item-text')
                title
                span(
                  className: @elementClassName('item-price')
                  ' — '
                  if price
                    Price(valueInRubles: price)
                  else
                    @props.t('prediction:noPrices')
                )
              )
            else
              []
          )
      )
    )

  _presentLabels: (s) ->
    startMonth = @props.beginningOfPeriod.getMonth()
    from = daysInMonth(@props.beginningOfPeriod) - @props.beginningOfPeriod.getDate() + 1
    months = @props.t('common:dateTime', {returnObjects: true}).months
    prices = @_getMonthesMinPrice()
    labels = [from: 0, to: from, title: months[startMonth], price: prices[0]]
    days = if isLeap(addYears(@props.beginningOfPeriod, 1)) then 366 else 365
    for i in [1..11]
      date = addMonths(@props.beginningOfPeriod, i)
      to = from + daysInMonth(date)
      labels.push({price: prices[i], from, to, title: months[date.getMonth()]})
      from = to
    labels.push({price: prices[prices.length - 1], from, to: days, title: months[startMonth]})
    labels

  _getMonthesMinPrice: ->
    months = []
    currentMonth = @props.beginningOfPeriod.getMonth()
    i = 0
    for {departDate, value} in @props.data
      if currentMonth isnt departDate.getMonth()
        months[i] = 0 unless months[i]
        i++
        currentMonth = departDate.getMonth()
      months[i] = Math.min(months[i] or Infinity, value) if value
    months

export default BlockElementClassnames(MonthsLabels)
