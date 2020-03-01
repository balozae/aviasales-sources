import guestia from 'guestia/client'
import i18next from 'i18next'
import flagr from 'common/utils/flagr_client_instance'
import TripParams from 'utils/trip_params.coffee'

interface IterableCurrencies {
  [key: string]: string
}

const CURRENCIES = [
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
  'uzs',
  'tzs',
  'kes',
  'zar',
]

interface CurrenciesSigns {
  before: IterableCurrencies
  after: IterableCurrencies
}
export const CURRENCIES_SIGNS: CurrenciesSigns = {
  before: {
    usd: '$',
    eur: '€',
    cny: '¥',
    uah: '₴',
  },
  after: {
    byn: 'Br',
    thb: '฿',
    rub: '₽',
    azn: '₼',
    kzt: '₸',
    kgs: 'c̲',
    uzs: 'UZS',
    tzs: 'TSh',
    kes: 'KSh',
    zar: 'R',
  },
}

// NOTE on kgs: this is not actual currency symbol (which does not currently exists),
// tslint:disable-next-line:max-line-length
// but a combination of symbols (Unicode combining macron https://en.wikipedia.org/wiki/Underline, https://en.wikipedia.org/wiki/Macron_below)
// Looks fine in browser title, however, when defined in CSS, text-decoration:underline looks better

export const DEFAULT_CURRENCY = 'rub'

interface GetCurrency {
  (): string
  defaultCurrency?: string
}

const getCurrencyFromUrl = () => {
  const urlParams = TripParams.getURLParams()

  if (urlParams.currency) {
    const preparedValue = urlParams.currency.toLowerCase()

    return CURRENCIES.includes(preparedValue) ? preparedValue : undefined
  }
}

export const getCurrency: GetCurrency = () => {
  const currencyFromUrl = getCurrencyFromUrl()
  if (currencyFromUrl) {
    return currencyFromUrl
  }

  const guestiaCurrency = guestia.getSettings('currency')
  if (typeof guestiaCurrency === 'string') {
    return guestiaCurrency.toLowerCase()
  }

  if (!getCurrency.defaultCurrency) {
    getCurrency.defaultCurrency = getMarketDefaultCurrency()
  }

  return getCurrency.defaultCurrency || DEFAULT_CURRENCY
}

export const getMarketDefaultCurrency = () => {
  const rootDataSet = document.documentElement.dataset

  if (rootDataSet && rootDataSet.currency) {
    return rootDataSet.currency.toLowerCase()
  }
}

export const setCurrency = (currency: string) => {
  currency = currency ? currency.toLowerCase() : currency
  guestia.setSettings('currency', currency)
  flagr.updateBasicContext({ currency })
}

export const getCurrenciesList = () => {
  const result = CURRENCIES.reduce(
    (obj, key) => ({
      ...obj,
      [key]: {
        symbol: CURRENCIES_SIGNS.before[key] || CURRENCIES_SIGNS.after[key],
        title: i18next.t(`currencies:currencies.${key}`),
      },
    }),
    {},
  )
  return result
}
