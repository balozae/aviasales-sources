import React from 'react'
import PropTypes from 'prop-types'
import FilterMetrics from './checkbox_filter_metrics'
import FilterGroupComponent from './filter_group'
import CheckboxesListComponent from './checkboxes_list'
import PriceComponent from 'react_components/price/price'
import { UNKNOWN, NO_BAGS } from 'shared_components/types/tariffs'

Price = React.createFactory(PriceComponent)
CheckboxesList = React.createFactory(CheckboxesListComponent)
FilterGroup = React.createFactory(FilterGroupComponent)

ORDER =
  full_baggage: 0
  no_baggage: 1
  no_handbags: 2

# NOTE: Считаем багаж неизвестным, если нет информации ни о багаже, ни о ручной клади
bagsKey = (bags) ->
  if bags.baggage.code is NO_BAGS
    'no_baggage'
  else if bags.handbags.code is NO_BAGS
    'no_handbags'
  else if bags.baggage.code isnt UNKNOWN and bags.handbags.code isnt UNKNOWN
    'full_baggage'

class BaggageFilter extends React.Component
  @displayName: 'BaggageFilter'
  @propTypes:
    boundaries: PropTypes.object.isRequired
    unchecked: PropTypes.object.isRequired
    airlines: PropTypes.object
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    onReset: PropTypes.func.isRequired
    name: PropTypes.string.isRequired

  reduceFunc: (result, [ticket, terms]) ->
    ticketKeys = {}
    for proposal in terms
      bagKey = bagsKey(proposal.worstBags)
      if bagKey isnt undefined
        ticketKeys[bagKey] = Math.min(ticketKeys[bagKey] or Infinity, proposal.unified_price)
    # TODO: precheck
    for key, price of ticketKeys
      result[key] = Math.min(result[key] or Infinity, price)
    result

  filterFunc: =>
    if Object.keys(@props.unchecked).length > 0
      unchecked = @props.unchecked
      airlines = @props.airlines
      # NOTE: do not use @props below this line
      ([ticket, terms]) ->
        newTerms = terms.filter((term) ->
          bagKey = bagsKey(term.worstBags)
          if bagKey isnt undefined
            bagKey not of unchecked
        )
        if newTerms.length > 0
          [ticket, newTerms]
        else
          false
    else
      null

  render: ->
    boundaries = ({key, price} for key, price of @props.boundaries).
      sort((a, b) -> ORDER[a.key] - ORDER[b.key])
    show = boundaries.length
    FilterGroup
      className: '--baggage'
      label: @props.t('filters:titles.baggage')
      modified: Object.keys(@props.unchecked).length > 0
      metricsName: 'BAGGAGE'
      initialOpened: false
      onReset: @props.onReset
      name: @props.name
      if show
        CheckboxesList(
          prefix: 'baggage'
          onChange: @handleChange
          unchecked: @props.unchecked
          hideScroll: true
          items: for {key, price} in boundaries
            key: key
            withTooltip: if key is 'unknown' then true else false
            label: @props.t('baggage:type.' + key)
            extra: Price(valueInRubles: price)
        )

  handleChange: (unchecked, bagsKey) =>
    @metricsSend('BAGGAGE', bagsKey)
    @props.onChange(unchecked)

export default FilterMetrics(BaggageFilter)
