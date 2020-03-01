import React from 'react'
import PropTypes from 'prop-types'
import {span, div, p} from 'react-dom-factories'
import CheckboxesListComponent from './checkboxes_list'
import CheckboxRowComponent from './checkbox_row'
import FilterGroupComponent from './filter_group'
import PriceComponent from 'react_components/price/price'
import FilterMetrics from './checkbox_filter_metrics'
import {getUncheckedKeys, calcAirlinesState} from './airlines_filter.utils'

Price = React.createFactory(PriceComponent)
CheckboxesList = React.createFactory(CheckboxesListComponent)
CheckboxRow = React.createFactory(CheckboxRowComponent)
FilterGroup = React.createFactory(FilterGroupComponent)

isCyrillic = (str) ->
  return false if typeof str isnt 'string'
  charCode = str.charCodeAt(0)
  charCode >= 1040 and charCode <= 1103

class AirlinesFilter extends React.Component
  @displayName: 'AirlinesFilter'
  @propTypes:
    t: PropTypes.func.isRequired
    onChange: PropTypes.func.isRequired
    boundaries: PropTypes.object.isRequired
    keys: PropTypes.arrayOf(PropTypes.string)
    airlinesInfo: PropTypes.object.isRequired
    isCodeshareIncluded: PropTypes.bool.isRequired
    # checkStatus: checked | unchecked
    # Считаем, что checked (some companies), когда отмечено меньше половины авиакомпаний
    # иначе unchecked (some companies)
    checkStatus: PropTypes.string.isRequired
    name: PropTypes.string.isRequired

  @defaultProps:
    keys: []
    boundaries: {}
    checkStatus: 'unchecked'

  @initialValue: ->
    isCodeshareIncluded: true
    checkStatus: 'unchecked'

  @isChanged: (state) ->
    return false unless state.keys and state.checkStatus
    state.checkStatus is 'checked' and state.keys.length >= 0 or
      state.checkStatus is 'unchecked' and state.keys.length > 0

  # HACK:
  _boundariesKeys = []
  # boundaries мутируют, не получилось использовать prevProps,
  # поэтому сохраняем каждое состояние boundaries в замкнутую переменную
  # При этом, если состояние checkStatus = checked новые авиалинии
  # должны быть по дефолту нечекнутыми
  componentDidUpdate: ->
    boundariesKeys = Object.keys(@props.boundaries)

    if @props.checkStatus is 'checked' and boundariesKeys.length isnt _boundariesKeys.length
      nextUnchecked = @getUncheckedObj()

      for key in boundariesKeys
        if @props.keys.includes(key) isnt true
          nextUnchecked[key] = true

      @handleChangeUnchecked({unchecked: nextUnchecked, isUserAction: false})

    _boundariesKeys = boundariesKeys

  reduceFunc: (state, [ticket, terms]) =>
    [{unified_price}] = terms
    operatingCarriers = @getOperatingCarriers(ticket)
    for carrier in operatingCarriers
      state[carrier] = Math.min(state[carrier] or Infinity, unified_price)
    state

  filterFunc: =>
    filteredIatas = getUncheckedKeys(@props.keys, @props.checkStatus, _boundariesKeys)
    if filteredIatas.length > 0
      # NOTE: do not use @props by reference here
      isCodeshareIncluded = @props.isCodeshareIncluded
      ([ticket, _terms]) =>
        operatingCarriers = @getOperatingCarriers(ticket)
        if isCodeshareIncluded
          operatingCarriers.some((carrier) -> carrier not in filteredIatas)
        else
          operatingCarriers.every((carrier) -> carrier not in filteredIatas)
    else
      null

  initialPrecheck: (checked, boundaries) =>
    unchecked = {}
    for k of boundaries when k not in checked
      unchecked[k] = true
    @handleChangeUnchecked({unchecked, isUserAction: false})

  getAirlinesCheckboxes: ->
    Object.keys(@props.boundaries).map((key) =>
      key: key
      label: @props.airlinesInfo[key]?.name or key
      extra: Price(valueInRubles: @props.boundaries[key])
    ).sort((a, b) ->
      return -1 if isCyrillic(a.label) and not isCyrillic(b.label)
      return 1 if isCyrillic(b.label) and not isCyrillic(a.label)
      return -1 if a.label.toLowerCase() < b.label.toLowerCase()
      return 1 if a.label.toLowerCase() > b.label.toLowerCase()
      return 0
    )

  render: ->
    unchecked = @getUncheckedObj()
    {alliances, uncheckedAlliances} = @_collectAlliances(unchecked)
    hasAlliances = Object.keys(alliances).length > 0

    FilterGroup(
      className: '--airlines'
      label: @props.t('filters:titles.airlines')
      uncheckedCount: Object.keys(unchecked).length
      filterCount: _boundariesKeys.length
      metricsName: 'AIRLINES'
      onReset: @props.onReset
      name: @props.name
      if _boundariesKeys.length || Object.keys(@props.boundaries).length
        div(null,
          CheckboxRow(
            id: 'airlines-codeshare'
            label: @props.t('airlines:fewAirlines')
            showUncheckOther: false
            checked: @props.isCodeshareIncluded
            onChange: @handleCodeshareIncludedChange
          )
          p(
            className: 'filter__description',
            @props.t('airlines:fewAirlinesDescription')
          )
          div(className: 'filter__sub-title', @props.t('airlines:alliances')) if hasAlliances
          CheckboxesList(
            onChange: @handleAillianceChange
            prefix: 'alliances'
            unchecked: uncheckedAlliances
            items: for alliance, {name, price} of alliances
              key: alliance
              label: name
              extra: Price(valueInRubles: price)
          ) if hasAlliances
          div(className: 'filter__sub-title', @props.t('airlines:airlines'))
          CheckboxesList(
            onChange: @handleAirlineChange
            prefix: 'airlines'
            unchecked: unchecked
            items: @getAirlinesCheckboxes()
          )
        )
    )

  handleAillianceChange: (uncheckedAlliances, changes) =>
    unchecked = {}
    if Object.keys(uncheckedAlliances).length > 0
      for iata of @props.boundaries
        alliance = @props.airlinesInfo[iata].allianceName
        if not alliance or alliance of uncheckedAlliances
          unchecked[iata] = true
    @metricsSend('ALLIANCES', changes)
    @handleChangeUnchecked({unchecked})

  handleAirlineChange: (unchecked, changes) =>
    @metricsSend('AIRLINES', changes)
    @handleChangeUnchecked({unchecked, changes})

  handleCodeshareIncludedChange: (event) =>
    checked = event.target.checked
    @metricsSend('AIRLINES', codeshare_included: checked)
    @props.onChange(
      isCodeshareIncluded: checked
      keys: @props.keys
      checkStatus: @props.checkStatus
    )

  handleChangeUnchecked: ({unchecked, changes = {}, isUserAction = true}) =>
    nextAirlinesState = calcAirlinesState(unchecked, _boundariesKeys, @props.isCodeshareIncluded)

    @props.onChange(nextAirlinesState, isUserAction)

  getOperatingCarriers: (ticket) ->
    ticket.segment.reduce((carriers, segment) ->
      for flight in segment.flight
        carriers.push(flight.operating_carrier) if flight.operating_carrier not in carriers
      carriers
    , [])

  getUncheckedObj: ->
    uncheckedKeys = getUncheckedKeys(@props.keys, @props.checkStatus, _boundariesKeys)
    unchecked = {}
    for key in uncheckedKeys
      unchecked[key] = true
    unchecked

  _collectAlliances: (unchecked) ->
    alliances = {}
    uncheckedAlliances = {}
    for iata, price of @props.boundaries
      allianceName = @props.airlinesInfo?[iata]?.allianceName
      if allianceName
        alliances[allianceName] ?= {name: allianceName, price: Infinity}
        alliances[allianceName].price = Math.min(price, alliances[allianceName].price)
        if iata of unchecked
          uncheckedAlliances[allianceName] = true
    {alliances, uncheckedAlliances}

export default FilterMetrics(AirlinesFilter)
