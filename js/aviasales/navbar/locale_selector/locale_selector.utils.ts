import i18next from 'i18next'
import { getCurrenciesList } from 'common/utils/currencies'
import flagr from 'common/utils/flagr_client_instance'
import { LocaleData } from './locale_selector.types'
import { SelectListData } from './select_list/select_list.types'

// TODO: sort currencies
export const getCurrencies = (): SelectListData => {
  const currencies: SelectListData = []
  const CURRENCIES = getCurrenciesList()

  Object.keys(CURRENCIES).forEach((key) => {
    currencies.push({ value: key, label: key, text: CURRENCIES[key].title })
  })

  return currencies
}

// TODO: get languages from Helios or somewhere
// TODO: sort languages
export const getLanguages = (): SelectListData => {
  const defaultLangs = [
    { value: 'ru', label: 'RU', text: 'Русский' },
    { value: 'en', label: 'EN', text: 'English' },
    { value: 'uk', label: 'UA', text: 'Українська' },
    { value: 'th', label: 'TH', text: 'ภาษาไทย' },
    { value: 'uz', label: 'UZ', text: 'Oʻzbek' },
    { value: 'kk', label: 'KZ', text: 'Қазақша' },
    { value: 'az', label: 'AZ', text: 'Azərbaycan dili' },
  ]

  try {
    if (window.availableLangs.length) {
      return window.availableLangs
    }

    return defaultLangs
  } catch (e) {
    return defaultLangs
  }
}

// TODO: get countries from Helios or somewhere
// TODO: sort countries
export const getCountries = (): SelectListData => {
  return [
    { value: 'by', label: 'BY', text: i18next.t('countries:countries.by'), link: '#' },
    { value: 'de', label: 'DE', text: i18next.t('countries:countries.de'), link: '#' },
    { value: 'es', label: 'ES', text: i18next.t('countries:countries.es'), link: '#' },
    { value: 'it', label: 'IT', text: i18next.t('countries:countries.it'), link: '#' },
    { value: 'kz', label: 'KZ', text: i18next.t('countries:countries.kz'), link: '#' },
    { value: 'kg', label: 'KG', text: i18next.t('countries:countries.kg'), link: '#' },
    { value: 'ru', label: 'RU', text: i18next.t('countries:countries.ru'), link: '#' },
    { value: 'us', label: 'US', text: i18next.t('countries:countries.us'), link: '#' },
    { value: 'th', label: 'TH', text: i18next.t('countries:countries.th'), link: '#' },
    { value: 'uz', label: 'UZ', text: i18next.t('countries:countries.uz'), link: '#' },
    { value: 'ua', label: 'UA', text: i18next.t('countries:countries.ua'), link: '#' },
    { value: 'fr', label: 'FR', text: i18next.t('countries:countries.fr'), link: '#' },
  ]
}

export const getLocaleData = (): LocaleData => {
  return {
    currency: flagr.is('avs-feat-currencySwitcher') ? getCurrencies() : undefined,
    language: flagr.is('avs-feat-langSwitcher') ? getLanguages() : undefined,
    // country: getCountries(),
  }
}
