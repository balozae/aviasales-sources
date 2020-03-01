import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation } from 'react-i18next'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { AppState } from 'common/js/redux/types/root/explosion'
import NotifyExpiredSearch from './expired_search/expired_search'
import NotifyErrorDuringSearch from './error_during_search/error_during_search'
import NotifyOffline from './offline/offline'
import VisaUncheckFilter from './uncheck_visa_filter/uncheck_visa_filter'
import NotifyTravelpayoutsBar from './travel_payouts/travel_payouts'
import NotifyNightMode from './night_mode/night_mode'
import NotifyFixedFlights from './fixed_flights/fixed_flights'
import NotifyCountryInformer from './country_informer/country_informer'
import NotifySubscriptionsInformer from './subscriptions_informer/subscriptions_informer'
import { getCountryInformerInfo } from './country_informer/country_informer.utils'
import {
  CountryInformerParams,
  CountryInformerInfo,
} from './country_informer/country_informer.types'
import { closeUncheckVisaFilterNotify } from 'common/js/redux/actions/uncheck_visa_filter_notify.actions'
import { SYSState } from 'common/js/sys_controller'
import { NotifyType } from './notify.types'
import IconClose from '!!react-svg-loader!./img/close.svg'

import './styles/notify_bar.scss'
import { AppStateUA } from 'user_account/types/app.types'
import EmailActivationNotifyContainer from 'user_account/containers/email_activation/email_activation_notify.container'
import { getEmailActivationIsShown } from 'user_account/selectors/email_activation.selectors'
import ChinaFilter from './china_filter/china_filter'
import ChinaInfoFilter from './china_info_filter/china_info_filter'
import {
  getChinaNotifyIsVisible,
  getChinaInfoNotifyIsVisible,
} from 'common/js/redux/selectors/china_filter.selectors'

const cn = clssnms('notify-bar')

interface NotifyBarOwnProps {
  countryInformerData: CountryInformerParams
}

interface NotifyBarStateProps {
  isShowTP: boolean
  isSearchExpired: boolean
  isErrorDuringSearch: boolean
  isShowNightMode: boolean
  isOffline: boolean
  fixedFlightsCount: number
  showSubscriptionsInformer: boolean
  isShowUncheckVisaFilterNotify: boolean
  isEmailActivationNotifyVisible: boolean
  isChinaNotifyVisible: boolean
  isChinaInfoNotifyVisible: boolean
}

interface NotifyBarDispatchProps {
  closeUncheckVisaFilterNotify(): void
}

type NotifyBarProps = NotifyBarOwnProps &
  NotifyBarStateProps &
  NotifyBarDispatchProps &
  WithTranslation

interface NotifyBarState {
  closedNotifies: NotifyType[]
  notifiesToShow: NotifyType[]
}

class NotifyBar extends React.PureComponent<NotifyBarProps, NotifyBarState> {
  static countryInformerInfo: CountryInformerInfo | null = null

  state: NotifyBarState = {
    closedNotifies: [],
    notifiesToShow: [],
  }

  static getDerivedStateFromProps(props: NotifyBarProps, state: NotifyBarState) {
    return prepareNotifyBarState(props, state.closedNotifies, NotifyBar.countryInformerInfo)
  }

  constructor(props: NotifyBarProps) {
    super(props)

    if (props.countryInformerData && !NotifyBar.countryInformerInfo) {
      NotifyBar.countryInformerInfo = getCountryInformerInfo(props.countryInformerData.host)
    }
  }

  getNotifyItemByType(notifyType: NotifyType) {
    const notifyComponentsMap = {
      [NotifyType.TravelpayoutsBar]: <NotifyTravelpayoutsBar />,
      [NotifyType.ExpiredSearch]: <NotifyExpiredSearch />,
      [NotifyType.ErrorDuringSearch]: <NotifyErrorDuringSearch />,
      [NotifyType.NightMode]: <NotifyNightMode />,
      [NotifyType.Offline]: <NotifyOffline />,
      [NotifyType.FixedFlights]: <NotifyFixedFlights onClose={this.closeNotifyFixedFlights} />,
      [NotifyType.CountryInformer]: (
        <NotifyCountryInformer
          onClose={this.closeNotifyCountryInformer}
          source={NotifyBar.countryInformerInfo ? NotifyBar.countryInformerInfo.source : ''}
          {...this.props.countryInformerData}
        />
      ),
      [NotifyType.SubscriptionsInformer]: <NotifySubscriptionsInformer />,
      [NotifyType.UncheckVisaFilter]: <VisaUncheckFilter />,
      [NotifyType.EmailActivation]: <EmailActivationNotifyContainer />,
      [NotifyType.ChinaFilter]: <ChinaFilter />,
      [NotifyType.ChinaInfoFilter]: <ChinaInfoFilter />,
    }

    return (
      <CSSTransition
        key={notifyType}
        classNames={{
          enterDone: '--enter-done',
        }}
        appear={true}
        timeout={300}
      >
        <div className={cn('item')}>{notifyComponentsMap[notifyType]}</div>
      </CSSTransition>
    )
  }

  closeNotify = (notifyType: NotifyType) => {
    this.setState(({ closedNotifies }) => ({
      closedNotifies: [...closedNotifies, notifyType],
    }))
  }

  closeNotifyCountryInformer = () => {
    this.closeNotify(NotifyType.CountryInformer)
  }

  closeNotifyFixedFlights = () => {
    this.closeNotify(NotifyType.FixedFlights)
  }

  closeStoreControlledNotifies = () => {
    this.props.closeUncheckVisaFilterNotify()
  }

  closeAllShownNotifies = () => {
    this.setState(({ closedNotifies, notifiesToShow }) => {
      this.closeStoreControlledNotifies()
      return {
        closedNotifies: [...closedNotifies, ...notifiesToShow],
      }
    })
  }

  render() {
    const notifiesToShow = this.state.notifiesToShow.filter(
      (notifyType) => !this.state.closedNotifies.includes(notifyType),
    )

    return (
      <div
        className={cn(null, {
          '--not-empty': notifiesToShow.length > 0,
          '--only-one': notifiesToShow.length === 1,
        })}
      >
        {notifiesToShow.length > 1 && (
          <button className={cn('close-all')} onClick={this.closeAllShownNotifies}>
            {this.props.t('notify:closeAll')}
            <IconClose className={cn('close-all-icon')} />
          </button>
        )}
        <TransitionGroup className={cn('list')}>
          {notifiesToShow.map((notifyType) => this.getNotifyItemByType(notifyType))}
        </TransitionGroup>
      </div>
    )
  }
}

const prepareNotifyBarState = (
  props: NotifyBarProps,
  closedNotifies: NotifyType[],
  countryInformerInfo: CountryInformerInfo | null,
): NotifyBarState => {
  let newClosedNotifies = [...closedNotifies]
  const notifiesToShow: NotifyType[] = []

  // TravelpayoutsBar
  if (props.isShowTP) {
    notifiesToShow.push(NotifyType.TravelpayoutsBar)
  }

  // ExpiredSearch
  if (props.isSearchExpired) {
    notifiesToShow.push(NotifyType.ExpiredSearch)
  }

  // ErrorDuringSearch
  if (props.isErrorDuringSearch) {
    notifiesToShow.push(NotifyType.ErrorDuringSearch)
  }

  // NightMode
  if (props.isShowNightMode) {
    notifiesToShow.push(NotifyType.NightMode)
  }

  // Offline
  if (props.isOffline) {
    notifiesToShow.push(NotifyType.Offline)
  }

  // FixedFlights
  if (props.fixedFlightsCount) {
    notifiesToShow.push(NotifyType.FixedFlights)
  }

  // CountryInformer
  if (countryInformerInfo && countryInformerInfo.toShow) {
    notifiesToShow.push(NotifyType.CountryInformer)
  }

  // SubscriptionsInformer
  if (props.showSubscriptionsInformer) {
    notifiesToShow.push(NotifyType.SubscriptionsInformer)
  }

  // UncheckVisaFilter
  if (props.isShowUncheckVisaFilterNotify) {
    notifiesToShow.push(NotifyType.UncheckVisaFilter)
    const uncheckVisaFilterNotifyIndex = closedNotifies.indexOf(NotifyType.UncheckVisaFilter)
    if (uncheckVisaFilterNotifyIndex !== -1) {
      newClosedNotifies.splice(uncheckVisaFilterNotifyIndex, 1)
    }
  }

  if (props.isEmailActivationNotifyVisible) {
    notifiesToShow.push(NotifyType.EmailActivation)
  }

  if (props.isChinaNotifyVisible) {
    notifiesToShow.push(NotifyType.ChinaFilter)
  }

  if (props.isChinaInfoNotifyVisible) {
    notifiesToShow.push(NotifyType.ChinaInfoFilter)
  }

  return {
    notifiesToShow,
    closedNotifies: newClosedNotifies,
  }
}

const mapStateToProps = (state: AppState & AppStateUA): NotifyBarStateProps => ({
  isShowTP: state.travelpayoutsBarProps.isShow,
  isSearchExpired: window.isSearchPage && state.searchStatus === 'EXPIRED',
  isErrorDuringSearch: window.isSearchPage && state.errorDuringSearch,
  isShowNightMode: state.sysState === SYSState.Onboarding,
  isOffline: state.offline.isOffline,
  fixedFlightsCount: state.fixedFlights.length,
  showSubscriptionsInformer:
    state.subscriptionsInformer.active && !state.subscriptionsInformer.wasShown,
  isShowUncheckVisaFilterNotify:
    state.uncheckVisaFilterNotify.isShow && !state.uncheckVisaFilterNotify.isNeverShow,
  isEmailActivationNotifyVisible: getEmailActivationIsShown(state),
  isChinaNotifyVisible: getChinaNotifyIsVisible(state),
  isChinaInfoNotifyVisible: getChinaInfoNotifyIsVisible(state),
})

const mapDispatchToProps = (dispatch): NotifyBarDispatchProps =>
  bindActionCreators(
    {
      closeUncheckVisaFilterNotify,
    },
    dispatch,
  )

export default connect<NotifyBarStateProps, NotifyBarDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('notify')(NotifyBar))
