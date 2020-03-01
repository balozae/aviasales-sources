export const SET_EMAIL_ACTIVATION = 'SET_EMAIL_ACTIVATION'
export const EMAIL_ACTIVATION_NOTIFY_CLOSE = 'EMAIL_ACTIVATION_NOTIFY_CLOSE'

export type EmailActivationResulStatus =
  | 'invalid_token'
  | 'expired_token'
  | 'internal_error'
  | 'email_conflict'
  | 'ok'

export interface EmailActivationResult {
  status: EmailActivationResulStatus
  email: string | null
  isShown: boolean
}

interface SetEmailActivation {
  type: typeof SET_EMAIL_ACTIVATION
  status: EmailActivationResulStatus
  email: string | null
  isShown: boolean
}

interface EmailActivationNotifyClose {
  type: typeof EMAIL_ACTIVATION_NOTIFY_CLOSE
}

export type EmailActivationActions = SetEmailActivation | EmailActivationNotifyClose

export type EmailActivationState = EmailActivationResult | null
