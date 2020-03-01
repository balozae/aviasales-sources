import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import viewport from 'browser-viewport'
import Notify, { cn } from '../notify'
import { NotifyColorType } from '../notify.types'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { restartSearch } from 'common/js/redux/actions/start_search/start_search.actions'

// NOTE: UI
interface NotifyErrorDuringSearchProps {
  onBtnClick: () => void
}

export const NotifyErrorDuringSearch: React.FC<NotifyErrorDuringSearchProps> = React.memo(
  (props) => {
    const { t } = useTranslation('notify_error_during_search')
    return (
      <Notify colorType={NotifyColorType.Blue}>
        <div className={cn('text')}>{t('notify_error_during_search:description')}</div>
        <button className={cn('button')} onClick={props.onBtnClick}>
          {t('notify_error_during_search:button')}
        </button>
      </Notify>
    )
  },
)

interface DispatchProps {
  restartSearch: () => void
  reachGoal: (event: string, data?: any) => void
}

type NotifyErrorDuringSearchContainerProps = DispatchProps

class NotifyErrorDuringSearchContainer extends React.PureComponent<
  NotifyErrorDuringSearchContainerProps
> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_error_during_search' })
  }

  handleClick = () => {
    viewport.scrollTop(0, 300)
    this.props.restartSearch()
    this.props.reachGoal('NOTIFY_ERROR_DURING_SEARCH_REFRESH')
  }

  render() {
    return (
      <Suspense fallback={null}>
        <NotifyErrorDuringSearch onBtnClick={this.handleClick} />
      </Suspense>
    )
  }
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
  restartSearch: () => dispatch(restartSearch()),
  reachGoal: (name, data) => dispatch(reachGoal(name, data)),
})

export default connect(
  null,
  mapDispatchToProps,
)(NotifyErrorDuringSearchContainer)
