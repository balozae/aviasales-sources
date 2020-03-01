import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import viewport from 'browser-viewport'
import Notify, { cn } from '../notify'
import { NotifyColorType } from '../notify.types'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { restartSearch } from 'common/js/redux/actions/start_search/start_search.actions'

// NOTE: UI
interface NotifyExpiredSearchProps {
  onBtnClick: () => void
}

export const NotifyExpiredSearch: React.FC<NotifyExpiredSearchProps> = (props) => {
  const { t } = useTranslation('notify_expired_search')

  return (
    <Notify colorType={NotifyColorType.Red}>
      <div className={cn('text')}>{t('notify_expired_search:description')}</div>
      <button className={cn('button')} onClick={props.onBtnClick}>
        {t('notify_expired_search:button')}
      </button>
    </Notify>
  )
}

// NOTE: Container
interface StoreProps {
  searchId: string
}

interface DispatchProps {
  restartSearch: () => void
  reachGoal: (event: string, data?: any) => void
}

type NotifyExpiredSearchContainerProps = StoreProps & DispatchProps

class NotifExpiredSearchContainer extends React.PureComponent<NotifyExpiredSearchContainerProps> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_expired_search' })
  }

  handleClick = () => {
    viewport.scrollTop(0, 300)
    this.props.reachGoal('EXPIRED_REFRESH', { search_id: this.props.searchId })
    this.props.restartSearch()
  }

  render() {
    return (
      <Suspense fallback={null}>
        <NotifyExpiredSearch onBtnClick={this.handleClick} />
      </Suspense>
    )
  }
}

const mapStateToProps = (state): StoreProps => ({
  searchId: state.searchId,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  reachGoal: (name, data) => dispatch(reachGoal(name, data)),
  restartSearch: () => dispatch(restartSearch()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotifExpiredSearchContainer)
