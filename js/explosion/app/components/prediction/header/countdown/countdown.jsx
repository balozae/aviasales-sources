import React from 'react'
import clssnms from 'clssnms'
import { Trans } from 'react-i18next'
import './countdown.scss'

const classNames = clssnms('countdown')

const GATE_NAMES = [
  'Kupibilet',
  'OneTwoTrip',
  'Tinkoff',
  'SuperKassa',
  'S7 Airlines',
  'Mytrip',
  'Mego.travel',
  'Kiwi',
  'Nordwind',
  'OZON.travel',
  'Biletix',
  'Pobeda',
  'City.Travel',
  'Aviakassa',
  'Svyaznoy Travel',
  'Aeroflot',
  'Tickets.ru',
  'Utair',
  'Red Wings',
  'SmartFares',
  'Aerobilet',
  'Trip.com',
  'KLM AirFrance',
]
const PROGRESS_TIME = 45
const TICK_TIME = 1000

class Countdown extends React.Component {
  displayName = 'Countdown'

  constructor(props) {
    super(props)
    this.state = { timer: PROGRESS_TIME }
  }

  componentDidMount() {
    this.tickStartTime = Date.now()
    this.timeout = setTimeout(() => this.countdownTick(), TICK_TIME)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.timer !== this.state.timer && this.state.timer > 0) {
      const tickEndTime = Date.now()
      let delta = 0

      if (
        tickEndTime - this.tickStartTime > TICK_TIME &&
        tickEndTime - this.tickStartTime < 2 * TICK_TIME
      ) {
        delta = tickEndTime - this.tickStartTime - TICK_TIME
      }

      this.tickStartTime = Date.now()
      this.timeout = setTimeout(() => this.countdownTick(), TICK_TIME - delta)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  countdownTick() {
    this.setState({ timer: this.state.timer - 1 })
  }

  render() {
    if (this.state.timer === 0) {
      return null
    }

    const gateName = GATE_NAMES[+this.state.timer % GATE_NAMES.length]

    return (
      <div className={classNames()}>
        <div className={classNames('timer')}>{this.state.timer}</div>
        <div className={classNames('title')}>
          <Trans
            ns="prediction"
            i18nKey="countdownTitle"
            values={{ gateName }}
            components={[<div key="countdownGateTitle" className={classNames('gate')} />]}
          />
        </div>
      </div>
    )
  }
}

export default Countdown
