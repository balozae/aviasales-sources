import { Dispatch } from 'redux'
import { ThunkAction } from 'redux-thunk'
import flagr from 'common/utils/flagr_client_instance'
import { PopupActions, ADD_POPUP, PopupType, REMOVE_POPUP } from '../types/popups.types'
import { AppState } from '../types/root/explosion'

const ANNOYING_POPUPS = [
  // PopupType.VisaConfirm, // NOTE: is disabled at ticket_buy_click saga
  PopupType.GateFeedback,
  PopupType.Hotel,
  PopupType.RentalCars,
]

export const addPopup = ({
  popupType,
  params,
}: {
  popupType: PopupType
  params?: any
}): ThunkAction<void, AppState, void, PopupActions> => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  // NOTE: disable annoying popups for debugging
  const turnOffAnnoyingPopups = getState().debugSettings.turnOffAnnoyingPopups
  if (turnOffAnnoyingPopups && ANNOYING_POPUPS.includes(popupType)) {
    return
  }

  if (popupType === PopupType.DirectionSubscriptions && !flagr.is('avs-feat-subscription')) {
    return
  }

  dispatch({ type: ADD_POPUP, popupType, data: params })
}

export const removePopup = (popupType: PopupType, data?: any) => ({
  type: REMOVE_POPUP,
  popupType,
  data,
})
