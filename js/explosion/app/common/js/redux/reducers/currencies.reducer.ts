import { CurrenciesState, UpdateCurrenciesAction } from '../types/currencies.types'

export const initialState: CurrenciesState = Object.freeze({})

export default function(state: CurrenciesState = initialState, action: UpdateCurrenciesAction) {
  switch (action.type) {
    case 'UPDATE_CURRENCIES':
      return action.currencies
    default:
      return state
  }
}
