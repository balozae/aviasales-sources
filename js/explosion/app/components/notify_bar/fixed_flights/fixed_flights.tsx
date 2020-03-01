import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Notify, { cn } from '../notify'
import { NotifyIconType, NotifyColorType } from '../notify.types'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { clearFixedFlights } from 'common/js/redux/actions/fixed_flights.actions'

// NOTE: UI
interface NotifyFixedFlighsProps {
  onClose: () => void
  onBtnClick: () => void
  fixedFlights: string[]
}

export const NotifyFixedFlighs: React.FC<NotifyFixedFlighsProps> = React.memo((props) => {
  const { onBtnClick, onClose, fixedFlights = [] } = props
  const { t } = useTranslation('notify_fixed_flights')

  const prepared = fixedFlights.map((flight) => {
    const items = flight.split('-')
    return `${items[0]}\u00A0-\u00A0${items[2]}`
  })

  const routeText = prepared.join(', ')

  return (
    <Notify onClose={onClose} iconType={NotifyIconType.Pin} colorType={NotifyColorType.Blue}>
      <div className={cn('text')}>
        {t('notify_fixed_flights:description', { count: prepared.length, route: routeText })}
      </div>
      <button className={cn('button')} onClick={onBtnClick}>
        {t('notify_fixed_flights:button')}
      </button>
    </Notify>
  )
})

// NOTE: Container
interface StoreProps {
  fixedFlights: string[]
}

interface DispatchProps {
  clear: () => void
  reachGoal: (event: string, data?: any) => void
}

interface OwnProps {
  onClose: () => void
}

type NotifyFixedFlighsContainerProps = OwnProps & StoreProps & DispatchProps

class NotifyFixedFlighsContainer extends React.Component<NotifyFixedFlighsContainerProps> {
  shouldComponentUpdate(nextProps: NotifyFixedFlighsContainerProps) {
    const { fixedFlights = [] } = nextProps
    if (fixedFlights.length === 0) {
      return false
    }

    return true
  }

  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_fixed_flights' })
  }

  handleClear = () => {
    const { reachGoal, clear } = this.props
    reachGoal('CLEAR_FIXED_FLIGHTS', { sender: 'notify_fixed_flights' })
    clear()
  }

  handleClose = () => {
    const { onClose, reachGoal } = this.props
    reachGoal('NOTIFY_CLOSED', { sender: 'notify_fixed_flights' })
    onClose()
  }

  render() {
    return (
      <Suspense fallback={null}>
        <NotifyFixedFlighs
          onBtnClick={this.handleClear}
          onClose={this.handleClose}
          fixedFlights={this.props.fixedFlights}
        />
      </Suspense>
    )
  }
}

const mapStateToProps = (state): StoreProps => ({
  fixedFlights: state.fixedFlights,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  reachGoal: (name, data) => dispatch(reachGoal(name, data)),
  clear: () => dispatch(clearFixedFlights()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotifyFixedFlighsContainer)
