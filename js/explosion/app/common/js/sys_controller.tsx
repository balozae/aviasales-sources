import * as React from 'react'
import { connect } from 'react-redux'
const localStorageHelper = require('local_storage_helper')
import GoalKeeper from 'common/bindings/goalkeeper'
import * as SunCalc from 'suncalc'
import testCSSVariables from './test_css_variables'
import { getGeoIpCoordinates } from 'common/utils/geo_ip'
import { refreshIntent, updateIntentTheme } from './redux/actions/advertisements/intent.actions'
import { setSysState } from './redux/actions/sys_state.actions'

interface Props {
  sysState: SYSState
  setSYSState: (state: SYSState) => void
  refreshIntent: () => void
  updateIntentTheme: () => void
}

export enum SYSState {
  Initial = '0',
  Onboarding = '1',
  AutoEnabled = '2',
  AutoDisabled = '3',
  UserEnabled = '4',
  UserDisabled = '5',
}

interface GeoIpResponse {
  name: string
  iata: string
  coordinates: GeoIpCoordinates
  cityIata: string
}

interface GeoIpCoordinates {
  lat: number
  lon: number
}

declare global {
  interface Window {
    initTheme: (sysState: SYSState) => SYSState
  }
}

class ThemeController extends React.PureComponent<Props, {}> {
  getSunsetInfo = (lat: number, lon: number) => {
    return SunCalc.getTimes(new Date(), lat, lon)
  }

  isDark({ lat, lon }: GeoIpCoordinates) {
    const { sunset, sunrise } = this.getSunsetInfo(lat, lon)
    const now = new Date().getTime()

    return now < sunrise.getTime() || now > sunset.getTime()
  }

  constructor(props: Props) {
    super(props)
    this.handleCurrentState()
    this.initTheme(this.props.sysState)
  }

  initTheme = (sysState: SYSState) => {
    const browserSupportsVars = testCSSVariables()
    if (typeof window.initTheme === 'function' && browserSupportsVars) {
      const state = window.initTheme(sysState)
      if (state) {
        this.props.setSYSState(state)
      }
      this.props.updateIntentTheme()
    }
  }

  componentDidUpdate() {
    const nightModeOn =
      this.props.sysState === SYSState.AutoEnabled ||
      this.props.sysState === SYSState.UserEnabled ||
      this.props.sysState === SYSState.Onboarding

    localStorageHelper.setItem('sysState', this.props.sysState)
    GoalKeeper.setContext({ nightMode: nightModeOn, nightModeState: this.props.sysState })
    this.initTheme(this.props.sysState)
    this.props.refreshIntent()
  }

  handleCurrentState = async () => {
    const geoIp = await getGeoIpCoordinates()
    if (!geoIp) {
      return
    }
    const isDark = this.isDark(geoIp)

    localStorageHelper.setItem('sysState', this.props.sysState)

    switch (this.props.sysState) {
      case SYSState.Initial:
      case null:
      case 'null' as SYSState: // sometimes shit happens ¯\_(ツ)_/¯
      case undefined:
        if (isDark) {
          GoalKeeper.triggerEvent('night_mode', 'enabled', 'onboarding', 'isDark')
          this.props.setSYSState(SYSState.Onboarding)
        } else {
          GoalKeeper.triggerEvent('night_mode', 'enabled', 'onboarding', 'isLight')
        }
        break

      case SYSState.Onboarding:
      case SYSState.AutoEnabled:
        if (!isDark) {
          this.props.setSYSState(SYSState.AutoDisabled)
          GoalKeeper.triggerEvent('night_mode', 'auto', 'disabled')
        }
        break
      case SYSState.AutoDisabled:
        if (isDark) {
          GoalKeeper.triggerEvent('night_mode', 'auto', 'enabled')
          this.props.setSYSState(SYSState.AutoEnabled)
        }
        break

      default:
        break
    }
  }

  render() {
    return null
  }
}

const mapStateToProps = (state: any) => ({ sysState: state.sysState })

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setSYSState: (state: SYSState) => dispatch(setSysState(state)),
    refreshIntent: () => dispatch(refreshIntent()),
    updateIntentTheme: () => dispatch(updateIntentTheme()),
  } as Partial<Props>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ThemeController)
