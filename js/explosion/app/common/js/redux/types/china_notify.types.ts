export const CLOSE_CHINA_NOTIFY = 'CLOSE_CHINA_NOTIFY'
export const OPEN_CHINA_NOTIFY = 'OPEN_CHINA_NOTIFY'
export const CLOSE_CHINA_INFO_NOTIFY = 'CLOSE_CHINA_INFO_NOTIFY'
export const OPEN_CHINA_INFO_NOTIFY = 'OPEN_CHINA_INFO_NOTIFY'
export const NOT_SHOW_CHINA_NOTIFY_FOR_WEEK = 'NOT_SHOW_CHINA_NOTIFY_FOR_WEEK'
export const CHINA_NOTIFY_BUTTON_CLICK = 'CHINA_NOTIFY_BUTTON_CLICK'
export const SET_CHINA_NOTIFY_SHOWN = 'SET_CHINA_NOTIFY_SHOWN'
export const SET_CHINA_NOTIFY_NOT_SHOWN = 'SET_CHINA_NOTIFY_NOT_SHOWN'

export type CloseChinaNotifyAction = {
  type: typeof CLOSE_CHINA_NOTIFY
}

export type NotShowChinaNotifyForWeekAction = {
  type: typeof NOT_SHOW_CHINA_NOTIFY_FOR_WEEK
}

export type OpenChinaNotifyAction = {
  type: typeof OPEN_CHINA_NOTIFY
}

export type ChinaNotifyButtonClickAction = {
  type: typeof CHINA_NOTIFY_BUTTON_CLICK
}

export type SetChinaNotifyShownAction = {
  type: typeof SET_CHINA_NOTIFY_SHOWN
}

export type SetChinaNotifyNotShownAction = {
  type: typeof SET_CHINA_NOTIFY_NOT_SHOWN
}

export type ChinaNotifyActionTypes =
  | CloseChinaNotifyAction
  | OpenChinaNotifyAction
  | NotShowChinaNotifyForWeekAction
  | ChinaNotifyButtonClickAction
  | CloseChinaInfoNotifyAction
  | OpenChinaInfoNotifyAction
  | SetChinaNotifyShownAction
  | SetChinaNotifyNotShownAction

export interface ChinaNotifyState {
  infoNotify: {
    isVisible: boolean
  }
  warningNotify: {
    isVisible: boolean
    isShown: boolean
  }
}

export type CloseChinaInfoNotifyAction = {
  type: typeof CLOSE_CHINA_INFO_NOTIFY
}

export type OpenChinaInfoNotifyAction = {
  type: typeof OPEN_CHINA_INFO_NOTIFY
}
