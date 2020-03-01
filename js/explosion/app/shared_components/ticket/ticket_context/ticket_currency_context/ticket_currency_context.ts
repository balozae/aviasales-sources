import { createContext } from 'react'

export type Currency = string

export type Currencies = { [key in string]: number }

interface TicketCurrencyContext {
  currency: Currency
  currencies: Currencies
  currenciesList?: Array<string>
}

export const defaultCurrenciesList: Currency[] = [
  'rub',
  'eur',
  'usd',
  'cny',
  'uah',
  'kzt',
  'azn',
  'byn',
  'thb',
  'kgs',
]

export const defaultTicketPriceContext: TicketCurrencyContext = {
  currency: 'rub',
  currencies: defaultCurrenciesList.reduce((acc, currency: Currency) => {
    return { ...acc, [currency]: -9999 }
  }, {}) as Currencies,
  currenciesList: defaultCurrenciesList,
}

const TicketCurrencyContext = createContext(defaultTicketPriceContext)

export default TicketCurrencyContext
