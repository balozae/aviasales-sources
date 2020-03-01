export const UPDATE_CURRENCY = 'UPDATE_CURRENCY'

interface UpdateCurrencyAction {
  type: typeof UPDATE_CURRENCY
  currency: string
}

export type CurrencyActions = UpdateCurrencyAction

export type CurrencyState = string
