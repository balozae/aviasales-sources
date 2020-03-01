import React from 'react'
import {div, ul} from 'react-dom-factories'
import PropTypes from 'prop-types'
import update from 'immutability-helper'
import CheckboxRowComponent from './checkbox_row'
import omit from 'omit'
import { withTranslation } from 'react-i18next';
import './styles/checkboxes_list.scss'

CheckboxRow = React.createFactory(CheckboxRowComponent)

class CheckboxesList extends React.Component
  @displayName: 'CheckboxesList'
  @propTypes:
    onChange: PropTypes.func.isRequired
    unchecked: PropTypes.object.isRequired
    prefix: PropTypes.string.isRequired
    showAll: PropTypes.bool
    hideScroll: PropTypes.bool
    items: PropTypes.arrayOf(
      PropTypes.shape(
        key: PropTypes.string.isRequired
        withTooltip: PropTypes.bool
        label: PropTypes.string.isRequired
        title: PropTypes.string
        extra: PropTypes.element
      )
    ).isRequired
    showUncheckOther: PropTypes.bool

  @defaultProps:
    showUncheckOther: true

  render: ->
    showAll = if typeof @props.showAll isnt 'undefined' then @props.showAll else @props.items.length > 1
    overflowClass = if @props.hideScroll then '--overflow-hidden' else ''
    all = if showAll
      CheckboxRow
        id: "#{@props.prefix}_all"
        label: @props.t('filters:all')
        checked: (Object.keys(@props.unchecked).length is 0)
        onChange: @handleAllChange
        showUncheckOther: false
    else
      []
    div
      className: 'filter__controls checkboxes-list'
      all
      div
        className: "checkboxes-list__list #{overflowClass}"
        for {key, withTooltip, label, title, extra} in @props.items
          CheckboxRow(
            key: key
            id: "#{@props.prefix}_#{key}"
            label: label
            title: title
            checked: not @props.unchecked[key]
            withTooltip: withTooltip
            onChange: @handleChange.bind(this, key)
            extra: extra
            onUncheckOther: @handleUncheckOther.bind(this, key)
            showUncheckOther: @props.showUncheckOther
          )

  handleChange: (changedKey, {target}) ->
    # TODO: changes must be an object!!!!!
    changes = []
    unchecked = if target.checked
      changes[changedKey] = true
      omit(@props.unchecked, changedKey)
    else
      changes[changedKey] = false
      set = {"#{changedKey}": {$set: true}}
      update(@props.unchecked, set)
    @props.onChange(unchecked, changes)

  handleUncheckOther: (exceptKey) ->
    unchecked = {}
    for {key} in @props.items when key isnt exceptKey
      unchecked[key] = true
    @props.onChange(unchecked, 'only': exceptKey)

  handleAllChange: ({target}) =>
    unchecked = {}
    unless target.checked
      for {key} in @props.items
        unchecked[key] = true
    @props.onChange(unchecked, 'all': target.checked)

export default withTranslation('filters')(CheckboxesList)
