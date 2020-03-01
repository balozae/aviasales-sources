import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import classNames from 'classnames'
import Tumbler from 'react_components/tumbler/tumbler'
import {matrixPickPrice} from './price_utils'
import {eachPrice} from '../price_utils'
import {connect} from 'react-redux'
import {updateMatrixOnlyDirect} from 'common/js/redux/actions/prediction.actions'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'

TUMBLER =
  DEFAULT: {}
  ENABLE_CHEAP_DIRECT: {tumblerTitle: 'cheapDirect', isOnlyDirect: true}
  NO_DIRECT: {tumblerTitle: 'noDirect'}
  DISABLE_NO_DIRECT: {tumblerTitle: 'noDirect', isOnlyDirect: false}
  CHEAP_DIRECT: {tumblerTitle: 'cheapDirect'}

_dateHasCheapChanges = (datePrices) ->
  price = matrixPickPrice(datePrices, false)
  return false unless price
  price.number_of_changes isnt 0

hasCheapChanges = (prices) ->
  for _departDate, departDatePrices of prices
    if Array.isArray(departDatePrices)
      return true if _dateHasCheapChanges(departDatePrices)
    else
      for _returnDate, prices of departDatePrices when _dateHasCheapChanges(prices)
        return true
  false

hasDirectFlights = (prices) ->
  result = false
  eachPrice(prices, ({number_of_changes}) ->
    if number_of_changes is 0
      result = true
      return false
  )
  result

class DirectFlightsTumbler extends React.Component
  @displayName: 'DirectFlightsTumbler'
  @propTypes:
    t: PropTypes.func.isRequired
    prices: PropTypes.object
    isOnlyDirect: PropTypes.bool.isRequired
    updateMatrixOnlyDirect: PropTypes.func.isRequired
    className: PropTypes.string
    titleClassName: PropTypes.string

  constructor: (props) ->
    super(props)
    @state = forced: false

  render: ->
    {disableTumbler = false, isOnlyDirect = undefined, tumblerTitle = ''} = @getTumblerState()
    isOnlyDirect = @props.isOnlyDirect if @state.forced or isOnlyDirect is undefined
    Tumbler
      className: @props.className
      value: isOnlyDirect
      disabled: disableTumbler
      name: 'only-direct'
      onChange: @handleChange
      label: @props.t('prediction:directFlightsTumbler')
      if tumblerTitle
        div
          className: classNames(
            'tooltip',
            '--bottom',
            '--on-hover',
            @props.titleClassName
          )
          @props.t("prediction:#{tumblerTitle}")

  handleChange: (res) =>
    @setState(forced: true)
    @props.updateMatrixOnlyDirect(res)

  getTumblerState: ->
    hasCheapChangesPrices = hasCheapChanges(@props.prices)
    hasDirect = hasDirectFlights(@props.prices)
    return TUMBLER.DEFAULT if hasDirect and hasCheapChangesPrices
    if @state.forced
      return TUMBLER.NO_DIRECT unless hasDirect
      return TUMBLER.CHEAP_DIRECT if hasDirect and not hasCheapChangesPrices
    else
      return TUMBLER.DISABLE_NO_DIRECT unless hasDirect
      return TUMBLER.ENABLE_CHEAP_DIRECT if hasDirect and not hasCheapChangesPrices
    TUMBLER.DEFAULT

mapStateToProps = (state) ->
  {prices, isOnlyDirect} = state.prediction.matrix
  {prices, isOnlyDirect}

mapDispatchToProps = (dispatch) ->
  updateMatrixOnlyDirect: (isOnlyDirect) ->
    dispatch(updateMatrixOnlyDirect(isOnlyDirect))
    dispatch(reachGoal('PREDICTION_PRICE_MATRIX_ONLY_DIRECT_CHANGE', isOnlyDirect: isOnlyDirect))

export default connect(mapStateToProps, mapDispatchToProps)(DirectFlightsTumbler)
