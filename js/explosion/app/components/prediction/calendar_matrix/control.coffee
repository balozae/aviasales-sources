import React from 'react'
import PropTypes from 'prop-types'
import {div, button, span} from 'react-dom-factories'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import {addDays} from 'finity-js'
import './control.scss'

class CalendarMatrixControl extends React.Component
  @displayName: 'CalendarMatrixControl'

  @propTypes:
    label: PropTypes.string.isRequired
    type: PropTypes.string.isRequired
    onClick: PropTypes.func
    departDateStart: PropTypes.object.isRequired
    returnDateStart: PropTypes.object
    daysInRow: PropTypes.number

  @defaultProps: onClick: ->

  constructor: (props) ->
    super(props)
    @state =
      isDisabled: false
      isDepartLimited: false
      isReturnLimited: false

  componentWillReceiveProps: (props) ->
    today = addDays(new Date().setHours(0, 0, 0, 0), Math.floor(Math.abs((@props.daysInRow - 1) / 2)))
    @setState({
      isDisabled: props.returnDateStart and props.departDateStart >= props.returnDateStart
      isDepartLimited: props.departDateStart <= today
      isReturnLimited: props.returnDateStart and props.returnDateStart <= today
    })

  render: ->
    div
      className: @elementClassName("#{@props.type}-controls")
      button
        className: @elementClassName('prev-control')
        disabled: @isPrevDisabled()
        onClick: @handleClick.bind(this, 'prev')
      button
        className: @elementClassName('next-control')
        disabled: @isNextDisabled()
        onClick: @handleClick.bind(this, 'next')
      span
        className: @elementClassName('control-label')
        @props.label

  handleClick: (direction) ->
    @props.onClick(direction)

  isPrevDisabled: ->
    {
      'depart': @state.isDepartLimited
      'return': @state.isDisabled or @state.isReturnLimited
    }[@props.type]

  isNextDisabled: ->
    {
      'depart': @state.isDisabled
      'return': false
    }[@props.type]

export default BlockElementClassnames(CalendarMatrixControl)
