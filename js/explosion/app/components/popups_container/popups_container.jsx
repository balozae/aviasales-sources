import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoginPopupContainer from 'login_popup/index'
import VisaTicketConfirm from 'confirm_popups/visa_ticket_confirm.container'
import { compose } from 'redux'
import RentalcarsPopup from 'explosion/app/components/rentalcars_popup/rentalcars_popup.container'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import TicketSubscriptionsPopupsContainer from 'ticket_subscriptions/ticket_subscriptions_popups.container'
import DirectionSubscriptionsPopup from 'direction_subscriptions_popup/direction_subscriptions_popup'

const PopupHotel = React.lazy(() => import('popup_hotel/popup_hotel.jsx'))
const GateFeedback = React.lazy(() => import('gate_feedback/gate_feedback'))
const YasenClientDebugger = React.lazy(() => import('yasen_client_debugger/yasen_client_debugger'))
const PopupSavedFilters = React.lazy(() => import('popup_saved_filters/popup_saved_filters'))

const PopupsContainer = ({ popups }) => {
  const popupElements = []
  if (popups.hotel) {
    popupElements.push(<PopupHotel key="PopupHotel" />)
  } else if (popups.gateFeedback) {
    popupElements.push(<GateFeedback key="GateFeedback" {...popups.gateFeedback} />)
  } else if (popups.savedFilters) {
    popupElements.push(<PopupSavedFilters key="PopupSavedFilters" />)
  } else if (popups.iddqd) {
    popupElements.push(<YasenClientDebugger key="YasenClientDebugger" {...popups.iddqd} />)
  }

  popupElements.push(
    <LoginPopupContainer
      key="LoginPopupContainer"
      {...popups.loginForm}
      isVisible={!!popups.loginForm}
    />,
  )

  popupElements.push(<VisaTicketConfirm key="VisaTicketConfirm" />)
  popupElements.push(<TicketSubscriptionsPopupsContainer key="TicketSubscriptions" />)
  popupElements.push(<DirectionSubscriptionsPopup key="DirectionSubscriptionsPopup" />)

  if (flagr.is('avs-exp-rentalcarsPopup')) {
    popupElements.push(<RentalcarsPopup key="RentalcarsPopup" />)
  }

  return <React.Suspense fallback={null}>{popupElements}</React.Suspense>
}

PopupsContainer.propTypes = {
  popups: PropTypes.shape({
    hotel: PropTypes.object,
    subscription: PropTypes.object,
    gateFeedback: PropTypes.object,
    iddqd: PropTypes.object,
    savedFilters: PropTypes.object,
    loginForm: PropTypes.object,
  }).isRequired,
}

const mapStateToProps = (state) => ({ popups: state.popups })

export default compose(
  connect(mapStateToProps),
  withFlagr(flagr, ['avs-exp-rentalcarsPopup']),
)(PopupsContainer)
