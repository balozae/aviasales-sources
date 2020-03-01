import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import CheckboxesListComponent from './checkboxes_list'
import FilterGroupComponent from './filter_group'
import PriceComponent from 'react_components/price/price'
import FilterMetrics from './checkbox_filter_metrics'
import update from 'immutability-helper'

Price = React.createFactory(PriceComponent)
CheckboxesList = React.createFactory(CheckboxesListComponent)
FilterGroup = React.createFactory(FilterGroupComponent)


class GatesFilter extends React.Component
  @displayName: 'GatesFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    unchecked: PropTypes.object.isRequired
    gatesInfo: PropTypes.object.isRequired
    name: PropTypes.string.isRequired

  reduceFunc: (state, [_ticket, gates]) =>
    for {gate_id, unified_price} in gates
      # NOTE: abs cuz magic gates (negative number) and non-magic are the same in filters
      gate_id = Math.abs(gate_id)
      lang = @props.gatesInfo[gate_id]?.lang or 'ru'
      lang = 'other' if lang isnt 'ru'
      state[lang] or= {}
      state[lang][gate_id] = Math.min(state[lang][gate_id] or Infinity, unified_price)
    state

  filterFunc: =>
    if Object.keys(@props.unchecked).length > 0
      filtered = {}
      Object.assign(filtered, gates) for key, gates of @props.unchecked
      # NOTE: do not use @props by reference here
      ([ticket, terms]) ->
        new_terms = (term for term in terms when Math.abs(term.gate_id) not of filtered)
        if new_terms.length > 0
          [ticket, new_terms]
        else
          false
    else
      null

  handleChange: (lang, unchecked, changes) ->
    unchecked = if Object.keys(unchecked).length is 0
      update(@props.unchecked, $unset: [lang])
    else
      isOnlyChanged = 'only' of changes
      # NOTE: if user clicked 'only', set unchecked for all gates, even opposite language
      if isOnlyChanged
        oppositeLang = if lang is 'ru' then 'other' else 'ru'
        set = {
          "#{lang}": {$set: unchecked}
          "#{oppositeLang}": {$set: @_uncheckedLangGates(oppositeLang)}
        }
      else
        set = {"#{lang}": {$set: unchecked}}
      update(@props.unchecked, set)
    goal = if lang is 'ru' then 'GATES' else "GATES_#{lang.toUpperCase()}_LANG"
    @metricsSend(goal, changes, (value) -> +value)
    @props.onChange(unchecked)

  # Get overall amount of all gates
  # @params {Object} boundaries
  #
  # @return {Number} amount of gates
  #
  _getAmount: (boundaries) ->
    return 0 if Object.keys(boundaries).length is 0

    Object.keys(boundaries).reduce((result, lang) ->
      return result += Object.keys(boundaries[lang] or {}).length
    , 0)

  # Get boundaries for lang and set value for each gate
  # @params {String} lang
  #
  # @return {Object} Gates with true value
  #
  _uncheckedLangGates: (lang) ->
    result = {}
    for gate of @props.boundaries[lang]
      result[gate] = true
    result

  # Prepare gates from props to render – separate by lang and sort by name
  #
  # @return {Object} {lang, gates}
  #
  _prepareBoundaries: ->
    gatesList = []
    return gatesList unless @props.gatesInfo
    for lang, gates of @props.boundaries when Object.keys(gates).length
      gatesSorted = (for gateId, price of gates when @props.gatesInfo[gateId]
        id: gateId,
        price: price,
        label: @props.gatesInfo[gateId]?.label
      ).sort(
        (gate1, gate2) ->
          label1 = gate1.label.toLowerCase()
          label2 = gate2.label.toLowerCase()
          return 1 if label1 > label2
          return -1 if label1 < label2
          return 0
      )
      gatesList.push({lang, gates: gatesSorted})
    gatesList

  initialPrecheck: (checked, boundaries) ->
    unchecked = {}
    for lang, gates of boundaries when Object.keys(gates).length
      unchecked[lang] = {}
      for k of gates when k not in checked
        unchecked[lang][k] = true
    @props.onChange(unchecked, false)

  render: ->
    boundariesAmount = @_getAmount(@props.boundaries)
    FilterGroup(
      className: '--gates'
      label: @props.t('filters:titles.gates')
      filterCount: boundariesAmount
      uncheckedCount: @_getAmount(@props.unchecked)
      metricsName: 'GATES'
      onReset: @props.onReset
      name: @props.name
      if boundariesAmount
        for {lang, gates} in @_prepareBoundaries()
          div(
            key: lang
            div className: 'filter__sub-title', @props.t(["gates:gateLanguageTypes.#{lang}", 'gates:gateLanguageOther']) if Object.keys(@props.boundaries).length > 1
            CheckboxesList(
              prefix: "gates-#{lang}"
              onChange: @handleChange.bind(this, lang)
              unchecked: @props.unchecked[lang] or {}
              items: for key, gate of gates when gate
                {id, price, label} = gate
                key: id
                label: label
                extra: Price(valueInRubles: price)
            )
          )
    )

export default FilterMetrics(GatesFilter)
