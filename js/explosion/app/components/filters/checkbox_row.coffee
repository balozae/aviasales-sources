import React from 'react'
import {div, a, input, label, span} from 'react-dom-factories'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next';
import 'modules/checkbox.scss'

class CheckboxRow extends React.Component
  @displayName: 'CheckboxRow'

  @propTypes:
    id: PropTypes.string.isRequired
    onChange: PropTypes.func.isRequired
    checked: PropTypes.bool.isRequired
    withTooltip: PropTypes.bool
    label: PropTypes.string.isRequired
    extra: PropTypes.element
    title: PropTypes.string
    onUncheckOther: PropTypes.func
    showUncheckOther: PropTypes.bool

  @defaultProps:
    showUncheckOther: true

  render: ->
    div
      className: 'checkboxes-list__item'
      title: if not @props.withTooltip then @props.title else ''
      label
        className: 'checkboxes-list__label'
        htmlFor: @props.id
        if @props.withTooltip
          div
            className: 'checkboxes-list__tooltip tooltip --top --on-hover'
            @props.title
        span
          className: 'checkbox'
          input
            className: 'checkbox__field'
            type: 'checkbox'
            checked: @props.checked
            onChange: @props.onChange
            id: @props.id
          span
            className: 'checkbox__face'
        @props.label
      @renderExtra()

  renderExtra: ->
    if @props.showUncheckOther
      div
        className: 'checkboxes-list__extra'
        a
          className: 'checkboxes-list__extra-uncheck-other'
          onClick: @props.onUncheckOther
          @props.t('filters:only')
        div
          className: 'checkboxes-list__extra-content'
          @props.extra or []
    else
      []

export default withTranslation('filters')(CheckboxRow)
