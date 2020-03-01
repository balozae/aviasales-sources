import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { withTranslation, WithTranslation } from 'react-i18next'
import Notify, { cn } from '../notify'
import { NotifyIconType, NotifyColorType } from '../notify.types'
import {
  closeChinaNotify,
  notShowChinaNotifyForWeek,
  chinaNotifyButtonClick,
} from 'common/js/redux/actions/china_notify.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

interface StateProps {}

interface DispatchProps {
  reachGoal: typeof reachGoal
  closeChinaNotify: typeof closeChinaNotify
  notShowChinaNotifyForWeek: typeof notShowChinaNotifyForWeek
  chinaNotifyButtonClick: typeof chinaNotifyButtonClick
}

type ChinaFilterContainerProps = StateProps & DispatchProps

class ChinaFilterContainer extends React.Component<ChinaFilterContainerProps & WithTranslation> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_china' })
  }

  handleButtonClick = () => {
    this.props.chinaNotifyButtonClick()
  }

  handleClose = () => {
    this.props.reachGoal('NOTIFY_CLOSED', { sender: 'notify_china' })
    this.props.notShowChinaNotifyForWeek()
    this.props.closeChinaNotify()
  }

  render() {
    const { t } = this.props

    return (
      <Suspense fallback={null}>
        <Notify
          onClose={this.handleClose}
          iconType={NotifyIconType.Warning}
          colorType={NotifyColorType.Red}
        >
          <div className={cn('text')}>{t('china_notify:description')}</div>
          <button className={cn('button')} onClick={this.handleButtonClick}>
            {t('china_notify:button')}
          </button>
        </Notify>
      </Suspense>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      reachGoal,
      closeChinaNotify,
      notShowChinaNotifyForWeek,
      chinaNotifyButtonClick,
    },
    dispatch,
  )

export default connect<StateProps, DispatchProps>(
  null,
  mapDispatchToProps,
)(withTranslation()(ChinaFilterContainer))
