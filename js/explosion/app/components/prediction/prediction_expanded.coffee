import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import classNames from 'classnames'
import PriceComponent from 'react_components/price/price'
import PredictionErrorComponent from './prediction_error'
import CalendarTypeSwitcherComponent from './calendar_type_switcher'

CalendarTypeSwitcher = React.createFactory(CalendarTypeSwitcherComponent)
PredictionError = React.createFactory(PredictionErrorComponent)
Price = React.createFactory(PriceComponent)

PredictionExpanded = (props) ->
  return null unless props.isVisible
  div
    className: 'prediction__expanded'
    div
      className: 'prediction__expanded-inner'
      CalendarTypeSwitcher
        t: props.t
        className: 'prediction__switcher'
        activeType: props.calendarType
        onChange: props.onCalendarTypeChange
      if props.error
        PredictionError
          t: props.t
          error: props.error
          onRefresh: props.onRefresh
      else
        div(null, props.children)

PredictionExpanded.displayName = 'PredictionExpanded'
PredictionExpanded.propTypes =
  t: PropTypes.func.isRequired
  isVisible: PropTypes.bool.isRequired
  error: PropTypes.object
  onRefresh: PropTypes.func
  calendarType: PropTypes.string.isRequired
  onCalendarTypeChange: PropTypes.func

export default PredictionExpanded
