import {
  SHOW_EMAIL_CHANGE_NOTIFY,
  HIDE_EMAIL_CHANGE_NOTIFY,
  ShowEmailChangeNotifyAction,
  HideEmailChangeNotifyAction,
} from '../types/email_change_notify.types'

export const showEmailChangeNotify = (
  status: 'success' | 'error',
): ShowEmailChangeNotifyAction => ({
  type: SHOW_EMAIL_CHANGE_NOTIFY,
  status,
})

export const hideEmailChangeNotify = (): HideEmailChangeNotifyAction => ({
  type: HIDE_EMAIL_CHANGE_NOTIFY,
})
