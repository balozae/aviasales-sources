import React from 'react'
import PropTypes from 'prop-types'
import {div, span, input} from 'react-dom-factories'
import classNames from 'classnames'
import {UNSAFE_reachGoal} from 'common/js/redux/actions/DEPRECATED_metrics.actions'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import './duration_input.scss'

class DurationInput extends React.Component
  @displayName: 'DurationInput'

  @propTypes:
    t: PropTypes.func.isRequired
    value: PropTypes.number.isRequired
    onChange: PropTypes.func.isRequired
    maxValue: PropTypes.number

  @defaultProps: maxValue: 365

  constructor: (props) ->
    super(props)
    @state = @getInitialState()

  getInitialState: ->
    focus: false
    value: @props.value

  componentWillReceiveProps: (nextProps) ->
    @setState(value: nextProps.value) unless @state.focus

  render: ->
    inputTextValue = if @state.focus
      @state.value
    else if @state.value
      @props.t('prediction:forSomeDays', {count: @state.value})
    else
      @props.t('prediction:sameDay')
    div(
      className: @blockClassName()
      span(
        className: classNames(
          @elementClassName('button --dec'),
          'is-disabled': @props.value <= 0
        )
        onClick: @_handleButton.bind(this, -1)
      )
      input(
        ref: (input) => @input = input
        className: @elementClassName('input')
        onFocus: @_handleFocus
        onBlur: @_handleBlur
        value: inputTextValue
        onChange: @_handleChange
        onKeyPress: @_handleKeyPress
      )
      span(
        className: classNames(
          @elementClassName('button --inc'),
          'is-disabled': @props.value > @props.maxValue
        )
        onClick: @_handleButton.bind(this, 1)
      )
    )

  _handleFocus: =>
    @setState(focus: true)
    setTimeout(=>
      @input?.setSelectionRange(0, 9999)
    , 100)

  _handleBlur: =>
    @_submit(@state.value)

  _submit: (value) ->
    return if value is +@props.value
    UNSAFE_reachGoal('PREDICTION_INPUT_VALUE_CHANGE', {value: value, oldValue: @props.value})
    if 0 <= value <= @props.maxValue
      @props.onChange(value)
    else if value > @props.maxValue
      @_setValue(@props.maxValue)
    else
      @_setValue(@props.value)
    @setState(focus: false)

  _handleKeyPress: ({key}) =>
    @_submit(@state.value) if key is 'Enter'

  _handleChange: ({target}) =>
    if +target.value >= 0
      @_setValue(target.value)
    else
      @_setValue('')

  _handleButton: (value) ->
    UNSAFE_reachGoal('PREDICTION_DURATION_CHANGE', {delta: value})
    newValue = @state.value + value
    if 0 <= newValue <= @props.maxValue
      @_submit(newValue)
      @_setValue(newValue)

  _setValue: (value) ->
    value = +value
    if 0 <= value
      @setState(value: value)
    else
      @setState(value: '')

export default BlockElementClassnames(DurationInput)
