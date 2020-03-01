import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { withTranslation, WithTranslation } from 'react-i18next'
import Notify, { cn } from '../notify'
import { NotifyColorType } from '../notify.types'
import { closeChinaInfoNotify } from 'common/js/redux/actions/china_notify.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

interface StateProps {}

interface DispatchProps {
  reachGoal: typeof reachGoal
  closeChinaInfoNotify: typeof closeChinaInfoNotify
}

type ChinaInfoFilterContainerProps = StateProps & DispatchProps

class ChinaInfoFilterContainer extends React.Component<
  ChinaInfoFilterContainerProps & WithTranslation
> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_china' })
  }

  handleButtonClick = () => {
    this.props.closeChinaInfoNotify()
    this.props.reachGoal('CHINA_FILTER_INFO_NOTIFY_OK', { sender: 'notify_info_china' })
  }

  render() {
    const { t } = this.props

    return (
      <Suspense fallback={null}>
        <Notify
          // onClose={this.handleClose}
          // iconType={NotifyIconType.Warning}
          colorType={NotifyColorType.Blue}
        >
          <div className={cn('text')}>{t('china_notify:infoNotify.description')}</div>
          <button className={cn('button')} onClick={this.handleButtonClick}>
            {t('china_notify:infoNotify:button')}
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
      closeChinaInfoNotify,
    },
    dispatch,
  )

export default connect<StateProps, DispatchProps>(
  null,
  mapDispatchToProps,
)(withTranslation()(ChinaInfoFilterContainer))
