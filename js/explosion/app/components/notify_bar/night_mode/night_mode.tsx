import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Notify, { cn } from '../notify'
import { NotifyIconType, NotifyColorType } from '../notify.types'
import { SYSState } from 'common/js/sys_controller'
import { setSysState, toggleNightMode } from 'common/js/redux/actions/sys_state.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

// NOTE: UI
interface NotifyNightModeProps {
  onClose: () => void
  onBtnClick: () => void
}

export const NotifyNightMode: React.FC<NotifyNightModeProps> = (props) => {
  const { onClose, onBtnClick } = props
  const { t } = useTranslation('notify_night_mode')

  return (
    <Notify
      colorType={NotifyColorType.Violet}
      iconType={NotifyIconType.Moon}
      onClose={onClose}
      closeText={t('notify_night_mode:close')}
    >
      <div className={cn('text')}>{t('notify_night_mode:description')}</div>
      <button className={cn('button')} onClick={onBtnClick}>
        {t('notify_night_mode:button')}
      </button>
    </Notify>
  )
}

// NOTE: Container
interface NotifyNightModeContainerProps {
  toggleNightMode: (toggle: boolean) => void
  setSYSState: (state: SYSState) => void
  reachGoal: (event: string, data?: any) => void
}

class NotifyNightModeContainer extends React.PureComponent<NotifyNightModeContainerProps> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_night_mode' })
  }

  handleClose = () => {
    this.props.setSYSState(SYSState.AutoEnabled) // Set Auto SYS
    this.props.reachGoal('NOTIFY_CLOSED', { sender: 'notify_night_mode' })
    this.props.reachGoal('night_mode', {
      sender: 'notify_night_mode',
      type: 'auto',
      goal: 'onboarding',
      btn: 'close_button',
    })
  }

  handleTogleOff = () => {
    this.props.toggleNightMode(false)
    this.props.reachGoal('night_mode', {
      sender: 'notify_night_mode',
      type: 'disabled',
      goal: 'onboarding',
      btn: 'disabled_button',
    })
  }

  render() {
    return (
      <Suspense fallback={null}>
        <NotifyNightMode onClose={this.handleClose} onBtnClick={this.handleTogleOff} />
      </Suspense>
    )
  }
}

const mapDispatchToProps = (dispatch): NotifyNightModeContainerProps => ({
  toggleNightMode: (toggle) => dispatch(toggleNightMode(toggle)),
  setSYSState: (state) => dispatch(setSysState(state)),
  reachGoal: (name, data) => dispatch(reachGoal(name, data)),
})

export default connect(
  () => ({}),
  mapDispatchToProps,
)(NotifyNightModeContainer)
