import { getCurrency } from 'common/utils/currencies'
import { CurrencyState, CurrencyActions, UPDATE_CURRENCY } from '../types/currency.types'

export const initialState: CurrencyState = getCurrency()

export default (state: CurrencyState = initialState, action: CurrencyActions) => {
  switch (action.type) {
    case UPDATE_CURRENCY:
      return action.currency
    default:
      return state
  }
}
