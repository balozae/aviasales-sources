export const CLOSE_UNCHECK_VISA_FILTER_NOTIFY = 'CLOSE_UNCHECK_VISA_FILTER_NOTIFY'
export const OPEN_UNCHECK_VISA_FILTER_NOTIFY = 'OPEN_UNCHECK_VISA_FILTER_NOTIFY'
export const NEVER_SHOW_UNCHECK_VISA_FILTER_NOTIFY = 'NEVER_SHOW_UNCHECK_VISA_FILTER_NOTIFY'

export type CloseUncheckVisaFilterNotifyAction = {
  type: typeof CLOSE_UNCHECK_VISA_FILTER_NOTIFY
}

export type NeverShowUncheckVisaFilterNotifyAction = {
  type: typeof NEVER_SHOW_UNCHECK_VISA_FILTER_NOTIFY
}

export type OpenUncheckVisaFilterNotifyAction = {
  type: typeof OPEN_UNCHECK_VISA_FILTER_NOTIFY
  countries: UncheckVisaFilterNotifyState['countries']
}

export type UncheckVisaFilterNotifyActionTypes =
  | CloseUncheckVisaFilterNotifyAction
  | OpenUncheckVisaFilterNotifyAction
  | NeverShowUncheckVisaFilterNotifyAction

export interface UncheckVisaFilterNotifyState {
  isShow: boolean
  isNeverShow: boolean
  countries: string[]
}
