import React from 'react'
import PropTypes from 'prop-types'
import {div, a} from 'react-dom-factories'
import classNames from 'classnames'
import './styles/calendar_type_switcher.scss'

CALENDAR_TYPES =
  matrix: 'matrix'
  graph: 'graph'

CalendarTypeSwitcher = (props) ->
  div
    className: classNames('calendar-type-switcher', props.className)
    for type, name of CALENDAR_TYPES
      a
        className: classNames(
          'calendar-type-switcher__item'
          'is-active': type is props.activeType
        )
        href: "#calendar-#{type}"
        key: type
        onClick: handleClick.bind(null, props, type)
        props.t("prediction:#{name}")

handleClick = ({onChange}, type, e) ->
  e.preventDefault()
  onChange(type)

CalendarTypeSwitcher.displayName = 'CalendarTypeSwitcher'
CalendarTypeSwitcher.propTypes =
  t: PropTypes.func.isRequired
  activeType: PropTypes.oneOf(Object.keys(CALENDAR_TYPES)).isRequired
  onChange: PropTypes.func.isRequired

export default CalendarTypeSwitcher
