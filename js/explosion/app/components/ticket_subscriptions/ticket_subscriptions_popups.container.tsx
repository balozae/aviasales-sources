import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'common/js/redux/types/root/explosion'
import { Dispatch } from 'redux'
import { getPopupDataByType } from 'common/js/redux/selectors/popups.selectors'
import { PopupType } from 'common/js/redux/types/popups.types'
import {
  activateEmailSubmit,
  activateEmailPopupClose,
  activateEmailSuccessPopupClose,
} from 'common/js/redux/actions/ticket_subscriptions.actions'
import ActivateEmailPopup from './activate_email_popup'
import { getUserEmail } from 'user_account/selectors/user.selectors'
import SuccessActionationPopup from './success_activation_popup'

interface OwnProps {}
interface StateProps {
  defaultEmail: string
  activatePopup: boolean
  successPopup: boolean
}
interface DispatchProps {
  onEmailSubmit: typeof activateEmailSubmit
  onEmailPopupClose: typeof activateEmailPopupClose
  onSuccessPopupClose: typeof activateEmailSuccessPopupClose
}

type Props = OwnProps & StateProps & DispatchProps

const TicketSubscriptionsPopupsContainer: React.FC<Props> = (props) => {
  return (
    <>
      <ActivateEmailPopup
        defaultEmail={props.defaultEmail}
        onClose={props.onEmailPopupClose}
        visible={props.activatePopup}
        onSubmit={props.onEmailSubmit}
      />
      <SuccessActionationPopup visible={props.successPopup} onClose={props.onSuccessPopupClose} />
    </>
  )
}

const mapStateToProps = (state: AppState): StateProps => {
  const popup = getPopupDataByType(state, PopupType.ActivateEmail)
  const successPopup = popup && popup.showSuccess === true
  const activatePopup = popup && !successPopup

  return {
    activatePopup,
    successPopup,
    defaultEmail: getUserEmail(state) || '',
  }
}
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onEmailSubmit: (email: string) => dispatch(activateEmailSubmit(email)),
  onEmailPopupClose: () => dispatch(activateEmailPopupClose()),
  onSuccessPopupClose: () => dispatch(activateEmailSuccessPopupClose()),
})

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(TicketSubscriptionsPopupsContainer)
