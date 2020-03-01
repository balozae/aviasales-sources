import {
  ChinaNotifyState,
  ChinaNotifyActionTypes,
  OPEN_CHINA_NOTIFY,
  CLOSE_CHINA_NOTIFY,
  OPEN_CHINA_INFO_NOTIFY,
  CLOSE_CHINA_INFO_NOTIFY,
  SET_CHINA_NOTIFY_SHOWN,
  SET_CHINA_NOTIFY_NOT_SHOWN,
} from '../types/china_notify.types'

const initialState: ChinaNotifyState = Object.freeze({
  infoNotify: {
    isVisible: false,
  },
  warningNotify: {
    isVisible: false,
    isShown: false,
  },
})

export const chinaNotify = (
  state: ChinaNotifyState = initialState,
  action: ChinaNotifyActionTypes,
) => {
  switch (action.type) {
    case CLOSE_CHINA_NOTIFY:
      return {
        ...state,
        warningNotify: {
          ...state.warningNotify,
          isVisible: false,
        },
      }
    case OPEN_CHINA_NOTIFY:
      return {
        ...state,
        warningNotify: {
          ...state.warningNotify,
          isVisible: true,
        },
      }
    case SET_CHINA_NOTIFY_SHOWN:
      return {
        ...state,
        warningNotify: {
          ...state.warningNotify,
          isShown: true,
        },
      }
    case SET_CHINA_NOTIFY_NOT_SHOWN:
      return {
        ...state,
        warningNotify: {
          ...state.warningNotify,
          isShown: false,
        },
      }
    case OPEN_CHINA_INFO_NOTIFY:
      return {
        ...state,
        infoNotify: {
          isVisible: true,
        },
      }
    case CLOSE_CHINA_INFO_NOTIFY:
      return {
        ...state,
        infoNotify: {
          isVisible: false,
        },
      }
    default:
      return state
  }
}
