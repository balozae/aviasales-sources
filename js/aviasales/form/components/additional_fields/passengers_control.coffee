import React, {Component} from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'
import clssnms from 'clssnms'
import TooltipComponent from 'components/tooltip'
import GoalKeeper from 'goalkeeper/goalkeeper'
import {div, a, span, small, strong, svg, path, select, option} from 'react-dom-factories'
import { withTranslation } from 'react-i18next'

Tooltip = React.createFactory TooltipComponent
classNames = clssnms('additional-fields')

ACTION_MAP =
  inc:
    delta: 1
    event: 'Plus'
  dec:
    delta: -1
    event: 'Minus'

HOTEL_CHILDREN_AGE_RANGE = [0..17]

class PassengersControl extends Component
  @propTypes:
    adults: PropTypes.number.isRequired
    children: PropTypes.number.isRequired
    onChange: PropTypes.func.isRequired
    eventCategory: PropTypes.oneOf(['avia_form', 'multiwayForm', 'hotel']).isRequired
    childrenAge: PropTypes.array
    isHotel: PropTypes.bool
    infants: PropTypes.number

  passengers:
    avia:
      adults:
        min: ({adults, children, infants}) ->
          Math.max(1, infants)
        max: ({adults, children, infants}) ->
          9 - children - infants
      children:
        min: -> 0
        max: ({adults, children, infants}) ->
          Math.min(9 - adults - infants, 8)
      infants:
        min: -> 0
        max: ({adults, children, infants}) ->
          Math.min(9 - adults - children, adults, 4)
    hotel:
      adults:
        min: -> 1
        max: -> 4
      children:
        min: -> 0
        max: -> 3

  constructor: (props) ->
    super(props)
    @state =
      hoveredControls:
        adults:
          inc: false
          dec: false
        children:
          inc: false
          dec: false
        infants:
          inc: false
          dec: false

  getBoundaries: (passengerType) ->
    formType = if @props.isHotel then 'hotel' else 'avia'
    min: @passengers[formType][passengerType].min(@props)
    max: @passengers[formType][passengerType].max(@props)

  shouldShowWarning: (passengerType, actionType) ->
    {min, max} = @getBoundaries(passengerType)
    value = @props[passengerType]
    switch passengerType
      when 'adults'
        switch actionType
          when 'dec' then value is min and value isnt 1
          else false
      when 'infants'
        switch actionType
          when 'inc' then value is max and @props.adults < 4
          else false
      else false

  isDisabled: (passengerType, actionType) ->
    {min, max} = @getBoundaries(passengerType)
    value = @props[passengerType]
    switch actionType
      when 'dec' then value is min
      when 'inc' then value is max

  handleClick: (type, actionType) ->
    unless @isDisabled(type, actionType)
      {delta, event} = ACTION_MAP[actionType]
      @props.onChange(type, @props[type] + delta)
      GoalKeeper.triggerEvent(@props.eventCategory, "#{type}#{event}", 'click')

  handleMouseEnter: (passengerType, actionType) ->
    @setState(hoveredControls: update(@state.hoveredControls, "#{passengerType}": "#{actionType}": $set: true))

  handleMouseLeave: (passengerType, actionType) ->
    @setState(hoveredControls: update(@state.hoveredControls, "#{passengerType}": "#{actionType}": $set: false))

  handleChildrenAgeChange: (index, {target}) ->
    @props.onChildrenAgeChange(index, target.value)

  isHovered: (passengerType, actionType) ->
    @state.hoveredControls[passengerType][actionType]

  getText: (passengerType) ->
    formType = if @props.isHotel then 'hotelForm' else 'aviaForm'
    return {
      title: @props.t("additional_form_fields:ages.#{passengerType}", '')
      subtitle: @props.t("additional_form_fields:agesSubscription.#{formType}.#{passengerType}", '')
    }

  render: ->
    div
      className: classNames('passengers-wrap')
      @renderRow('adults')
      @renderRow('children')
      @renderRow('infants') unless @props.isHotel
      if @props.isHotel and @props.childrenAge?.length
        @renderChildrenAgeControl()

  renderRow: (type) ->
    {title, subtitle} = @getText(type)
    div
      className: classNames('passenger-row')
      div
        className: classNames('passenger-title')
        strong(null, title)
        small(null, subtitle) if subtitle
      div
        className: classNames('passenger-control-wrap')
        @renderControl(type, 'dec')
        span
          className: classNames('passenger-value')
          @props[type]
        @renderControl(type, 'inc')

  renderControl: (type, actionType) ->
    {delta} = ACTION_MAP[actionType]
    Tooltip
      tooltip: React.createFactory => @renderTooltip(type)
      isVisible: @shouldShowWarning(type, actionType) and @isHovered(type, actionType)
      showByProps: true
      position: 'left'
      a
        className: classNames('passenger-control',
          '--increment': actionType is 'inc'
          '--decrement': actionType is 'dec'
          '--is-disabled': @isDisabled(type, actionType)
        )
        onClick: @handleClick.bind(this, type, actionType)
        onMouseEnter: @handleMouseEnter.bind(this, type, actionType)
        onMouseLeave: @handleMouseLeave.bind(this, type, actionType)
        if actionType is 'dec'
          svg({width: '8', height: '2', viewBox: '0 0 8 2', xmlns: 'http://www.w3.org/2000/svg'},
            path({d: 'M0 0h8v2H0z', fill: '#FFF', fillRule: 'evenodd'}, null)
          )
        else
          svg({width: '8', height: '8', viewBox: '0 0 8 8', xmlns: 'http://www.w3.org/2000/svg'},
            path({d: 'M5 3h3v2H5v3H3V5H0V3h3V0h2v3z', fill: '#FFF', fillRule: 'evenodd'}, null)
          )

  renderTooltip: () ->
    warning = @props.t('additional_form_fields:infantsWarning')
    return null unless warning
    div(className: classNames('warning-tooltip'), warning)

  renderChildrenAgeControl: ->
    div
      className: classNames('children-age-wrap')
      for age, key in @props.childrenAge
        div
          className: classNames('children-age-row')
          key: key
          strong
            className: classNames('children-age-title')
            @props.t('hotels_form:childrenAge')
          div
            className: classNames('children-age-control')
            select
              className: classNames('children-age-select')
              value: age
              onChange: @handleChildrenAgeChange.bind(this, key)
              for value, optionKey in HOTEL_CHILDREN_AGE_RANGE
                option
                  key: optionKey
                  value: value
                  @props.t('additional_form_fields:age', { age: value})

export default withTranslation(['avia_form', 'hotels_form', 'additional_form_fields'])(PassengersControl)
