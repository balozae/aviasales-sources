import React from 'react'
import PropTypes from 'prop-types'
import CheckboxesListComponent from './checkboxes_list'
import FilterGroupComponent from './filter_group'
import PriceComponent from 'react_components/price/price'
import FilterMetrics from './checkbox_filter_metrics'
import omit from 'omit'

Price = React.createFactory(PriceComponent)
CheckboxesList = React.createFactory(CheckboxesListComponent)
FilterGroup = React.createFactory(FilterGroupComponent)

class PaymentMethodsFilter extends React.Component
  @displayName: 'PaymentMethodsFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    unchecked: PropTypes.object.isRequired
    gatesInfo: PropTypes.object.isRequired
    defaultPaymentMethods: PropTypes.array
    name: PropTypes.string.isRequired

  @defaultProps:
    defaultPaymentMethods: ['card']

  reduceFunc: (state, [_ticket, gates]) =>
    for {gate_id, unified_price} in gates
      methods = @props.gatesInfo[gate_id]?.payment_methods or @props.defaultPaymentMethods
      for method in methods
        state[method] = Math.min(state[method] or Infinity, unified_price)
    state

  filterFunc: =>
    if Object.keys(@props.unchecked).length > 0
      selectedMethods = omit(@props.boundaries, Object.keys(@props.unchecked))
      {gatesInfo, defaultPaymentMethods} = @props
      # NOTE: do not use @props by reference here
      ([ticket, terms]) ->
        new_terms = []
        for term in terms
          paymentMethods = gatesInfo[term.gate_id]?.payment_methods or defaultPaymentMethods
          for method in paymentMethods when method of selectedMethods
            new_terms.push(term)
            break
        if new_terms.length > 0
          [ticket, new_terms]
        else
          false
    else
      null

  handleChange: (unchecked, changes) =>
    @metricsSend('PAYMENT_METHODS', changes, (value) -> value)
    @props.onChange(unchecked)

  render: ->
    methodsCount = Object.keys(@props.boundaries).length
    FilterGroup(
      className: '--payment_methods'
      label: @props.t('filters:titles.paymentMethods')
      filterCount: methodsCount
      uncheckedCount: Object.keys(@props.unchecked).length
      metricsName: 'PAYMENT_METHODS'
      onReset: @props.onReset
      name: @props.name
      if methodsCount
        CheckboxesList(
          prefix: 'payment_methods'
          onChange: @handleChange
          unchecked: @props.unchecked or {}
          items: for key, price of @props.boundaries
            key: key
            label: @props.t('payment:types.' + key) or key
            extra: Price(valueInRubles: price)
        )
    )

export default FilterMetrics(PaymentMethodsFilter)
