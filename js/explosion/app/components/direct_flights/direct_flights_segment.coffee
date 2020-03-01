import React from 'react'
import {div, ul, li, span, h4} from 'react-dom-factories'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import PriceComponent from 'react_components/price/price'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {format, isEqualDates} from 'finity-js'
import { dateToLowerCase } from 'shared_components/l10n/l10n'

Price = React.createFactory(PriceComponent)

class DirectFlightsSegment extends React.Component
  @displayName: 'DirectFlights'

  @propTypes:
    days: PropTypes.array
    selectedDay: PropTypes.instanceOf(Date).isRequired
    title: PropTypes.string
    tripType: PropTypes.string
    onDayClick: PropTypes.func
    t: PropTypes.func #NOTE: translation fn

  render: ->
    return null unless @props.days
    locale = @props.t('common:dateTime', {returnObjects: true})
    div
      className: @elementClassName('segment')
      h4
        className: @elementClassName('segment-title')
        @props.title
      ul
        className: @elementClassName('flights')
        @props.days.map ({date, isDirect, price, isDisabled}) =>
          li
            className: classNames(
              @elementClassName('flight')
              'is-selected': isEqualDates(date, @props.selectedDay)
              '--no-price': not price
              '--no-direct': not (isDirect or price)
              'is-disabled': isDisabled
            )
            onClick: => @props.onDayClick(date)
            key: "flight-#{date}"
            span
              className: @elementClassName('date')
              dateToLowerCase(format(date, 'D MMM', null, locale))
            span
              className: @elementClassName('price')
              if not isDisabled
                if isDirect or price
                  if @props.tripType is 'multiway'
                    null
                  else if price
                    Price
                      valueInRubles: price
                  else
                    @props.t('direct_flights:checkPrice')
                else
                  @props.t('direct_flights:noFlights')

export default BlockElementClassnames(DirectFlightsSegment)
