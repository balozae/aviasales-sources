import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import Notify, { cn } from '../notify'
import { NotifyColorType, NotifyIconType } from '../notify.types'
import { hideSubscriptionsInformer } from 'common/js/redux/actions/subscriptions_informer.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

interface NotifySubscriptionsInformerProps {
  onBtnClick: () => void
}

export const NotifySubscriptionsInformer: React.FC<NotifySubscriptionsInformerProps> = ({
  onBtnClick,
}) => {
  const { t } = useTranslation('notify_subscriptions_informer')

  return (
    <Notify colorType={NotifyColorType.White} iconType={NotifyIconType.Bell}>
      <div className={cn('text')}>{t('notify_subscriptions_informer:description')}</div>
      <button className={cn('button')} onClick={onBtnClick}>
        {t('notify_subscriptions_informer:button')}
      </button>
    </Notify>
  )
}

interface DispatchProps {
  hideSubscriptionsInformer: () => void
  reachGoal: (event: string, data?: any) => void
}

class NotifySubscriptionsInformerContainer extends React.PureComponent<DispatchProps> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_subscriptions_informer' })
  }

  handleHideBtnClick = () => {
    this.props.reachGoal('CLOSE_SUBSCRIPTIONS_INFORMER')
    this.props.hideSubscriptionsInformer()
  }

  render() {
    return (
      <Suspense fallback={null}>
        <NotifySubscriptionsInformer onBtnClick={this.handleHideBtnClick} />
      </Suspense>
    )
  }
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
  hideSubscriptionsInformer: () => dispatch(hideSubscriptionsInformer()),
  reachGoal: (name, data) => dispatch(reachGoal(name, data)),
})

export default connect(
  null,
  mapDispatchToProps,
)(NotifySubscriptionsInformerContainer)
