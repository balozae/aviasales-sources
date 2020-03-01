import {
  UncheckVisaFilterNotifyState,
  OPEN_UNCHECK_VISA_FILTER_NOTIFY,
  CLOSE_UNCHECK_VISA_FILTER_NOTIFY,
  NEVER_SHOW_UNCHECK_VISA_FILTER_NOTIFY,
  CloseUncheckVisaFilterNotifyAction,
  OpenUncheckVisaFilterNotifyAction,
  NeverShowUncheckVisaFilterNotifyAction,
} from '../types/uncheck_visa_filter_notify.types'

export const closeUncheckVisaFilterNotify = (): CloseUncheckVisaFilterNotifyAction => ({
  type: CLOSE_UNCHECK_VISA_FILTER_NOTIFY,
})

export const openUncheckVisaFilterNotify = (
  countries: UncheckVisaFilterNotifyState['countries'],
): OpenUncheckVisaFilterNotifyAction => ({
  type: OPEN_UNCHECK_VISA_FILTER_NOTIFY,
  countries,
})

export const neverShowUncheckVisaFilterNotify = (): NeverShowUncheckVisaFilterNotifyAction => ({
  type: NEVER_SHOW_UNCHECK_VISA_FILTER_NOTIFY,
})
