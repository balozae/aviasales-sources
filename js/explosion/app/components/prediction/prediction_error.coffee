import React from 'react'
import {div, button} from 'react-dom-factories'
import PropTypes from 'prop-types'

# ServerError -> server-error
_dasherize = ({error}) ->
  error.name.replace(/[A-Z]/g, (match, offset) ->
    (if offset > 0 then '-' else '') + match.toLowerCase()
  )

PredictionError = (props) ->
  return null unless props.error
  div
    className: "prediction__error --#{_dasherize(props)}"
    div(className: 'prediction__error-image')
    div
      className: 'prediction__error-message'
      props.t("prediction:#{props.error.message}")
    div
      className: 'prediction__error-body'
      (div(key: "prediction__error-body-line-#{i}", line) for line, i in props.t(props.error.description).split('<br/>'))
    button
      className: 'prediction__error-button'
      onClick: props.onRefresh
      props.t('prediction:refresh')

PredictionError.displayName = 'PredictionError'
PredictionError.propTypes =
  t: PropTypes.func.isRequired
  error: PropTypes.object
  onRefresh: PropTypes.func.isRequired

export default PredictionError
