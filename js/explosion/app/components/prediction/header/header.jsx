import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import clssnms from 'clssnms'
import Countdown from './countdown/countdown'
import PredictionAdvice from './advice/advice'
import './header.scss'

const classNames = clssnms('prediction-header')

class Header extends React.Component {
  getButton() {
    const { t } = this.props

    if (this.props.error && !this.props.isExpanded) {
      return (
        <div
          className={classNames('refresh-button')}
          onClick={this.props.onRefresh}
          role="presentation"
        >
          {t('prediction:refresh')}
        </div>
      )
    } else if (this.props.showCalendar) {
      return (
        <div
          className={classNames('expand-button')}
          onClick={this.props.onExpand}
          role="presentation"
        >
          <div className={classNames('expand-button-icon')} />
          <span>{this.props.isExpanded ? t('common:rollUp') : t('common:show')}</span>
        </div>
      )
    }
    return null
  }

  render() {
    return (
      <div className={classNames()}>
        <div className={classNames('wrapper')}>
          <div className={classNames('left-col')}>
            {this.props.showCountdown ? (
              <Countdown />
            ) : (
              <PredictionAdvice
                t={this.props.t}
                onExpand={this.props.onExpand}
                calendarType={this.props.calendarType}
              />
            )}
          </div>
          <div className={classNames('right-col')}>{this.getButton(this.props)}</div>
        </div>
      </div>
    )
  }
}

Header.displayName = 'PredictionHeader'
Header.propTypes = {
  t: PropTypes.func.isRequired,
  calendarType: PropTypes.string.isRequired,
  showCountdown: PropTypes.bool.isRequired,
  showCalendar: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func,
  error: PropTypes.object,
  onRefresh: PropTypes.func,
}

Header.defaultProps = {
  onExpand() {},
  onRefresh() {},
  error: null,
}

const mapStateToProps = (state, { calendarType }) => {
  const { initialPrices } = state.prediction[calendarType]
  // NOTE: deal with different format for matrix prices
  if (initialPrices && !Array.isArray(initialPrices)) {
    let result = []

    Object.keys(initialPrices).forEach((departDate) => {
      const returnDates = initialPrices[departDate]

      if (Array.isArray(returnDates)) {
        result = result.concat(returnDates)
      } else {
        Object.keys(returnDates).forEach((returnDate) => {
          const prices = returnDates[returnDate]
          result = result.concat(prices)
        })
      }
    })

    return { initialPrices: result }
  }
  return { initialPrices }
}

export default connect(mapStateToProps)(Header)
