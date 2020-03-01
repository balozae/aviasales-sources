import React, { Suspense } from 'react'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Cookie from 'oatmeal-cookie'
import Notify, { cn } from '../notify'
import { NotifyIconType, NotifyColorType } from '../notify.types'
import HintIcon from '!!react-svg-loader!../img/hint.svg'
import markerable from 'utils/markerable.coffee'
import cookieDomain from 'utils/cookie_domain.coffee'
import { updateMarker as updateMarkerAction } from 'common/js/redux/actions/marker.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

// NOTE: UI
interface NotifyTravelpayoutsMarkerProps {
  onHintClick: () => void
  onBtnClick: () => void
  onClose: () => void
}

export const NotifyTravelpayoutsMarker: React.FC<NotifyTravelpayoutsMarkerProps> = React.memo(
  (props) => {
    const { onHintClick, onBtnClick, onClose } = props
    const { t, i18n } = useTranslation('notify_travel_payouts')
    const lang = i18n.language.toLocaleLowerCase()

    return (
      <Notify
        onClose={onClose}
        iconType={NotifyIconType.TP}
        colorType={NotifyColorType.White}
        closeText={t('notify_travel_payouts:close')}
      >
        <div className={cn('text')}>
          {t('notify_travel_payouts:description')}
          <a
            className={cn('tp-hint')}
            onClick={onHintClick}
            href={`https://support.travelpayouts.com/hc/${lang}/articles/360004081551`}
            target="_blank'"
          >
            <HintIcon className={cn('tp-hint-icon')} />
          </a>
        </div>
        <button className={cn('button')} onClick={onBtnClick}>
          {t('notify_travel_payouts:button')}
        </button>
      </Notify>
    )
  },
)

// NOTE: Container
interface StoreProps {
  affMarker: string | null
}

interface DispatchProps {
  hideTravelpayoutsBar: () => void
  reachGoal: (event: string, data?: any) => void
  updateMarker: () => void
}

type NotifyTravelpayoutsMarkerContainerProps = StoreProps & DispatchProps

class NotifyTravelpayoutsMarkerContainer extends React.PureComponent<
  NotifyTravelpayoutsMarkerContainerProps
> {
  componentDidMount() {
    this.props.reachGoal('NOTIFY_SHOWN', { sender: 'notify_travelpayouts' })
  }

  handleHintClick = () => {
    this.props.reachGoal('CLICK_ON_NOTIFY_TP_HINT')
  }

  setMarker = () => {
    const { affMarker, hideTravelpayoutsBar, reachGoal, updateMarker } = this.props
    markerable._setMarker(affMarker)
    hideTravelpayoutsBar()
    updateMarker()
    reachGoal('SET_TP_MARKER', { marker: affMarker })
  }

  handleClose = () => {
    Cookie.set('tp_tooltip_hidden', 1, {
      domain: cookieDomain,
      path: '/',
      expires: new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000),
    })
    this.props.hideTravelpayoutsBar()
    this.props.reachGoal('NOTIFY_CLOSED', { sender: 'notify_travelpayouts' })
  }

  render() {
    return (
      <Suspense fallback={null}>
        <NotifyTravelpayoutsMarker
          onHintClick={this.handleHintClick}
          onBtnClick={this.setMarker}
          onClose={this.handleClose}
        />
      </Suspense>
    )
  }
}

const mapStateToProps = (state): StoreProps => ({
  affMarker: state.travelpayoutsBarProps.affMarker,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  reachGoal: (name, data) => dispatch(reachGoal(name, data)),
  hideTravelpayoutsBar: () =>
    dispatch({ type: 'SET_TRAVELPAYOUTS_BAR_PROPS', props: { isShow: false, affMarker: null } }),
  updateMarker: () => dispatch(updateMarkerAction()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotifyTravelpayoutsMarkerContainer)
