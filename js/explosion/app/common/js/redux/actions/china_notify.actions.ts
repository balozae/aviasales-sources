import {
  OpenChinaNotifyAction,
  OPEN_CHINA_NOTIFY,
  CLOSE_CHINA_NOTIFY,
  CloseChinaNotifyAction,
  NotShowChinaNotifyForWeekAction,
  NOT_SHOW_CHINA_NOTIFY_FOR_WEEK,
  CHINA_NOTIFY_BUTTON_CLICK,
  ChinaNotifyButtonClickAction,
  OPEN_CHINA_INFO_NOTIFY,
  CLOSE_CHINA_INFO_NOTIFY,
  CloseChinaInfoNotifyAction,
  OpenChinaInfoNotifyAction,
  SetChinaNotifyShownAction,
  SET_CHINA_NOTIFY_SHOWN,
  SET_CHINA_NOTIFY_NOT_SHOWN,
  SetChinaNotifyNotShownAction,
} from '../types/china_notify.types'

export const closeChinaNotify = (): CloseChinaNotifyAction => ({
  type: CLOSE_CHINA_NOTIFY,
})

export const openChinaNotify = (): OpenChinaNotifyAction => ({
  type: OPEN_CHINA_NOTIFY,
})

export const notShowChinaNotifyForWeek = (): NotShowChinaNotifyForWeekAction => ({
  type: NOT_SHOW_CHINA_NOTIFY_FOR_WEEK,
})

export const chinaNotifyButtonClick = (): ChinaNotifyButtonClickAction => ({
  type: CHINA_NOTIFY_BUTTON_CLICK,
})

export const setChinaNotifyShown = (): SetChinaNotifyShownAction => ({
  type: SET_CHINA_NOTIFY_SHOWN,
})

export const setChinaNotifyNotShown = (): SetChinaNotifyNotShownAction => ({
  type: SET_CHINA_NOTIFY_NOT_SHOWN,
})

// china info notify
export const closeChinaInfoNotify = (): CloseChinaInfoNotifyAction => ({
  type: CLOSE_CHINA_INFO_NOTIFY,
})

export const openChinaInfoNotify = (): OpenChinaInfoNotifyAction => ({
  type: OPEN_CHINA_INFO_NOTIFY,
})
