import {
  UncheckVisaFilterNotifyState,
  UncheckVisaFilterNotifyActionTypes,
} from '../types/uncheck_visa_filter_notify.types'

export const initialState: UncheckVisaFilterNotifyState = Object.freeze({
  isShow: false,
  isNeverShow: false,
  countries: [],
})

export default function(
  state: UncheckVisaFilterNotifyState = initialState,
  action: UncheckVisaFilterNotifyActionTypes,
) {
  switch (action.type) {
    case 'CLOSE_UNCHECK_VISA_FILTER_NOTIFY':
      return { ...initialState }
    case 'OPEN_UNCHECK_VISA_FILTER_NOTIFY':
      return {
        ...state,
        isShow: true,
        countries: action.countries,
      }
    case 'NEVER_SHOW_UNCHECK_VISA_FILTER_NOTIFY':
      return {
        ...state,
        isNeverShow: true,
      }
    default:
      return state
  }
}
