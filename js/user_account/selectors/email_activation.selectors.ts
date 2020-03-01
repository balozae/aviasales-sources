import { AppStateUA } from 'user_account/types/app.types'

export const getEmailActivationResult = (state: AppStateUA) => state.emailActivation

export const getEmailActivationIsShown = (state: AppStateUA): boolean =>
  (state.emailActivation && state.emailActivation.isShown) || false
