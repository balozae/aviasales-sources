export enum PopupType {
  VisaConfirm = 'visa_confrim',
  DirectionSubscriptions = 'directionSubscriptions',
  GateFeedback = 'gateFeedback',
  LoginForm = 'loginForm',
  Hotel = 'hotel',
  SavedFilters = 'savedFilters',
  RentalCars = 'rentalcars',
  ActivateEmail = 'activateEmail',
}

export const ADD_POPUP = 'ADD_POPUP'
export const REMOVE_POPUP = 'REMOVE_POPUP'

export type AddPopupAction = {
  type: typeof ADD_POPUP
  popupType: PopupType
  data?: any
}

export type RemovePopupAction = {
  type: typeof REMOVE_POPUP
  popupType: PopupType
  data?: any
}

export type PopupActions = AddPopupAction | RemovePopupAction

export type PopupsState = { [key in PopupType]?: any }
