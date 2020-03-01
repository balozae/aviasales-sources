import React from 'react'
import PropTypes from 'prop-types'
import clssnms from 'clssnms'
import { Trans } from 'react-i18next'
import './advice.scss'

const classNames = clssnms('prediction-advice')

const PredictionTableBtn = (props) => (
  <span
    className={classNames('link', { '--selected': props.calendarType !== 'matrix' })}
    onClick={() => props.onExpand('matrix')}
    role="presentation"
  >
    {props.children}
  </span>
)

const PredictionGraphBtn = (props) => (
  <span
    className={classNames('link', { '--selected': props.calendarType !== 'graph' })}
    onClick={() => props.onExpand('graph')}
    role="presentation"
  >
    {props.children}
  </span>
)

const PredictionAdvice = (props) => {
  const { t } = props

  return (
    <div className={classNames()}>
      <div className={classNames('icon')} />
      <div>
        <div className={classNames('title')}>{t('prediction:adviceTitle')}</div>
        <div className={classNames('desc')}>
          <Trans
            i18nKey={'adviceDescription'}
            ns="prediction"
            components={[
              <PredictionTableBtn key="predictionTableBtn" {...props} />,
              <PredictionGraphBtn key="predictionGraphBtn" {...props} />,
            ]}
          />
        </div>
      </div>
    </div>
  )
}

PredictionAdvice.propTypes = {
  t: PropTypes.func.isRequired,
  calendarType: PropTypes.string.isRequired,
  onExpand: PropTypes.func.isRequired,
}

export default PredictionAdvice
