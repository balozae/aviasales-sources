import * as React from 'react'
import { SYSState } from './sys_controller'
import { connect } from 'react-redux'
import { setSysState } from './redux/actions/sys_state.actions'
import clssnms from 'clssnms'
import GoalKeeper from 'common/bindings/goalkeeper'
import '../css/components/theme-switcher/theme_switcher.scss'
import testCSSVariables from './test_css_variables'

const classNames = clssnms('theme-switcher')

interface Props {
  sysState: SYSState
  setSYSState: (state: SYSState) => void
}

declare global {
  interface Window {
    isMainPage: boolean
    isSearchPage: boolean
    CSS: { supports: Function }
  }
}

class ThemeSwitcher extends React.Component<Props, {}> {
  isSupported = testCSSVariables()

  handleChange = (event: any) => {
    const checked = event.target.checked
    const nextState = checked ? SYSState.UserEnabled : SYSState.UserDisabled
    const evantLabel = checked ? 'enabled' : 'disabled'
    const page = window.isMainPage ? 'main_page' : 'search_page'
    this.props.setSYSState(nextState)
    GoalKeeper.triggerEvent('night_mode', evantLabel, 'user', { page: page })
  }

  render() {
    if (!this.isSupported) {
      return null
    }
    const enabled =
      this.props.sysState === '1' || this.props.sysState === '2' || this.props.sysState === '4'

    return (
      <div className={classNames()}>
        <input
          type="checkbox"
          className={classNames('input')}
          checked={enabled}
          onChange={this.handleChange}
          id="theme-switcher"
        />
        <label htmlFor="theme-switcher" className={classNames('switcher')}>
          <span className={classNames('toggle-handler')} />
        </label>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({ sysState: state.sysState })

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setSYSState: (state: SYSState) => dispatch(setSysState(state)),
  } as Partial<Props>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ThemeSwitcher)
