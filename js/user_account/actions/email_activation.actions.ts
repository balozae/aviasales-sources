import {
  EmailActivationResulStatus,
  EmailActivationActions,
  SET_EMAIL_ACTIVATION,
  EMAIL_ACTIVATION_NOTIFY_CLOSE,
} from 'user_account/types/email_activation.types'

export const setEmailActivation = (
  status: EmailActivationResulStatus,
  email: string | null = null,
  isShown: boolean,
): EmailActivationActions => ({ type: SET_EMAIL_ACTIVATION, status, email, isShown })

export const emailActivationNotifyClose = (): EmailActivationActions => ({
  type: EMAIL_ACTIVATION_NOTIFY_CLOSE,
})
