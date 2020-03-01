export const SHOW_EMAIL_CHANGE_NOTIFY = 'SHOW_EMAIL_CHANGE_NOTIFY'
export const HIDE_EMAIL_CHANGE_NOTIFY = 'HIDE_EMAIL_CHANGE_NOTIFY'

export type EmailChangeNotifyState = {
  visible: boolean
  status?: 'success' | 'error'
}

export type ShowEmailChangeNotifyAction = {
  type: typeof SHOW_EMAIL_CHANGE_NOTIFY
  status: 'success' | 'error'
}

export type HideEmailChangeNotifyAction = {
  type: typeof HIDE_EMAIL_CHANGE_NOTIFY
}

export type EmailChangeNotifyActionTypes = ShowEmailChangeNotifyAction | HideEmailChangeNotifyAction
