import {
  EmailChangeNotifyState,
  EmailChangeNotifyActionTypes,
  SHOW_EMAIL_CHANGE_NOTIFY,
  HIDE_EMAIL_CHANGE_NOTIFY,
} from '../types/email_change_notify.types'

const initialState: EmailChangeNotifyState = { visible: false }

export default function(
  state: EmailChangeNotifyState = initialState,
  action: EmailChangeNotifyActionTypes,
): EmailChangeNotifyState {
  switch (action.type) {
    case SHOW_EMAIL_CHANGE_NOTIFY:
      return { visible: true, status: action.status }
    case HIDE_EMAIL_CHANGE_NOTIFY:
      return { ...state, visible: false }
    default:
      return state
  }
}
