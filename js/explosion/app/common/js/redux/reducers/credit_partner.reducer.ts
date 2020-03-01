import { CreditPartnerState, UpdateCreditPartnerAction } from '../types/credit_partner.types'

export const initialState: CreditPartnerState = null

export default function(
  state: CreditPartnerState = initialState,
  action: UpdateCreditPartnerAction,
) {
  switch (action.type) {
    case 'UPDATE_CREDIT_PARTNER':
      return action.creditPartner
    default:
      return state
  }
}
